import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProductService } from './product.service';
import { ProductController } from './product.controller';
import { Product } from './entities/product.entity';
// Importáljuk a StoreModule-t, hogy elérjük a StoreService-t
import { StoreModule } from 'src/modules/store/store.module'; 
import { CategoryModule } from '../category/category.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Product]), 
    StoreModule,
    CategoryModule 
  ],
  controllers: [ProductController],
  providers: [ProductService],
})
export class ProductModule {}
