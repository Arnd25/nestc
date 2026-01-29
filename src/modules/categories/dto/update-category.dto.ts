import { IsNotEmpty, IsOptional, IsString } from 'class-validator';


export class UpdateCategoryDto {
  @IsString()
  @IsOptional()
  title?: string;
  @IsString()
  @IsOptional()
  slug?: string;
}
