import { PassportStrategy } from '@nestjs/passport';
import { Strategy, VerifyCallback } from 'passport-google-oauth20';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AuthService } from './auth.service';

@Injectable()
export class GoogleStrategy extends PassportStrategy(Strategy, 'google') {
  constructor(config: ConfigService, private readonly authService: AuthService) {
    super({
      clientID: config.get<string>('GOOGLE_CLIENT_ID') || 'oauth-not-configured',
      clientSecret: config.get<string>('GOOGLE_CLIENT_SECRET') || 'oauth-not-configured',
      callbackURL: `${(config.get<string>('API_PUBLIC_URL') || 'http://localhost:3001').replace(/\/+$/, '')}/auth/google/callback`,
      scope: ['email', 'profile'],
    });
  }

  async validate(
    _accessToken: string,
    _refreshToken: string,
    profile: Parameters<VerifyCallback>[0],
  ) {
    const googleProfile = profile as {
      emails?: Array<{ value: string; verified?: boolean }>;
      displayName?: string;
      photos?: Array<{ value: string }>;
    };
    const email = googleProfile.emails?.[0]?.value;
    if (!email) throw new UnauthorizedException('Google tidak memberikan alamat email');

    return this.authService.validateGoogleUser(
      email,
      googleProfile.displayName || null,
      googleProfile.photos?.[0]?.value || null,
    );
  }
}