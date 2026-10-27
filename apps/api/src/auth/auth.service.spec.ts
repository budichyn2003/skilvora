import { ForbiddenException } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { Role, User } from '@prisma/client';
import * as bcrypt from 'bcryptjs';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../prisma/prisma.service';
import { AuthService } from './auth.service';
import { MailerService } from './mailer.service';

jest.mock('@nestjs/config', () => ({
  ConfigService: class ConfigService {},
}));

describe('AuthService', () => {
  let service: AuthService;
  const user = {
    id: 'user-1',
    email: 'student@example.com',
    password: '',
    name: 'Student',
    role: Role.STUDENT,
    emailVerifiedAt: null,
    profilePicture: null,
  } as User;

  const prisma = {
    user: { findUnique: jest.fn() },
    authToken: { findFirst: jest.fn(), delete: jest.fn(), create: jest.fn() },
    $transaction: jest.fn().mockResolvedValue([]),
  };
  const jwt = { sign: jest.fn().mockReturnValue('access-token') };
  const mailer = { assertConfigured: jest.fn(), sendVerification: jest.fn() };
  const config = { get: jest.fn() };

  beforeEach(async () => {
    jest.clearAllMocks();
    const moduleRef = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: PrismaService, useValue: prisma },
        { provide: JwtService, useValue: jwt },
        { provide: MailerService, useValue: mailer },
        { provide: ConfigService, useValue: config },
      ],
    }).compile();
    service = moduleRef.get(AuthService);
  });

  it('returns only safe user fields after validating a password', async () => {
    const password = 'correct-password';
    prisma.user.findUnique.mockResolvedValue({
      ...user,
      password: await bcrypt.hash(password, 4),
    });

    await expect(service.validateUser(' STUDENT@example.com ', password)).resolves.toEqual({
      id: user.id,
      email: user.email,
      name: user.name,
      role: Role.STUDENT,
      emailVerifiedAt: null,
      profilePicture: null,
    });
    expect(prisma.user.findUnique).toHaveBeenCalledWith({
      where: { email: 'student@example.com' },
    });
  });

  it('blocks login until email verification is complete', async () => {
    await expect(service.login(service['toSafeUser'](user))).rejects.toBeInstanceOf(
      ForbiddenException,
    );
    expect(prisma.$transaction).not.toHaveBeenCalled();
  });

  it('rotates refresh tokens and stores only their hash', async () => {
    prisma.authToken.findFirst.mockResolvedValue({
      id: 'refresh-1',
      userId: user.id,
      user: { ...user, emailVerifiedAt: new Date() },
    });

    const result = await service.refreshSession('raw-refresh-token');

    expect(result.refreshToken).not.toBe('raw-refresh-token');
    expect(jwt.sign).toHaveBeenCalled();
    expect(prisma.authToken.delete).toHaveBeenCalledWith({ where: { id: 'refresh-1' } });
    const storedHash = prisma.authToken.create.mock.calls[0][0].data.tokenHash;
    expect(storedHash).not.toBe(result.refreshToken);
    expect(storedHash).toMatch(/^[a-f0-9]{64}$/);
  });
});
