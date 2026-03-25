import { IsString, IsNotEmpty, IsUUID, IsBoolean, IsOptional, IsObject } from 'class-validator';

export class CreatePageDto {
  @IsString()
  @IsNotEmpty()
  title: string;

  @IsString()
  @IsNotEmpty()
  slug: string;

  @IsUUID('4')
  storeId: string;

  @IsBoolean()
  @IsOptional()
  isHome?: boolean;

  @IsObject()
  @IsOptional()
  content?: any;
}