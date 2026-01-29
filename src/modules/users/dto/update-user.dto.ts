import {
  IsEmail,
  IsEnum,
  IsOptional,
  IsString,
  MaxLength,
  MinLength,
} from 'class-validator';
import { Role } from '@prisma/client';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateUserDto {
  @IsOptional()
  @IsEmail({}, { message: 'Введите корректный email!' })
  @ApiProperty()
  email?: string;

  @IsOptional()
  @IsString()
  @MinLength(6, { message: 'Минимальная длинна пароля 6 символов!' })
  @MaxLength(12, { message: 'Максимальная длинна пароля 6 символов!' })
  @ApiProperty()
  password?: string;

  @IsOptional()
  @ApiProperty()
  @IsString()
  fullName?: string;

  @ApiProperty()
  @IsOptional()
  @IsEnum(Role, {
    message: 'Роль должна быть одной из следующих: USER или ADMIN!',
  })
  role?: Role;
}
