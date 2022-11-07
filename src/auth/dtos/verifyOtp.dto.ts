import { IsEmail, IsNotEmpty, IsString, MaxLength, MinLength } from "class-validator";


export class VerifyOtpDTO{
    @IsNotEmpty()
    @IsString()
    @IsEmail()
    email:string;

    @IsNotEmpty()
    @IsString()
    @MinLength(4)
    @MaxLength(4)
    code:string;
}