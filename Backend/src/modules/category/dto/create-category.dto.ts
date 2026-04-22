import { IsString, IsNotEmpty, IsUUID, MinLength, IsOptional } from 'class-validator';

export class CreateCategoryDto {
  @IsString()
  @IsNotEmpty({ message: 'A kategória neve nem lehet üres!' })
  @MinLength(3, { message: 'A név legalább 3 karakter hosszú legyen!' })
  name: string;

  @IsString()
  @IsOptional()
  slug?: string;

  @IsUUID('4', { message: 'Érvénytelen bolt azonosító (UUID szükséges)!' })
  storeId: string;
}