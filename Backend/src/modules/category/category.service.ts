

import { Injectable, ConflictException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Category } from './entities/category.entity';
import { CreateCategoryDto } from './dto/create-category.dto';

@Injectable()
export class CategoryService {
  constructor(
    @InjectRepository(Category)
    private categoryRepository: Repository<Category>,
  ) {}

  private generateSlug(text: string): string {
    return text
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/\s+/g, '-')
      .replace(/[^\w\-]+/g, '')
      .replace(/\-\-+/g, '-')
      .replace(/^-+/, '')
      .replace(/-+$/, '');
  }

  async create(createCategoryDto: CreateCategoryDto) {
    const { name, storeId } = createCategoryDto;
    
    let slug = createCategoryDto.slug;
    if (!slug || slug.trim() === '') {
      slug = this.generateSlug(name);
    }

    const existingCategory = await this.categoryRepository.findOne({
      where: { 
        slug: slug, 
        store: { id: storeId } 
      },
    });

    if (existingCategory) {
      return existingCategory;
    }

    const newCategory = this.categoryRepository.create({
      ...createCategoryDto,
      slug,
      store: { id: storeId } as any,
    });

    return await this.categoryRepository.save(newCategory);
  }

  async findAll() {
    return await this.categoryRepository.find({
      relations: ['store'],
    });
  }

  async findOne(id: string) {
    const category = await this.categoryRepository.findOne({
      where: { id },
      relations: ['store'],
    });

    if (!category) {
      throw new NotFoundException('A keresett kategória nem található!');
    }

    return category;
  }
}






