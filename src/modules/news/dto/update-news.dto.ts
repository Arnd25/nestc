import {
  IsOptional,
  IsString,
  IsUUID,
  MaxLength,
  MinLength,
} from 'class-validator';

export class UpdateNewsDto {
  @IsString()
  @MinLength(4, { message: 'Минимальной кол-во символов 4' })
  @MaxLength(200)
  @IsOptional()
  title?: string;
  @IsString()
  @IsOptional()
  @MinLength(20, { message: 'Минимальной кол-во символов 20' })
  content?: string;
  @IsOptional()
  isActive?: boolean;
  @IsUUID(4, { message: 'неправильный формат id' })
  @IsOptional()
  categoryId?: string;
}
