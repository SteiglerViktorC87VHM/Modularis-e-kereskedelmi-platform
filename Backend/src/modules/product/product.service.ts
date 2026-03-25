import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Product } from './entities/product.entity';
import { Repository } from 'typeorm';
import { StoreService } from '../store/store.service';
import { CategoryService } from '../category/category.service';


@Injectable()
export class ProductService {

constructor (
 
  @InjectRepository(Product)
  private productRepository: Repository<Product>,
  private readonly storeService: StoreService,
  private readonly categoryService: CategoryService
) {}


 

async create(storeId: string, createProductDto: CreateProductDto, user: any) {
  
  const store = await this.storeService.findOne(storeId);
  if (!store) {
    throw new NotFoundException('A megadott bolt nem található!');
  }

  if (store.owner.id !== user.userId && user.role !== 'ADMIN') {
    throw new ForbiddenException('Nincs jogod ehhez a bolthoz terméket adni!');
  }

  const category = await this.categoryService.findOne(createProductDto.categoryId);
  if (!category) {
    throw new NotFoundException('A megadott kategória nem található!');
  }

  
if (category.storeId !== storeId) {
  throw new ForbiddenException('Ez a kategória nem ehhez a bolthoz tartozik!');
}


  const product = this.productRepository.create({
    ...createProductDto,
    store: store,
    category: category,
  });

  return await this.productRepository.save(product);
}

async findOne(id: string) { 
    return await this.productRepository.findOne({
      where: { id },
      relations: ['category', 'category.store']
    });
  }


async findAll(query: { storeId?: string; search?: string; minPrice?: number; maxPrice?: number }) {
  const { storeId, search, minPrice, maxPrice } = query;

  // Létrehozunk egy alap lekérdezést
  const queryBuilder = this.productRepository.createQueryBuilder('product')
    .leftJoinAndSelect('product.category', 'category')
    .leftJoinAndSelect('product.store', 'store');

  // Csak az adott bolt termékei
  if (storeId) {
    queryBuilder.andWhere('store.id = :storeId', { storeId });
  }

  // Keresés a névben (ILIKE = kis- és nagybetű nem számít)
  if (search) {
    queryBuilder.andWhere('product.name ILIKE :search', { search: `%${search}%` });
  }

  // Minimum ár szűrés
  if (minPrice) {
    queryBuilder.andWhere('product.price >= :minPrice', { minPrice });
  }

  // Maximum ár szűrés
  if (maxPrice) {
    queryBuilder.andWhere('product.price <= :maxPrice', { maxPrice });
  }

  return await queryBuilder.getMany();
}




async update(id: string, updateProductDto: UpdateProductDto, user: any) {
  const product = await this.productRepository.findOne({
    where: { id },
    relations: ['store', 'store.owner']
  });

  if (!product) {
    throw new NotFoundException('A termék nem található!');
  }

  if (product.store.owner.id !== user.userId && user.role !== 'ADMIN') {
    throw new ForbiddenException('Nincs jogosultságod a termék módosításához!');
  }

  // Frissítjük az adatokat
  Object.assign(product, updateProductDto);
  return await this.productRepository.save(product);
}







async remove(id: string, user: any) {
  
  const product = await this.productRepository.findOne({
    where: { id },
    relations: ['store', 'store.owner']
  });

  if (!product) {
    throw new NotFoundException('A termék nem található!');
  }

  
  if (product.store.owner.id !== user.userId && user.role !== 'ADMIN') {
    throw new ForbiddenException('Nincs jogosultságod a termék törléséhez!');
  }

  await this.productRepository.remove(product);
  return { message: 'Termék sikeresen törölve' };
}
}
