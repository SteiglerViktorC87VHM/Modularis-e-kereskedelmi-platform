import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Product } from './entities/product.entity';
import { Repository } from 'typeorm';
import { StoreService } from '../store/store.service';
import { CategoryService } from '../category/category.service';

@Injectable()
export class ProductService {
  constructor(
    @InjectRepository(Product)
    private productRepository: Repository<Product>,
    private readonly storeService: StoreService,
    private readonly categoryService: CategoryService
  ) {}

  async create(storeId: string, createProductDto: any, user: any) {
    const store = await this.storeService.findOne(storeId);
    if (!store) throw new NotFoundException('A bolt nem található!');

    if (store.owner.id !== user.userId && user.role !== 'ADMIN') {
      throw new ForbiddenException('Nincs jogosultságod ehhez a bolthoz!');
    }

    let category;
    if (createProductDto.categoryName) {
      category = await this.categoryService.create({
        name: createProductDto.categoryName,
        storeId: storeId,
      });
    }

    if (!category) throw new NotFoundException('Kategória megadása kötelező!');

    const product = this.productRepository.create({
      ...createProductDto,
      store: store,
      category: category,
    });

    return await this.productRepository.save(product);
  }

  async findAllByStore(storeId: string) {
    return await this.productRepository.find({
      where: { store: { id: storeId } },
      relations: ['category'],
    });
  }

  async findAll(query: any) {
    const { storeId, search } = query;
    const qb = this.productRepository.createQueryBuilder('product')
      .leftJoinAndSelect('product.category', 'category')
      .leftJoinAndSelect('product.store', 'store');
    
    if (storeId) qb.andWhere('store.id = :storeId', { storeId });
    if (search) qb.andWhere('product.name ILIKE :search', { search: `%${search}%` });
    
    return await qb.getMany();
  }

  async findOne(id: string) {
    const product = await this.productRepository.findOne({
      where: { id },
      relations: ['category', 'store', 'store.owner']
    });
    if (!product) throw new NotFoundException('Termék nem található');
    return product;
  }

  async update(id: string, updateProductDto: any, user: any) {
    const product = await this.findOne(id);

    if (product.store.owner.id !== user.userId && user.role !== 'ADMIN') {
      throw new ForbiddenException('Nincs jogosultságod a módosításhoz!');
    }

    if (updateProductDto.categoryName) {
      const category = await this.categoryService.create({
        name: updateProductDto.categoryName,
        storeId: product.store.id,
      });
      product.category = category;
    }

    if (updateProductDto.name) product.name = updateProductDto.name;
    if (updateProductDto.price !== undefined) product.price = updateProductDto.price;
    if (updateProductDto.stock !== undefined) product.stock = updateProductDto.stock;

    await this.productRepository.save(product);
    return await this.findOne(id);
  }

  async remove(id: string, user: any) {
    // JAVÍTÁS: Itt töröltem a hibás 'categories' relációt.
    // A törléshez elég a store és a store.owner a jogosultság ellenőrzéséhez.
    const product = await this.productRepository.findOne({
      where: { id },
      relations: ['store', 'store.owner'] 
    });

    if (!product) {
      throw new NotFoundException('A termék nem található vagy már törölve lett.');
    }

    if (product.store.owner.id !== user.userId && user.role !== 'ADMIN') {
      throw new ForbiddenException('Nincs jogosultságod a termék törléséhez!');
    }

    await this.productRepository.remove(product);
    
    return { message: 'Termék sikeresen törölve' };
  }
}