import { IsEmail, IsString, MaxLength, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class RegisterDto {
  @IsEmail({}, { message: 'Задан некорректный email адрес!' })
  @ApiProperty()
  email: string;
  @IsString({ message: 'Пароль должен быть строкой!' })
  @MinLength(6, { message: 'Минимальное количество символов должно быть 6!' })
  @MaxLength(6, { message: 'Максимальное количество символов должно быть 6!' })
  @ApiProperty()
  password: string;
  @IsString({ message: 'Имя пользователя должно быть строкой!' })
  @ApiProperty()
  fullName: string;
}
