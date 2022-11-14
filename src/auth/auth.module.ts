import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { PrismaModule } from 'src/prisma/prisma.module';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { ConfigService } from '@nestjs/config';
import { GooogleStrategy, JWTStrategy } from './strategy';
import { OTPService } from './otp.service';
import { PasswordService } from './password.service';
import { GoogleAuthService } from './google-auth.service';

@Module({
  providers: [
    AuthService,
    JwtModule,
    JWTStrategy,
    // GooogleStrategy,
    OTPService,
    PasswordService,
    GoogleAuthService,
  ],
  imports: [
    PrismaModule,

    JwtModule.registerAsync({
      useFactory: async (config: ConfigService) => {
        return {
          secret: config.get('JWT_SECRET'),
          signOptions: {
            expiresIn: config.get('JWT_EXPIRES_IN'),
          },
        };
      },
      inject: [ConfigService],
    }),

    // * Register Passport Module to be asyncronously loaded
    PassportModule.register({ defaultStrategy: ['jwt', 'google'] }),
  ],
  controllers: [AuthController],
})
export class AuthModule {}
