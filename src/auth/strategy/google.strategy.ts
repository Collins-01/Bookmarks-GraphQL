import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { Profile } from 'passport-google-oauth20';
import { Strategy } from 'passport-jwt';

@Injectable()
export class GooogleStrategy extends PassportStrategy(Strategy, 'google') {
  constructor(private readonly config:ConfigService) {
    super({
      clientID: config.get('GOOGLE_AUTH_CLIENT_ID'),
      clientSecret: config.get('GOOGLE_AUTH_CLIENT_SECRET'),
      callbackURL: 'http://localhost:3000/auth/google/redirect',
      scope: ['email', 'profile'],
    });
  }

  async validate(accessToken: string, refreshToken: string, profile: Profile) {
    const { emails } = profile;

    if (emails) {
      const user = {
        email: emails[0].value,
        accessToken,
      };
      return user;
    }
    throw new UnauthorizedException();
  }
  
}
