import { Injectable } from '@nestjs/common';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Product } from './entities/product.entity';
import { Repository } from 'typeorm';


@Injectable()
export class ProductService {

constructor (
  @InjectRepository(Product)
  private productRepository: Repository<Product>,
) {}


  async create(createProductDto: CreateProductDto) {
    const newProduct = this.productRepository.create(createProductDto);
    return await this.productRepository.save(newProduct);
  }

  async findAll() {
   
    return await this.productRepository.find({
      relations: ['category', 'category.store'],
    });
  }

  async findOne(id: string) { 
    return await this.productRepository.findOne({
      where: { id },
      relations: ['category', 'category.store']
    });
  }

  async update(id: string, updateProductDto: UpdateProductDto) {
    await this.productRepository.update(id, updateProductDto);
    return this.findOne(id);
  }

 async remove(id: string) {
    const product = await this.findOne(id);
    await this.productRepository.delete(id);
    return product;
  }
}
