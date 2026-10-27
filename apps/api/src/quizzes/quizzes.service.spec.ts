import { ForbiddenException } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { EnrollmentStatus, ProgressStatus, QuizType } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { QuizzesService } from './quizzes.service';

describe('QuizzesService', () => {
  let service: QuizzesService;
  const transaction = {
    quiz: { findUnique: jest.fn() },
    enrollment: { findUnique: jest.fn() },
    quizAttempt: { count: jest.fn(), create: jest.fn() },
    certificate: { findUnique: jest.fn(), create: jest.fn() },
    certificateAudit: { create: jest.fn() },
  };
  const prisma = {
    $transaction: jest.fn(),
  };

  beforeEach(async () => {
    jest.clearAllMocks();
    prisma.$transaction.mockImplementation(
      (callback: (tx: typeof transaction) => Promise<unknown>) => callback(transaction),
    );
    const moduleRef = await Test.createTestingModule({
      providers: [
        QuizzesService,
        { provide: PrismaService, useValue: prisma },
      ],
    }).compile();
    service = moduleRef.get(QuizzesService);
  });

  it('requires every module to be complete before a final quiz attempt', async () => {
    transaction.quiz.findUnique.mockResolvedValue({
      id: 'quiz-1',
      classId: 'class-1',
      type: QuizType.FINAL,
      questions: [{ id: 'question-1', correctAnswer: 'a' }],
      passingGrade: 70,
      maxAttempts: 3,
    });
    transaction.enrollment.findUnique.mockResolvedValue({
      status: EnrollmentStatus.ACTIVE,
      class: { modules: [{ id: 'module-1' }] },
      progresses: [{ moduleId: 'module-1', status: ProgressStatus.IN_PROGRESS }],
    });

    await expect(
      service.submitQuiz('user-1', 'quiz-1', [{ questionId: 'question-1', answer: 'a' }]),
    ).rejects.toBeInstanceOf(ForbiddenException);
    expect(transaction.quizAttempt.create).not.toHaveBeenCalled();
  });

  it('issues and audits a certificate after a passing final attempt', async () => {
    const certificate = { id: 'certificate-1', verificationCode: 'CODE' };
    transaction.quiz.findUnique.mockResolvedValue({
      id: 'quiz-1',
      classId: 'class-1',
      type: QuizType.FINAL,
      questions: [{ id: 'question-1', correctAnswer: 'a' }],
      passingGrade: 70,
      maxAttempts: 3,
    });
    transaction.enrollment.findUnique.mockResolvedValue({
      status: EnrollmentStatus.ACTIVE,
      class: { modules: [{ id: 'module-1' }] },
      progresses: [{ moduleId: 'module-1', status: ProgressStatus.COMPLETED }],
    });
    transaction.quizAttempt.count.mockResolvedValue(0);
    transaction.quizAttempt.create.mockResolvedValue({ isPassed: true, score: 100 });
    transaction.certificate.findUnique.mockResolvedValue(null);
    transaction.certificate.create.mockResolvedValue(certificate);

    await expect(
      service.submitQuiz('user-1', 'quiz-1', [{ questionId: 'question-1', answer: 'a' }]),
    ).resolves.toEqual({
      attempt: { isPassed: true, score: 100 },
      certificate,
    });
    expect(transaction.certificateAudit.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          certificateId: certificate.id,
          actorId: 'user-1',
          action: 'ISSUED',
        }),
      }),
    );
  });
});
