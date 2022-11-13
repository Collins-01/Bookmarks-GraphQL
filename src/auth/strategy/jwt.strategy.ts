import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { AuthService } from '../auth.service';
import { JwtDto } from '../dtos';

@Injectable()
export class JWTStrategy extends PassportStrategy(Strategy) {
  constructor(readonly config: ConfigService, private readonly authService: AuthService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: config.get('JWT_SECRET'),
    });
  }
  async validate(payload: JwtDto) {
    console.log({ payload });
    const user = await this.authService.validateUser(payload.userId);
    if(!user){
      throw new UnauthorizedException();
    }
    return user;
  }
}
