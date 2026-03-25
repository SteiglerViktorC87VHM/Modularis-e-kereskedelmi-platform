import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm'; // Ez kell az adatbázis-kapcsolathoz
import { CategoryService } from './category.service';
import { CategoryController } from './category.controller';
import { Category } from './entities/category.entity'; // Be kell importálni az Entity-t

@Module({
  // Itt mondjuk meg a NestJS-nek, hogy ebben a modulban 
  // használni akarjuk a 'categories' táblát
  imports: [TypeOrmModule.forFeature([Category])], 
  controllers: [CategoryController],
  providers: [CategoryService],
  exports: [CategoryService], // Opcionális: ha más modulnak is kellene a CategoryService
})
export class CategoryModule {}
