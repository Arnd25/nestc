import { Role } from '@prisma/client';
import { IsEmail, IsEnum, IsString, MaxLength, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateUserDto {
  @IsEmail({}, { message: 'Введите корректный email!' })
  @ApiProperty()
  email: string;
  @IsString()
  @MinLength(6, { message: 'Минимальная длинна пароля 6 символов!' })
  @MaxLength(12, { message: 'Максимальная длинна пароля 6 символов!' })
  @ApiProperty()
  password: string;
  @IsString()
  @ApiProperty()
  fullName: string;
  @IsEnum(Role, {
    message: 'Роль должна быть одной из следующих: USER или ADMIN!',
  })
  @ApiProperty()
  role: Role;
}