import { Injectable, ServiceUnavailableException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import nodemailer from 'nodemailer';

@Injectable()
export class MailerService {
  constructor(private readonly config: ConfigService) {}

  assertConfigured(): void {
    const required = ['SMTP_HOST', 'SMTP_USER', 'SMTP_PASSWORD', 'SMTP_FROM'];
    const missing = required.filter((key) => !this.config.get<string>(key));
    if (missing.length) {
      throw new ServiceUnavailableException(
        `Email belum dikonfigurasi. Variabel yang belum diisi: ${missing.join(', ')}`,
      );
    }
  }

  async sendVerification(
    to: string,
    name: string | null,
    url: string,
  ): Promise<void> {
    await this.send(
      to,
      'Verifikasi email Skilvora',
      `Halo ${name || 'Siswa'},\n\nVerifikasi akun Anda: ${url}\n\nTautan berlaku selama 24 jam.`,
    );
  }

  async sendPasswordReset(
    to: string,
    name: string | null,
    url: string,
  ): Promise<void> {
    await this.send(
      to,
      'Reset password Skilvora',
      `Halo ${name || 'Siswa'},\n\nAtur ulang password Anda: ${url}\n\nTautan berlaku selama 1 jam. Jika Anda tidak meminta reset, abaikan email ini.`,
    );
  }

  private async send(to: string, subject: string, text: string): Promise<void> {
    this.assertConfigured();

    const port = Number(this.config.get<string>('SMTP_PORT') || 587);
    const secure = this.config.get<string>('SMTP_SECURE') === 'true';
    const transport = nodemailer.createTransport({
      host: this.config.getOrThrow<string>('SMTP_HOST'),
      port,
      secure,
      auth: {
        user: this.config.getOrThrow<string>('SMTP_USER'),
        pass: this.config.getOrThrow<string>('SMTP_PASSWORD'),
      },
    });

    await transport.sendMail({
      from: this.config.getOrThrow<string>('SMTP_FROM'),
      to,
      subject,
      text,
    });
  }
}
