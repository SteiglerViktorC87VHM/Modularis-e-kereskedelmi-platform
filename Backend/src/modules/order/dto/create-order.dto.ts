import { IsUUID, IsEnum, IsNumber, IsArray, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { CreateOrderItemDto } from 'src/modules/order/dto/create-order-item.dto';

export class CreateOrderDto {
  @IsUUID()
  store_id: string; // FK a bolthoz

  @IsEnum(['pending', 'paid', 'shipped', 'cancelled'])
  status: string; // Alapértelmezetten 'pending'

  @IsNumber()
  total: number; // A rendelés végösszege

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateOrderItemDto) 
  items: CreateOrderItemDto[]; 
}
