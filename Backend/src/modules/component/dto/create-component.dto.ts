// src/modules/component/dto/create-component.dto.ts
import { IsString, IsNotEmpty, IsObject, IsNumber, IsUUID } from 'class-validator';

export class CreateComponentDto {
  @IsString()
  @IsNotEmpty()
  type: string;

  @IsObject()
  config: any;

  @IsNumber()
  order: number;

  @IsUUID('4')
  pageId: string;
}
