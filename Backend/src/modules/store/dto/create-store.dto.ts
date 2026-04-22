import { IsString, IsNotEmpty, IsOptional, IsObject, MinLength } from 'class-validator';

export class CreateStoreDto {
  @IsString()
  @IsNotEmpty({ message: 'A bolt neve nem lehet üres!' })
  @MinLength(3, { message: 'A bolt nevének legalább 3 karakternek kell lennie!' })
  name: string;

  @IsString()
  @IsOptional() // Mostantól nem kötelező megadni! [cite: 74]
  slug?: string;

  @IsObject({ message: 'A konfigurációnak érvényes JSON objektumnak kell lennie!' })
  @IsOptional()
  config?: Record<string, any>; 
}