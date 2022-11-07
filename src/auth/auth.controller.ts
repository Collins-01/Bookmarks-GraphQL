import { Body, Controller, Post, Res } from '@nestjs/common';
import { Response } from 'express';
import { AuthService } from './auth.service';
import { LoginDTO, RegisterDTO, VerifyOtpDTO } from './dtos';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('register')
   register(@Body() registerDTO: RegisterDTO, @Res() response:Response) {
    return  this.authService.register(registerDTO, response);
  }
  @Post('login')
   login(@Body() loginDTO:LoginDTO) {
    return  this.authService.login(loginDTO);
  }
  @Post('otp/verify')
  verifyOtp(@Body() dto:VerifyOtpDTO, @Res() response:Response){
    return this.authService.verifyOTP(dto, response);
  }

  @Post('otp/resend')
  resendOtp(@Body() email:string){}
}
