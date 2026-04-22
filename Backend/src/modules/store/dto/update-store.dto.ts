import { PartialType } from '@nestjs/mapped-types';
import { CreateStoreDto } from './create-store.dto';
import { IsOptional, IsString, MinLength } from 'class-validator';

export class UpdateStoreDto extends PartialType(CreateStoreDto) {
  @IsOptional()
  @IsString()
  @MinLength(3)
  name?: string;

  @IsOptional()
  @IsString()
  description?: string;
}
