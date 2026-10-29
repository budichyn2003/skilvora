import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { AuthTokenType, Role, User } from '@prisma/client';
import * as bcrypt from 'bcryptjs';
import { createHash, randomBytes } from 'crypto';
import { PrismaService } from '../prisma/prisma.service';
import { MailerService } from './mailer.service';

type SafeUser = Pick<
  User,
  'id' | 'email' | 'name' | 'role' | 'emailVerifiedAt' | 'profilePicture'
>;

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
    private readonly mailer: MailerService,
    private readonly config: ConfigService,
  ) {}

  async register(email: string, password: string, name?: string) {
    const normalizedEmail = email.trim().toLowerCase();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizedEmail)) {
      throw new BadRequestException('Format email tidak valid');
    }
    if (password.length < 8) {
      throw new BadRequestException('Password minimal 8 karakter');
    }
    this.mailer.assertConfigured();

    const existing = await this.prisma.user.findUnique({
      where: { email: normalizedEmail },
    });
    if (existing) throw new ConflictException('Email sudah terdaftar');

    const user = await this.prisma.user.create({
      data: {
        email: normalizedEmail,
        password: await bcrypt.hash(password, 10),
        name: name?.trim() || null,
        role: Role.STUDENT,
      },
    });

    try {
      await this.sendVerification(user);
    } catch (error) {
      await this.prisma.user.delete({ where: { id: user.id } });
      throw error;
    }

    return {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      message: 'Akun dibuat. Periksa email untuk menyelesaikan verifikasi.',
    };
  }

  async validateUser(
    email: string,
    password: string,
  ): Promise<SafeUser | null> {
    const user = await this.prisma.user.findUnique({
      where: { email: email.trim().toLowerCase() },
    });

    if (!user?.password || !(await bcrypt.compare(password, user.password)))
      return null;
    return this.toSafeUser(user);
  }

  async login(user: SafeUser) {
    if (!user.emailVerifiedAt) {
      throw new ForbiddenException('Verifikasi email Anda sebelum masuk');
    }

    const refreshToken = randomBytes(48).toString('hex');
    await this.prisma.$transaction([
      this.prisma.authToken.deleteMany({
        where: { expiresAt: { lte: new Date() } },
      }),
      this.prisma.authToken.create({
        data: {
          tokenHash: this.hashToken(refreshToken),
          type: AuthTokenType.REFRESH_SESSION,
          userId: user.id,
          expiresAt: this.expiresInDays(7),
        },
      }),
    ]);

    return {
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
      },
      access_token: this.createAccessToken(user),
      refreshToken,
    };
  }

  async validateGoogleUser(
    email: string,
    name: string | null,
    profilePicture: string | null,
  ) {
    const normalizedEmail = email.trim().toLowerCase();
    const user = await this.prisma.user.upsert({
      where: { email: normalizedEmail },
      update: {
        emailVerifiedAt: new Date(),
        ...(profilePicture ? { profilePicture } : {}),
      },
      create: {
        email: normalizedEmail,
        name,
        profilePicture,
        role: Role.STUDENT,
        emailVerifiedAt: new Date(),
      },
    });
    return this.toSafeUser(user);
  }

  async createOAuthCode(userId: string): Promise<string> {
    return this.issueToken(
      userId,
      AuthTokenType.OAUTH_CODE,
      new Date(Date.now() + 60 * 1000),
    );
  }

  async exchangeOAuthCode(rawCode: string) {
    const stored = await this.findValidToken(rawCode, AuthTokenType.OAUTH_CODE);
    const refreshToken = randomBytes(48).toString('hex');
    await this.prisma.$transaction(async (transaction) => {
      const consumed = await transaction.authToken.deleteMany({
        where: { id: stored.id },
      });
      if (consumed.count !== 1)
        throw new UnauthorizedException('Kode login telah digunakan');
      await transaction.authToken.create({
        data: {
          tokenHash: this.hashToken(refreshToken),
          type: AuthTokenType.REFRESH_SESSION,
          userId: stored.userId,
          expiresAt: this.expiresInDays(7),
        },
      });
    });

    const user = this.toSafeUser(stored.user);
    return {
      access_token: this.createAccessToken(user),
      refreshToken,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
      },
    };
  }

  async verifyEmail(rawToken: string): Promise<void> {
    const token = await this.findValidToken(
      rawToken,
      AuthTokenType.EMAIL_VERIFICATION,
    );
    await this.prisma.$transaction([
      this.prisma.user.update({
        where: { id: token.userId },
        data: { emailVerifiedAt: token.user.emailVerifiedAt || new Date() },
      }),
      this.prisma.authToken.deleteMany({
        where: { userId: token.userId, type: AuthTokenType.EMAIL_VERIFICATION },
      }),
    ]);
  }

  async resendVerification(email: string): Promise<{ message: string }> {
    const normalizedEmail = email.trim().toLowerCase();
    const user = await this.prisma.user.findUnique({
      where: { email: normalizedEmail },
    });

    if (user && !user.emailVerifiedAt) {
      this.mailer.assertConfigured();
      await this.sendVerification(user);
    }
    return {
      message: 'Jika akun belum diverifikasi, tautan verifikasi telah dikirim.',
    };
  }

  async requestPasswordReset(email: string): Promise<{ message: string }> {
    this.mailer.assertConfigured();
    const normalizedEmail = email.trim().toLowerCase();
    const user = await this.prisma.user.findUnique({
      where: { email: normalizedEmail },
    });

    if (user) {
      const rawToken = await this.issueToken(
        user.id,
        AuthTokenType.PASSWORD_RESET,
        this.expiresInHours(1),
      );
      const url = `${this.webAppUrl()}/auth/reset-password?token=${encodeURIComponent(rawToken)}`;
      await this.mailer.sendPasswordReset(user.email, user.name, url);
    }

    return {
      message:
        'Jika email terdaftar, tautan untuk mengatur ulang password telah dikirim.',
    };
  }

  async resetPassword(rawToken: string, password: string): Promise<void> {
    if (password.length < 8)
      throw new BadRequestException('Password minimal 8 karakter');
    const token = await this.findValidToken(
      rawToken,
      AuthTokenType.PASSWORD_RESET,
    );
    const hashedPassword = await bcrypt.hash(password, 10);

    await this.prisma.$transaction([
      this.prisma.user.update({
        where: { id: token.userId },
        data: { password: hashedPassword },
      }),
      this.prisma.authToken.deleteMany({
        where: {
          userId: token.userId,
          type: {
            in: [AuthTokenType.PASSWORD_RESET, AuthTokenType.REFRESH_SESSION],
          },
        },
      }),
    ]);
  }

  async refreshSession(rawToken: string | undefined) {
    if (!rawToken) throw new UnauthorizedException('Sesi tidak valid');
    const tokenHash = this.hashToken(rawToken);
    const stored = await this.prisma.authToken.findFirst({
      where: {
        tokenHash,
        type: AuthTokenType.REFRESH_SESSION,
        expiresAt: { gt: new Date() },
      },
      include: { user: true },
    });
    if (!stored)
      throw new UnauthorizedException(
        'Sesi telah berakhir. Silakan masuk kembali.',
      );

    const refreshToken = randomBytes(48).toString('hex');
    await this.prisma.$transaction([
      this.prisma.authToken.delete({ where: { id: stored.id } }),
      this.prisma.authToken.create({
        data: {
          tokenHash: this.hashToken(refreshToken),
          type: AuthTokenType.REFRESH_SESSION,
          userId: stored.userId,
          expiresAt: this.expiresInDays(7),
        },
      }),
    ]);
    const user = this.toSafeUser(stored.user);
    return {
      access_token: this.createAccessToken(user),
      refreshToken,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
      },
    };
  }

  async logout(rawToken: string | undefined): Promise<void> {
    if (!rawToken) return;
    await this.prisma.authToken.deleteMany({
      where: {
        tokenHash: this.hashToken(rawToken),
        type: AuthTokenType.REFRESH_SESSION,
      },
    });
  }

  async getProfile(userId: string): Promise<SafeUser> {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new NotFoundException('Pengguna tidak ditemukan');
    return this.toSafeUser(user);
  }

  async updateProfile(
    userId: string,
    name: string,
    profilePicture?: string | null,
  ): Promise<SafeUser> {
    if (!name.trim()) throw new BadRequestException('Nama wajib diisi');
    const user = await this.prisma.user.update({
      where: { id: userId },
      data: {
        name: name.trim(),
        ...(profilePicture !== undefined
          ? { profilePicture: profilePicture || null }
          : {}),
      },
    });
    return this.toSafeUser(user);
  }

  private async sendVerification(user: User): Promise<void> {
    const rawToken = await this.issueToken(
      user.id,
      AuthTokenType.EMAIL_VERIFICATION,
      this.expiresInHours(24),
    );
    const url = `${this.webAppUrl()}/auth/verify-email?token=${encodeURIComponent(rawToken)}`;
    await this.mailer.sendVerification(user.email, user.name, url);
  }

  private async issueToken(
    userId: string,
    type: AuthTokenType,
    expiresAt: Date,
  ): Promise<string> {
    const rawToken = randomBytes(32).toString('hex');
    await this.prisma.$transaction([
      this.prisma.authToken.deleteMany({
        where: { expiresAt: { lte: new Date() } },
      }),
      this.prisma.authToken.deleteMany({ where: { userId, type } }),
      this.prisma.authToken.create({
        data: { tokenHash: this.hashToken(rawToken), type, userId, expiresAt },
      }),
    ]);
    return rawToken;
  }

  private async findValidToken(rawToken: string, type: AuthTokenType) {
    if (!rawToken) throw new BadRequestException('Token tidak valid');
    const token = await this.prisma.authToken.findFirst({
      where: {
        tokenHash: this.hashToken(rawToken),
        type,
        expiresAt: { gt: new Date() },
      },
      include: { user: true },
    });
    if (!token)
      throw new BadRequestException(
        'Tautan tidak valid atau sudah kedaluwarsa',
      );
    return token;
  }

  private createAccessToken(user: SafeUser): string {
    return this.jwtService.sign({
      sub: user.id,
      email: user.email,
      role: user.role,
    });
  }

  private toSafeUser(user: User): SafeUser {
    return {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      emailVerifiedAt: user.emailVerifiedAt,
      profilePicture: user.profilePicture,
    };
  }

  private hashToken(token: string): string {
    return createHash('sha256').update(token).digest('hex');
  }

  private webAppUrl(): string {
    return (
      this.config.get<string>('WEB_APP_URL') || 'http://localhost:3000'
    ).replace(/\/+$/, '');
  }

  private expiresInHours(hours: number): Date {
    return new Date(Date.now() + hours * 60 * 60 * 1000);
  }

  private expiresInDays(days: number): Date {
    return this.expiresInHours(days * 24);
  }
}
