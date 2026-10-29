import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import {
  CertificateAuditAction,
  EnrollmentStatus,
  Prisma,
  QuizType,
  Role,
} from '@prisma/client';
import { randomBytes } from 'crypto';
import { PrismaService } from '../prisma/prisma.service';

type QuizQuestionInput = {
  question: string;
  options: Array<{ id: string; text: string }>;
  correctAnswer: string;
};

type QuizInput = {
  type?: QuizType;
  moduleId?: string | null;
  passingGrade?: number;
  maxAttempts?: number;
  questions?: QuizQuestionInput[];
};

type QuizAnswer = { questionId: string; answer: string };

@Injectable()
export class QuizzesService {
  constructor(private readonly prisma: PrismaService) {}

  async submitQuiz(userId: string, quizId: string, userAnswers: QuizAnswer[]) {
    if (!Array.isArray(userAnswers))
      throw new BadRequestException('Jawaban kuis tidak valid');

    try {
      return await this.prisma.$transaction(
        async (transaction) => {
          const quiz = await transaction.quiz.findUnique({
            where: { id: quizId },
            include: { questions: true },
          });
          if (!quiz) throw new NotFoundException('Kuis tidak ditemukan');
          if (!quiz.questions.length)
            throw new BadRequestException('Kuis belum memiliki soal');

          const enrollment = await transaction.enrollment.findUnique({
            where: { userId_classId: { userId, classId: quiz.classId } },
            include: {
              class: { select: { modules: { select: { id: true } } } },
              progresses: { select: { moduleId: true, status: true } },
            },
          });
          if (!enrollment || enrollment.status !== EnrollmentStatus.ACTIVE) {
            throw new ForbiddenException(
              'Enrollment aktif diperlukan untuk mengerjakan kuis',
            );
          }

          if (quiz.type === QuizType.FINAL) {
            const completedModules = new Set(
              enrollment.progresses
                .filter((progress) => progress.status === 'COMPLETED')
                .map((progress) => progress.moduleId),
            );
            if (
              !enrollment.class.modules.length ||
              enrollment.class.modules.some(
                (module) => !completedModules.has(module.id),
              )
            ) {
              throw new ForbiddenException(
                'Selesaikan semua modul sebelum mengerjakan kuis akhir',
              );
            }
          } else if (
            !quiz.moduleId ||
            !enrollment.progresses.some(
              (progress) => progress.moduleId === quiz.moduleId,
            )
          ) {
            throw new ForbiddenException(
              'Modul kuis tidak termasuk dalam enrollment ini',
            );
          }

          const answerIds = userAnswers.map((answer) => answer.questionId);
          const expectedIds = new Set(
            quiz.questions.map((question) => question.id),
          );
          if (
            userAnswers.length !== quiz.questions.length ||
            new Set(answerIds).size !== answerIds.length ||
            answerIds.some((questionId) => !expectedIds.has(questionId)) ||
            userAnswers.some((answer) => !answer.answer)
          ) {
            throw new BadRequestException('Jawab setiap soal tepat satu kali');
          }

          const pastAttempts = await transaction.quizAttempt.count({
            where: { userId, quizId },
          });
          if (pastAttempts >= quiz.maxAttempts) {
            throw new BadRequestException(
              'Batas maksimal percobaan kuis telah habis',
            );
          }

          const answerMap = new Map(
            userAnswers.map((answer) => [answer.questionId, answer.answer]),
          );
          const correctCount = quiz.questions.filter(
            (question) => answerMap.get(question.id) === question.correctAnswer,
          ).length;
          const score = Math.round(
            (correctCount / quiz.questions.length) * 100,
          );
          const isPassed = score >= quiz.passingGrade;
          const attempt = await transaction.quizAttempt.create({
            data: {
              quizId,
              userId,
              score,
              isPassed,
              attemptNumber: pastAttempts + 1,
            },
          });

          let certificate = null;
          if (isPassed && quiz.type === QuizType.FINAL) {
            certificate = await transaction.certificate.findUnique({
              where: { userId_classId: { userId, classId: quiz.classId } },
            });
            if (!certificate) {
              certificate = await transaction.certificate.create({
                data: {
                  userId,
                  classId: quiz.classId,
                  verificationCode: randomBytes(16)
                    .toString('hex')
                    .toUpperCase(),
                },
              });
              await transaction.certificateAudit.create({
                data: {
                  certificateId: certificate.id,
                  actorId: userId,
                  action: CertificateAuditAction.ISSUED,
                  reason: 'Kelas diselesaikan dan kuis akhir lulus',
                },
              });
            }
          }

          return { attempt, certificate };
        },
        { isolationLevel: Prisma.TransactionIsolationLevel.Serializable },
      );
    } catch (error) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        (error.code === 'P2002' || error.code === 'P2034')
      ) {
        throw new ConflictException(
          'Percobaan kuis bersamaan terdeteksi. Silakan coba kembali.',
        );
      }
      throw error;
    }
  }

  async createQuiz(
    actorId: string,
    actorRole: Role,
    classId: string,
    data: QuizInput,
  ) {
    const type = data.type || QuizType.FINAL;
    const moduleId = type === QuizType.MODULE ? data.moduleId : null;
    const passingGrade = Number(data.passingGrade ?? 70);
    const maxAttempts = Number(data.maxAttempts ?? 3);
    const questions = data.questions;

    if (!Object.values(QuizType).includes(type))
      throw new BadRequestException('Tipe kuis tidak valid');
    if (
      !Number.isInteger(passingGrade) ||
      passingGrade < 1 ||
      passingGrade > 100
    ) {
      throw new BadRequestException('Passing grade harus antara 1 dan 100');
    }
    if (!Number.isInteger(maxAttempts) || maxAttempts < 1) {
      throw new BadRequestException('Batas percobaan minimal 1');
    }
    if (!questions?.length)
      throw new BadRequestException('Kuis harus memiliki soal');
    for (const question of questions) {
      const optionIds = question.options?.map((option) => option.id) || [];
      if (
        !question.question?.trim() ||
        optionIds.length < 2 ||
        new Set(optionIds).size !== optionIds.length ||
        !question.options.every((option) => option.id && option.text?.trim()) ||
        !optionIds.includes(question.correctAnswer)
      ) {
        throw new BadRequestException(
          'Soal harus memiliki minimal dua opsi dan jawaban benar yang valid',
        );
      }
    }

    const course = await this.prisma.class.findUnique({
      where: { id: classId },
      select: { id: true, instructorId: true },
    });
    if (!course) throw new NotFoundException('Kelas tidak ditemukan');
    if (actorRole !== Role.ADMIN && course.instructorId !== actorId) {
      throw new ForbiddenException('Anda tidak memiliki akses ke kelas ini');
    }
    if (type === QuizType.MODULE) {
      if (!moduleId)
        throw new BadRequestException('Kuis modul memerlukan moduleId');
      const module = await this.prisma.module.findFirst({
        where: { id: moduleId, classId },
      });
      if (!module)
        throw new NotFoundException('Modul tidak ditemukan di kelas ini');
    }

    const existing = await this.prisma.quiz.findFirst({
      where: { classId, type, moduleId },
      select: { id: true },
    });

    return this.prisma.$transaction(async (transaction) => {
      const quiz = existing
        ? await transaction.quiz.update({
            where: { id: existing.id },
            data: { passingGrade, maxAttempts },
          })
        : await transaction.quiz.create({
            data: { classId, type, moduleId, passingGrade, maxAttempts },
          });

      await transaction.quizQuestion.deleteMany({ where: { quizId: quiz.id } });
      await transaction.quizQuestion.createMany({
        data: questions.map((question) => ({
          quizId: quiz.id,
          question: question.question.trim(),
          options: question.options,
          correctAnswer: question.correctAnswer,
        })),
      });

      return transaction.quiz.findUniqueOrThrow({
        where: { id: quiz.id },
        include: { questions: true },
      });
    });
  }

  async getQuizForStudent(
    userId: string,
    classId: string,
    type: QuizType,
    moduleId?: string,
  ) {
    const enrollment = await this.prisma.enrollment.findUnique({
      where: { userId_classId: { userId, classId } },
      include: {
        class: { select: { modules: { select: { id: true } } } },
        progresses: true,
      },
    });
    if (!enrollment || enrollment.status !== EnrollmentStatus.ACTIVE) {
      throw new ForbiddenException(
        'Enrollment aktif diperlukan untuk mengakses kuis',
      );
    }
    if (
      type === QuizType.FINAL &&
      (!enrollment.class.modules.length ||
        enrollment.class.modules.some(
          (module) =>
            !enrollment.progresses.some(
              (progress) =>
                progress.moduleId === module.id &&
                progress.status === 'COMPLETED',
            ),
        ))
    ) {
      throw new ForbiddenException(
        'Selesaikan semua modul sebelum mengerjakan kuis akhir',
      );
    }

    const quiz = await this.prisma.quiz.findFirst({
      where: {
        classId,
        type,
        moduleId: type === QuizType.MODULE ? moduleId : null,
      },
      select: {
        id: true,
        type: true,
        moduleId: true,
        passingGrade: true,
        maxAttempts: true,
        questions: { select: { id: true, question: true, options: true } },
      },
    });
    if (!quiz)
      throw new NotFoundException('Kuis belum tersedia untuk materi ini');
    return quiz;
  }

  async getModuleQuizForStudent(userId: string, moduleId: string) {
    const module = await this.prisma.module.findUnique({
      where: { id: moduleId },
      select: { classId: true },
    });
    if (!module) throw new NotFoundException('Modul tidak ditemukan');
    return this.getQuizForStudent(
      userId,
      module.classId,
      QuizType.MODULE,
      moduleId,
    );
  }

  async getQuizForInstructor(
    actorId: string,
    actorRole: Role,
    classId: string,
    type: QuizType,
    moduleId?: string,
  ) {
    const course = await this.prisma.class.findUnique({
      where: { id: classId },
      select: { instructorId: true },
    });
    if (!course) throw new NotFoundException('Kelas tidak ditemukan');
    if (actorRole !== Role.ADMIN && course.instructorId !== actorId) {
      throw new ForbiddenException('Anda tidak memiliki akses ke kelas ini');
    }

    return this.prisma.quiz.findFirst({
      where: {
        classId,
        type,
        moduleId: type === QuizType.MODULE ? moduleId : null,
      },
      include: { questions: true },
    });
  }
}
