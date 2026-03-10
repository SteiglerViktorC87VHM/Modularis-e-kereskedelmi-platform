import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProductService } from './product.service';
import { ProductController } from './product.controller';
import { Product } from './entities/product.entity';
import { Category } from 'src/modules/category/entities/category.entity';
import { Store } from 'src/modules/store/entities/store.entity';


// src/modules/product/product.module.ts

@Module({
  imports: [TypeOrmModule.forFeature([Product, Category, Store])], // Ez regisztrálja a repository-t
  controllers: [ProductController],
  providers: [ProductService],
})
export class ProductModule {}
