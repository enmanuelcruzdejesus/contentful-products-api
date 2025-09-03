// src/auth/dto/change-pw.dto.ts
import { IsString, MinLength } from 'class-validator';

export class ChangePwDto {
  @IsString()
  currentPassword!: string;

  @IsString()
  @MinLength(8)
  newPassword!: string;
}