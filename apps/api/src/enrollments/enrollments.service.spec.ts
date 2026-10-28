/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  NotFoundException,
  ServiceUnavailableException,
} from '@nestjs/common';
import { Test } from '@nestjs/testing';
import {
  EnrollmentStatus,
  PaymentAuditAction,
  PaymentStatus,
} from '@prisma/client';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../prisma/prisma.service';
import { EnrollmentsService } from './enrollments.service';

jest.mock('@nestjs/config', () => ({
  ConfigService: class ConfigService {},
}));

describe('EnrollmentsService', () => {
  let service: EnrollmentsService;
  const prisma = {
    class: { findUnique: jest.fn() },
    enrollment: { findUnique: jest.fn(), create: jest.fn() },
    moduleProgress: { upsert: jest.fn() },
    quiz: { findUnique: jest.fn() },
    quizAttempt: { findFirst: jest.fn() },
    certificate: { findUnique: jest.fn(), update: jest.fn() },
    certificateAudit: { create: jest.fn() },
    payment: { findFirst: jest.fn() },
    $transaction: jest.fn(),
  };
  const config = { get: jest.fn().mockReturnValue('true') };

  beforeEach(async () => {
    jest.clearAllMocks();
    config.get.mockReturnValue('true');
    prisma.enrollment.findUnique.mockResolvedValue(null);
    const moduleRef = await Test.createTestingModule({
      providers: [
        EnrollmentsService,
        { provide: PrismaService, useValue: prisma },
        { provide: ConfigService, useValue: config },
      ],
    }).compile();
    service = moduleRef.get(EnrollmentsService);
  });

  it('creates an active enrollment with initial progress for a free class', async () => {
    const transaction = {
      enrollment: {
        create: jest.fn().mockResolvedValue({ id: 'enrollment-1' }),
      },
      payment: { create: jest.fn() },
    };
    prisma.class.findUnique.mockResolvedValue({
      id: 'class-1',
      status: 'PUBLISHED',
      price: 0,
      modules: [{ id: 'module-1' }, { id: 'module-2' }],
    });
    prisma.enrollment.findUnique.mockResolvedValue(null);
    prisma.$transaction.mockImplementation(
      (callback: (tx: typeof transaction) => Promise<unknown>) =>
        callback(transaction),
    );

    await service.enroll('user-1', 'class-1');

    expect(transaction.enrollment.create).toHaveBeenCalledWith({
      data: {
        userId: 'user-1',
        classId: 'class-1',
        status: EnrollmentStatus.ACTIVE,
        progresses: {
          create: [{ moduleId: 'module-1' }, { moduleId: 'module-2' }],
        },
      },
    });
    expect(transaction.payment.create).not.toHaveBeenCalled();
  });

  it('does not allow pending enrollments to update progress', async () => {
    prisma.enrollment.findUnique.mockResolvedValue({
      status: EnrollmentStatus.PENDING,
      class: { modules: [{ id: 'module-1' }] },
    });

    await expect(
      service.updateProgress(
        'user-1',
        'enrollment-1',
        'module-1',
        'IN_PROGRESS',
      ),
    ).rejects.toBeInstanceOf(ForbiddenException);
    expect(prisma.moduleProgress.upsert).not.toHaveBeenCalled();
  });

  it('scopes progress updates to the authenticated student enrollment', async () => {
    prisma.enrollment.findUnique.mockResolvedValue(null);

    await expect(
      service.updateProgress(
        'student-2',
        'enrollment-1',
        'module-1',
        'IN_PROGRESS',
      ),
    ).rejects.toBeInstanceOf(NotFoundException);
    expect(prisma.enrollment.findUnique).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { id: 'enrollment-1', userId: 'student-2' },
      }),
    );
    expect(prisma.moduleProgress.upsert).not.toHaveBeenCalled();
  });

  it('requires a passed module quiz before marking the module complete', async () => {
    prisma.enrollment.findUnique.mockResolvedValue({
      status: EnrollmentStatus.ACTIVE,
      class: { modules: [{ id: 'module-1' }] },
    });
    prisma.quiz.findUnique.mockResolvedValue({ id: 'quiz-1' });
    prisma.quizAttempt.findFirst.mockResolvedValue(null);

    await expect(
      service.updateProgress('user-1', 'enrollment-1', 'module-1', 'COMPLETED'),
    ).rejects.toBeInstanceOf(BadRequestException);
    expect(prisma.moduleProgress.upsert).not.toHaveBeenCalled();
  });

  it('records certificate revocation with an audit event', async () => {
    const certificate = { id: 'certificate-1', status: 'VALID' };
    const transaction = {
      certificate: {
        update: jest
          .fn()
          .mockResolvedValue({ ...certificate, status: 'REVOKED' }),
      },
      certificateAudit: { create: jest.fn() },
    };
    prisma.certificate.findUnique.mockResolvedValue(certificate);
    prisma.$transaction.mockImplementation(
      (callback: (tx: typeof transaction) => Promise<unknown>) =>
        callback(transaction),
    );

    await service.revokeCertificate(
      'certificate-1',
      'admin-1',
      'Policy violation',
    );

    expect(transaction.certificate.update).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { id: 'certificate-1' },
        data: expect.objectContaining({
          status: 'REVOKED',
          revokedById: 'admin-1',
          revokedReason: 'Policy violation',
        }),
      }),
    );
    expect(transaction.certificateAudit.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          certificateId: 'certificate-1',
          actorId: 'admin-1',
          reason: 'Policy violation',
        }),
      }),
    );
  });

  it('approves a verified payment and activates the enrollment atomically', async () => {
    const approvedPayment = { id: 'payment-1', status: PaymentStatus.SUCCESS };
    const transaction = {
      payment: {
        findUnique: jest.fn().mockResolvedValue({
          id: 'payment-1',
          enrollmentId: 'enrollment-1',
          status: PaymentStatus.PENDING,
          proofUrl: 'https://files.example/proof.png',
          enrollment: { status: EnrollmentStatus.PENDING },
        }),
        updateMany: jest.fn().mockResolvedValue({ count: 1 }),
        findUniqueOrThrow: jest.fn().mockResolvedValue(approvedPayment),
      },
      enrollment: { updateMany: jest.fn().mockResolvedValue({ count: 1 }) },
      paymentAudit: { create: jest.fn() },
    };
    prisma.$transaction.mockImplementation(
      (callback: (tx: typeof transaction) => Promise<unknown>) =>
        callback(transaction),
    );

    await expect(
      service.reviewPayment('payment-1', 'admin-1', true, ''),
    ).resolves.toEqual(approvedPayment);
    expect(transaction.payment.updateMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({ status: PaymentStatus.PENDING }),
        data: expect.objectContaining({
          status: PaymentStatus.SUCCESS,
          confirmedById: 'admin-1',
        }),
      }),
    );
    expect(transaction.enrollment.updateMany).toHaveBeenCalledWith({
      where: { id: 'enrollment-1', status: EnrollmentStatus.PENDING },
      data: { status: EnrollmentStatus.ACTIVE },
    });
    expect(transaction.paymentAudit.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          action: PaymentAuditAction.APPROVED,
          actorId: 'admin-1',
        }),
      }),
    );
  });

  it('requires a reason to reject a payment', async () => {
    await expect(
      service.reviewPayment('payment-1', 'admin-1', false, ''),
    ).rejects.toBeInstanceOf(BadRequestException);
    expect(prisma.$transaction).not.toHaveBeenCalled();
  });

  it('does not activate an enrollment when a payment is rejected', async () => {
    const transaction = {
      payment: {
        findUnique: jest.fn().mockResolvedValue({
          id: 'payment-1',
          enrollmentId: 'enrollment-1',
          status: PaymentStatus.PENDING,
          proofUrl: 'https://files.example/proof.png',
          enrollment: { status: EnrollmentStatus.PENDING },
        }),
        updateMany: jest.fn().mockResolvedValue({ count: 1 }),
        findUniqueOrThrow: jest
          .fn()
          .mockResolvedValue({ status: PaymentStatus.FAILED }),
      },
      enrollment: { updateMany: jest.fn() },
      paymentAudit: { create: jest.fn() },
    };
    prisma.$transaction.mockImplementation(
      (callback: (tx: typeof transaction) => Promise<unknown>) =>
        callback(transaction),
    );

    await service.reviewPayment(
      'payment-1',
      'admin-1',
      false,
      'Bukti tidak terbaca',
    );

    expect(transaction.enrollment.updateMany).not.toHaveBeenCalled();
    expect(transaction.paymentAudit.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          action: PaymentAuditAction.REJECTED,
          reason: 'Bukti tidak terbaca',
        }),
      }),
    );
  });

  it('rejects duplicate or stale payment-review decisions', async () => {
    const transaction = {
      payment: {
        findUnique: jest.fn().mockResolvedValue({
          id: 'payment-1',
          status: PaymentStatus.SUCCESS,
          proofUrl: 'https://files.example/proof.png',
          enrollment: { status: EnrollmentStatus.ACTIVE },
        }),
      },
    };
    prisma.$transaction.mockImplementation(
      (callback: (tx: typeof transaction) => Promise<unknown>) =>
        callback(transaction),
    );

    await expect(
      service.reviewPayment('payment-1', 'admin-1', true, ''),
    ).rejects.toBeInstanceOf(ConflictException);
  });

  it('blocks paid enrollment while payment processing is disabled', async () => {
    config.get.mockReturnValue('false');
    prisma.class.findUnique.mockResolvedValue({
      id: 'class-paid',
      status: 'PUBLISHED',
      price: 250000,
      modules: [],
    });

    await expect(
      service.enroll('student-1', 'class-paid'),
    ).rejects.toBeInstanceOf(ServiceUnavailableException);
    expect(prisma.$transaction).not.toHaveBeenCalled();
  });

  it('blocks proof submission while payment processing is disabled', async () => {
    config.get.mockReturnValue('false');

    await expect(
      service.uploadPaymentProof(
        'student-1',
        'payment-1',
        'https://proof.example/file',
      ),
    ).rejects.toBeInstanceOf(ServiceUnavailableException);
    expect(prisma.payment.findFirst).not.toHaveBeenCalled();
  });

  it("only accepts payment proof for the authenticated student's pending enrollment", async () => {
    prisma.payment.findFirst.mockResolvedValue(null);

    await expect(
      service.uploadPaymentProof(
        'student-2',
        'payment-1',
        'https://files.example/proof.png',
      ),
    ).rejects.toBeInstanceOf(NotFoundException);
    expect(prisma.payment.findFirst).toHaveBeenCalledWith({
      where: {
        id: 'payment-1',
        enrollment: {
          userId: 'student-2',
          status: EnrollmentStatus.PENDING,
        },
      },
    });
  });
});
