import {
    IsEmail,
    IsNotEmpty,
    IsString,
    Length,
    
  } from 'class-validator';
  
  export class AuthDto {
    @IsEmail()
    @IsNotEmpty()
        email: string;
  
    @IsString()
    @IsNotEmpty()
    @Length(1, 50)
    password: string;
  }