import { IsUUID, IsNumber, Min, IsPositive } from 'class-validator';

export class CreateOrderItemDto {
  @IsUUID()
  product_id: string; // A termék azonosítója

  @IsNumber()
  @Min(1)
  quantity: number; // Mennyiség, legalább 1 darab

  @IsNumber()
  @IsPositive()
  unit_price: number; // Az eladási ár
}