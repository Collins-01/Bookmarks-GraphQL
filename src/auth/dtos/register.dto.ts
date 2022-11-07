import { IsBoolean, IsEmail, IsNotEmpty, IsNumber, IsOptional, IsString, MinLength, } from 'class-validator';
export class RegisterDTO{
    @IsNotEmpty()
    @IsString()
    @IsEmail()
    email: string;


    @IsNotEmpty()
    @IsString()
    @MinLength(6)
    password: string;

    @IsNotEmpty()
    @IsNumber()
    age: number;

    // @IsBoolean()
    // @IsOptional()
    // isSubscribed: boolean;
    
}