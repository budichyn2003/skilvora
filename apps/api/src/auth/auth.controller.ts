import {
  Body,
  BadRequestException,
  Controller,
  Get,
  Headers,
  Patch,
  Post,
  Req,
  Res,
  UnauthorizedException,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import type { Request, Response } from 'express';
import { AuthService } from './auth.service';
import { Throttle } from '@nestjs/throttler';

type AuthenticatedRequest = Request & {
  user: { id: string; email: string; role: string };
};

function readCookie(
  header: string | undefined,
  cookieName: string,
): string | undefined {
  return header
    ?.split(';')
    .map((cookie) => cookie.trim())
    .find((cookie) => cookie.startsWith(`${cookieName}=`))
    ?.slice(cookieName.length + 1);
}

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  @Throttle({ default: { limit: 5, ttl: 60_000 } })
  register(@Body() body: { email?: string; password?: string; name?: string }) {
    if (!body.email || !body.password) {
      throw new BadRequestException('Email dan password wajib diisi');
    }
    return this.authService.register(body.email, body.password, body.name);
  }

  @Post('login')
  @Throttle({ default: { limit: 5, ttl: 60_000 } })
  async login(
    @Body() body: { email?: string; password?: string },
    @Res({ passthrough: true }) response: Response,
  ) {
    if (!body.email || !body.password) {
      throw new BadRequestException('Email dan password wajib diisi');
    }
    const user = await this.authService.validateUser(body.email, body.password);
    if (!user) throw new UnauthorizedException('Email atau password salah');

    const tokens = await this.authService.login(user);
    this.setRefreshCookie(response, tokens.refreshToken);
    this.setAccessCookie(response, tokens.access_token);
    return {
      message: 'Login berhasil',
      user: tokens.user,
      access_token: tokens.access_token,
    };
  }

  @Post('refresh')
  async refresh(
    @Headers('cookie') cookieHeader: string | undefined,
    @Res({ passthrough: true }) response: Response,
  ) {
    const tokens = await this.authService.refreshSession(
      readCookie(cookieHeader, 'refresh_token'),
    );
    this.setRefreshCookie(response, tokens.refreshToken);
    this.setAccessCookie(response, tokens.access_token);
    return { access_token: tokens.access_token, user: tokens.user };
  }

  @Post('exchange')
  async exchangeOAuthCode(
    @Body('code') code: string,
    @Res({ passthrough: true }) response: Response,
  ) {
    if (!code) throw new BadRequestException('Kode login wajib diisi');
    const tokens = await this.authService.exchangeOAuthCode(code);
    this.setRefreshCookie(response, tokens.refreshToken);
    this.setAccessCookie(response, tokens.access_token);
    return { access_token: tokens.access_token, user: tokens.user };
  }

  @Post('logout')
  async logout(
    @Headers('cookie') cookieHeader: string | undefined,
    @Res({ passthrough: true }) response: Response,
  ) {
    await this.authService.logout(readCookie(cookieHeader, 'refresh_token'));
    response.clearCookie('refresh_token', this.refreshCookieOptions());
    response.clearCookie('token', this.accessCookieOptions());
    return { message: 'Anda telah keluar' };
  }

  @Post('verify-email')
  verifyEmail(@Body('token') token: string) {
    return this.authService.verifyEmail(token);
  }

  @Post('resend-verification')
  @Throttle({ default: { limit: 3, ttl: 60_000 } })
  resendVerification(@Body('email') email: string) {
    if (!email) throw new BadRequestException('Email wajib diisi');
    return this.authService.resendVerification(email);
  }

  @Post('forgot-password')
  @Throttle({ default: { limit: 3, ttl: 60_000 } })
  requestPasswordReset(@Body('email') email: string) {
    if (!email) throw new BadRequestException('Email wajib diisi');
    return this.authService.requestPasswordReset(email);
  }

  @Post('reset-password')
  resetPassword(@Body() body: { token?: string; password?: string }) {
    if (!body.token || !body.password) {
      throw new BadRequestException('Token dan password wajib diisi');
    }
    return this.authService.resetPassword(body.token, body.password);
  }

  @Get('me')
  @UseGuards(AuthGuard('jwt'))
  getProfile(@Req() request: AuthenticatedRequest) {
    return this.authService.getProfile(request.user.id);
  }

  @Patch('profile')
  @UseGuards(AuthGuard('jwt'))
  updateProfile(
    @Req() request: AuthenticatedRequest,
    @Body() body: { name?: string; profilePicture?: string | null },
  ) {
    if (typeof body.name !== 'string')
      throw new BadRequestException('Nama wajib diisi');
    return this.authService.updateProfile(
      request.user.id,
      body.name,
      body.profilePicture,
    );
  }

  @Get('google')
  @UseGuards(AuthGuard('google'))
  googleAuth() {}

  @Get('google/callback')
  @UseGuards(AuthGuard('google'))
  async googleAuthRedirect(
    @Req() request: AuthenticatedRequest,
    @Res() response: Response,
  ) {
    const code = await this.authService.createOAuthCode(request.user.id);
    const webUrl = (process.env.WEB_APP_URL || 'http://localhost:3000').replace(
      /\/+$/,
      '',
    );
    response.redirect(
      `${webUrl}/auth/callback?code=${encodeURIComponent(code)}`,
    );
  }

  private setRefreshCookie(response: Response, token: string): void {
    response.cookie('refresh_token', token, {
      ...this.refreshCookieOptions(),
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });
  }

  private setAccessCookie(response: Response, token: string): void {
    response.cookie('token', token, {
      ...this.accessCookieOptions(),
      maxAge: 60 * 60 * 1000,
    });
  }

  private refreshCookieOptions() {
    const secure = process.env.NODE_ENV === 'production';
    return {
      httpOnly: true,
      secure,
      sameSite: secure ? ('none' as const) : ('lax' as const),
      path: '/',
    };
  }

  private accessCookieOptions() {
    const secure = process.env.NODE_ENV === 'production';
    return {
      httpOnly: false,
      secure,
      sameSite: secure ? ('none' as const) : ('lax' as const),
      path: '/',
    };
  }
}
