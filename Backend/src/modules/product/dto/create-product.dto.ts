import { IsString, IsNumber, IsOptional, IsUUID, Min } from 'class-validator';

export class CreateProductDto {
  @IsString()
  name: string;

  @IsNumber()
  @Min(0)
  price: number;

  @IsNumber()
  @Min(0)
  stock: number;

  // Engedélyezzük a kategória nevét, de opcionálisra tesszük
  @IsOptional()
  @IsString()
  categoryName?: string;

  // Az ID-t opcionálisra vesszük, mert vagy ezt, vagy a nevet küldjük
  @IsOptional()
  @IsUUID()
  categoryId?: string;
}
