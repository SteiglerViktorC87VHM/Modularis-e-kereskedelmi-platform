// src/modules/user/dto/create-user.dto.ts
import { IsEmail, IsString, MinLength, IsOptional, IsNotEmpty, IsEnum } from 'class-validator';
import { Role } from '../enum/role.enum';

export class CreateUserDto {
  @IsEmail({}, { message: 'Érvénytelen e-mail cím!' })
  @IsNotEmpty({ message: 'Az e-mail nem lehet üres!' })
  email: string;

  @IsString()
  @IsOptional() // Mivel az entity-ben nullable: true, itt is opcionális lehet
  username?: string;

  @IsString()
  @IsNotEmpty({ message: 'A jelszó nem lehet üres!' })
  @MinLength(6, { message: 'A jelszónak legalább 6 karakternek kell lennie!' })
  password: string;

  @IsEnum(Role, { message: 'Érvénytelen jogosultság!' }) 
  @IsOptional()
  role?: Role; //
}