// src/auth/dto/register.dto.ts
import { IsEmail, IsEnum, IsOptional, IsString, MinLength } from 'class-validator';
// If your enum lives in user.entity.ts:
import { UserRole } from '../user-role.enum'; // or: '../user-role.enum' if that's your file

export class RegisterDto {
  @IsEmail()
  email!: string;

  @IsString()
  @MinLength(8)
  password!: string;

  @IsOptional()
  @IsEnum(UserRole)
  role?: UserRole;
}
