import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
  ServiceUnavailableException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  CertificateAuditAction,
  EnrollmentStatus,
  PaymentAuditAction,
  PaymentStatus,
  Prisma,
  ProgressStatus,
} from '@prisma/client';
import PDFDocument from 'pdfkit';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class EnrollmentsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly config: ConfigService,
  ) {}

  async enroll(userId: string, classId: string) {
    const course = await this.prisma.class.findUnique({
      where: { id: classId },
      include: { modules: { select: { id: true } } },
    });
    if (!course || course.status !== 'PUBLISHED')
      throw new NotFoundException('Kelas tidak ditemukan');

    const existing = await this.prisma.enrollment.findUnique({
      where: { userId_classId: { userId, classId } },
    });
    if (existing)
      throw new ConflictException('Anda sudah terdaftar di kelas ini');

    const isFree = Number(course.price) === 0;
    if (!isFree) this.assertPaymentsEnabled();
    return this.prisma.$transaction(async (transaction) => {
      const enrollment = await transaction.enrollment.create({
        data: {
          userId,
          classId,
          status: isFree ? EnrollmentStatus.ACTIVE : EnrollmentStatus.PENDING,
          progresses: {
            create: course.modules.map((module) => ({ moduleId: module.id })),
          },
        },
      });

      if (!isFree) {
        await transaction.payment.create({
          data: {
            enrollmentId: enrollment.id,
            amount: course.price,
            method: 'MANUAL_TRANSFER',
            status: 'PENDING',
          },
        });
      }

      return enrollment;
    });
  }

  async getEnrollmentDetails(userId: string, classId: string) {
    const enrollment = await this.prisma.enrollment.findUnique({
      where: { userId_classId: { userId, classId } },
      include: {
        class: {
          include: {
            modules: {
              orderBy: { order: 'asc' },
              include: { quiz: { select: { id: true } } },
            },
          },
        },
        progresses: true,
      },
    });
    if (!enrollment)
      throw new NotFoundException('Anda belum terdaftar di kelas ini');

    const modules =
      enrollment.status === EnrollmentStatus.ACTIVE
        ? enrollment.class.modules
        : enrollment.class.modules.filter((module) => module.isFreePreview);
    const completedCount = enrollment.progresses.filter(
      (progress) => progress.status === ProgressStatus.COMPLETED,
    ).length;

    return {
      ...enrollment,
      class: { ...enrollment.class, modules },
      progressPercent: this.progressPercent(
        completedCount,
        enrollment.class.modules.length,
      ),
      lastModuleId: [...enrollment.progresses]
        .sort(
          (left, right) =>
            (right.lastAccessedAt?.getTime() || 0) -
            (left.lastAccessedAt?.getTime() || 0),
        )
        .find((progress) => progress.lastAccessedAt)?.moduleId,
    };
  }

  async updateProgress(
    userId: string,
    enrollmentId: string,
    moduleId: string,
    status: 'IN_PROGRESS' | 'COMPLETED',
  ) {
    if (status !== 'IN_PROGRESS' && status !== 'COMPLETED') {
      throw new BadRequestException('Status progress tidak valid');
    }

    const enrollment = await this.prisma.enrollment.findUnique({
      where: { id: enrollmentId, userId },
      include: { class: { include: { modules: { select: { id: true } } } } },
    });
    if (!enrollment) throw new NotFoundException('Enrollment tidak ditemukan');
    if (enrollment.status !== EnrollmentStatus.ACTIVE) {
      throw new ForbiddenException('Pembayaran kelas belum dikonfirmasi');
    }
    if (!enrollment.class.modules.some((module) => module.id === moduleId)) {
      throw new NotFoundException('Modul tidak ditemukan di kelas ini');
    }

    if (status === 'COMPLETED') {
      const quiz = await this.prisma.quiz.findUnique({ where: { moduleId } });
      if (quiz) {
        const passedAttempt = await this.prisma.quizAttempt.findFirst({
          where: { quizId: quiz.id, userId, isPassed: true },
        });
        if (!passedAttempt) {
          throw new BadRequestException(
            'Lulus kuis modul sebelum menandai modul selesai',
          );
        }
      }
    }

    return this.prisma.moduleProgress.upsert({
      where: { enrollmentId_moduleId: { enrollmentId, moduleId } },
      create: {
        enrollmentId,
        moduleId,
        status,
        lastAccessedAt: new Date(),
        completedAt: status === 'COMPLETED' ? new Date() : null,
      },
      update: {
        status,
        lastAccessedAt: new Date(),
        ...(status === 'COMPLETED' ? { completedAt: new Date() } : {}),
      },
    });
  }

  async getMyEnrollments(userId: string) {
    const enrollments = await this.prisma.enrollment.findMany({
      where: { userId },
      include: {
        class: {
          select: {
            id: true,
            title: true,
            slug: true,
            thumbnail: true,
            description: true,
            _count: { select: { modules: true } },
          },
        },
        progresses: true,
      },
      orderBy: { enrolledAt: 'desc' },
    });

    return enrollments.map((enrollment) => {
      const completedCount = enrollment.progresses.filter(
        (progress) => progress.status === ProgressStatus.COMPLETED,
      ).length;
      const { _count, ...course } = enrollment.class;
      const lastModule = [...enrollment.progresses]
        .sort(
          (left, right) =>
            (right.lastAccessedAt?.getTime() || 0) -
            (left.lastAccessedAt?.getTime() || 0),
        )
        .find((progress) => progress.lastAccessedAt);

      return {
        ...enrollment,
        class: course,
        progressPercent: this.progressPercent(completedCount, _count.modules),
        lastModuleId: lastModule?.moduleId,
      };
    });
  }

  async getMyCertificates(userId: string) {
    return this.prisma.certificate.findMany({
      where: { userId },
      include: {
        class: { select: { id: true, title: true, thumbnail: true } },
      },
      orderBy: { issuedAt: 'desc' },
    });
  }

  async getMyPayments(userId: string) {
    return this.prisma.payment.findMany({
      where: { enrollment: { userId } },
      include: {
        enrollment: {
          include: {
            class: { select: { title: true, price: true, thumbnail: true } },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async getPaymentsForAdmin() {
    return this.prisma.payment.findMany({
      include: {
        enrollment: {
          include: {
            user: { select: { id: true, name: true, email: true } },
            class: { select: { id: true, title: true, price: true } },
          },
        },
        confirmedBy: { select: { id: true, name: true, email: true } },
        audits: {
          include: { actor: { select: { id: true, name: true } } },
          orderBy: { createdAt: 'desc' },
        },
      },
      orderBy: [{ status: 'asc' }, { updatedAt: 'desc' }],
    });
  }

  async uploadPaymentProof(
    userId: string,
    paymentId: string,
    proofUrl: string,
  ) {
    this.assertPaymentsEnabled();
    let parsedUrl: URL;
    try {
      parsedUrl = new URL(proofUrl);
    } catch {
      throw new BadRequestException('URL bukti pembayaran tidak valid');
    }
    if (
      parsedUrl.protocol !== 'https:' ||
      parsedUrl.username ||
      parsedUrl.password ||
      parsedUrl.hostname === 'localhost'
    ) {
      throw new BadRequestException(
        'URL bukti pembayaran harus menggunakan HTTPS',
      );
    }
    const payment = await this.prisma.payment.findFirst({
      where: {
        id: paymentId,
        enrollment: { userId, status: EnrollmentStatus.PENDING },
      },
    });
    if (!payment) throw new NotFoundException('Tagihan tidak ditemukan');
    if (
      payment.status !== PaymentStatus.PENDING &&
      payment.status !== PaymentStatus.FAILED
    ) {
      throw new BadRequestException(
        'Tagihan ini tidak menerima bukti pembayaran baru',
      );
    }
    if (payment.status === PaymentStatus.PENDING && payment.proofUrl) {
      throw new ConflictException('Bukti sedang menunggu verifikasi admin');
    }

    return this.prisma.$transaction(async (transaction) => {
      const updated = await transaction.payment.update({
        where: { id: paymentId },
        data: {
          proofUrl: parsedUrl.toString(),
          status: PaymentStatus.PENDING,
          confirmedById: null,
          confirmedAt: null,
          reviewedAt: null,
          reviewReason: null,
        },
      });
      await transaction.paymentAudit.create({
        data: {
          paymentId,
          actorId: userId,
          action: PaymentAuditAction.SUBMITTED,
        },
      });
      return updated;
    });
  }

  async reviewPayment(
    paymentId: string,
    adminId: string,
    approved: boolean,
    reason: string,
  ) {
    this.assertPaymentsEnabled();
    if (typeof approved !== 'boolean') {
      throw new BadRequestException('Keputusan pembayaran tidak valid');
    }
    if (!approved && !reason.trim()) {
      throw new BadRequestException('Alasan penolakan wajib diisi');
    }
    const status = approved ? PaymentStatus.SUCCESS : PaymentStatus.FAILED;
    const action = approved
      ? PaymentAuditAction.APPROVED
      : PaymentAuditAction.REJECTED;

    try {
      return await this.prisma.$transaction(
        async (transaction) => {
          const payment = await transaction.payment.findUnique({
            where: { id: paymentId },
            include: { enrollment: true },
          });
          if (!payment) throw new NotFoundException('Tagihan tidak ditemukan');
          if (
            payment.status !== PaymentStatus.PENDING ||
            !payment.proofUrl ||
            payment.enrollment.status !== EnrollmentStatus.PENDING
          ) {
            throw new ConflictException(
              'Tagihan tidak lagi menunggu verifikasi',
            );
          }

          const reviewedAt = new Date();
          const claimed = await transaction.payment.updateMany({
            where: {
              id: paymentId,
              status: PaymentStatus.PENDING,
              proofUrl: { not: null },
            },
            data: {
              status,
              confirmedById: approved ? adminId : null,
              confirmedAt: approved ? reviewedAt : null,
              reviewedAt,
              reviewReason: approved ? null : reason.trim(),
            },
          });
          if (claimed.count !== 1) {
            throw new ConflictException(
              'Tagihan telah diproses oleh admin lain',
            );
          }

          if (approved) {
            const activated = await transaction.enrollment.updateMany({
              where: {
                id: payment.enrollmentId,
                status: EnrollmentStatus.PENDING,
              },
              data: { status: EnrollmentStatus.ACTIVE },
            });
            if (activated.count !== 1) {
              throw new ConflictException(
                'Enrollment tidak lagi menunggu pembayaran',
              );
            }
          }

          await transaction.paymentAudit.create({
            data: {
              paymentId,
              actorId: adminId,
              action,
              reason: approved ? null : reason.trim(),
            },
          });
          return transaction.payment.findUniqueOrThrow({
            where: { id: paymentId },
            include: {
              enrollment: {
                include: {
                  user: { select: { id: true, name: true, email: true } },
                  class: { select: { id: true, title: true, price: true } },
                },
              },
            },
          });
        },
        { isolationLevel: Prisma.TransactionIsolationLevel.Serializable },
      );
    } catch (error) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        (error.code === 'P2002' || error.code === 'P2034')
      ) {
        throw new ConflictException(
          'Tagihan sedang diproses. Muat ulang sebelum mencoba lagi.',
        );
      }
      throw error;
    }
  }

  async verifyCertificate(code: string) {
    const certificate = await this.prisma.certificate.findUnique({
      where: { verificationCode: code.trim().toUpperCase() },
      select: {
        verificationCode: true,
        status: true,
        issuedAt: true,
        revokedAt: true,
        user: { select: { name: true } },
        class: { select: { title: true } },
      },
    });
    if (!certificate) throw new NotFoundException('Sertifikat tidak ditemukan');
    return {
      ...certificate,
      isValid: certificate.status === 'VALID',
    };
  }

  async getCertificatesForAdmin() {
    return this.prisma.certificate.findMany({
      include: {
        user: { select: { id: true, name: true, email: true } },
        class: { select: { id: true, title: true } },
      },
      orderBy: { issuedAt: 'desc' },
    });
  }

  async revokeCertificate(
    certificateId: string,
    adminId: string,
    reason: string,
  ) {
    if (!reason.trim())
      throw new BadRequestException('Alasan pencabutan wajib diisi');
    const certificate = await this.prisma.certificate.findUnique({
      where: { id: certificateId },
    });
    if (!certificate) throw new NotFoundException('Sertifikat tidak ditemukan');
    if (certificate.status === 'REVOKED') {
      throw new ConflictException('Sertifikat sudah dicabut');
    }

    return this.prisma.$transaction(async (transaction) => {
      const revokedAt = new Date();
      const updated = await transaction.certificate.update({
        where: { id: certificateId },
        data: {
          status: 'REVOKED',
          revokedAt,
          revokedReason: reason.trim(),
          revokedById: adminId,
        },
      });
      await transaction.certificateAudit.create({
        data: {
          certificateId,
          actorId: adminId,
          action: CertificateAuditAction.REVOKED,
          reason: reason.trim(),
        },
      });
      return updated;
    });
  }

  async getCertificatePdf(
    userId: string,
    certificateId: string,
  ): Promise<Buffer> {
    const certificate = await this.prisma.certificate.findFirst({
      where: { id: certificateId, userId },
      include: {
        user: { select: { name: true } },
        class: {
          include: { instructor: { select: { name: true } } },
        },
      },
    });
    if (!certificate) throw new NotFoundException('Sertifikat tidak ditemukan');
    if (certificate.status !== 'VALID')
      throw new ForbiddenException('Sertifikat telah dicabut');

    return new Promise<Buffer>((resolve, reject) => {
      const document = new PDFDocument({
        size: 'A4',
        layout: 'landscape',
        margin: 56,
      });
      const chunks: Buffer[] = [];
      document.on('data', (chunk: Buffer) => chunks.push(chunk));
      document.on('end', () => resolve(Buffer.concat(chunks)));
      document.on('error', reject);

      document
        .fontSize(18)
        .fillColor('#0033FF')
        .text('SKILVORA', { align: 'center', characterSpacing: 4 });
      document.moveDown(1.5);
      document
        .fontSize(30)
        .fillColor('#00033D')
        .text('SERTIFIKAT KELULUSAN', { align: 'center' });
      document.moveDown(1.5);
      document
        .fontSize(15)
        .fillColor('#333333')
        .text('Diberikan kepada', { align: 'center' });
      document.moveDown(0.5);
      document
        .fontSize(28)
        .fillColor('#0033FF')
        .text(certificate.user.name || certificate.userId, {
          align: 'center',
        });
      document.moveDown(0.75);
      document
        .fontSize(15)
        .fillColor('#333333')
        .text('Atas keberhasilan menyelesaikan kelas', {
          align: 'center',
        });
      document.moveDown(0.5);
      document
        .fontSize(22)
        .fillColor('#00033D')
        .text(certificate.class.title, { align: 'center' });
      document.moveDown(1.5);
      document
        .fontSize(12)
        .fillColor('#555555')
        .text(
          `Instruktur: ${certificate.class.instructor.name || 'Skilvora'}`,
          { align: 'center' },
        );
      document.text(
        `Tanggal selesai: ${certificate.issuedAt.toLocaleDateString('id-ID', { timeZone: 'Asia/Jakarta' })}`,
        { align: 'center' },
      );
      document.moveDown(1);
      document
        .fontSize(11)
        .fillColor('#0033FF')
        .text(`Kode verifikasi: ${certificate.verificationCode}`, {
          align: 'center',
        });
      document.end();
    });
  }

  private progressPercent(completed: number, total: number): number {
    return total === 0 ? 0 : Math.round((completed / total) * 100);
  }

  private assertPaymentsEnabled(): void {
    if (this.config.get<string>('PAYMENTS_ENABLED') !== 'true') {
      throw new ServiceUnavailableException(
        'Pembayaran belum dibuka. Jangan melakukan transfer.',
      );
    }
  }
}
