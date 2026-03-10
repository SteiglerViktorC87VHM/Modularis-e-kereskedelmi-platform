import { IsString, IsNotEmpty, IsOptional, IsObject, MinLength } from 'class-validator';

export class CreateStoreDto {
  @IsString()
  @IsNotEmpty()
  @MinLength(3)
  name: string;

  @IsString()
  @IsNotEmpty()
  slug: string;

  @IsObject()
  @IsOptional() // Mivel a nullable: true van az entitásban
  config?: any;
}
