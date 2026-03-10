
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm'; // Kell az adatbázis-kapcsolathoz
import { Repository } from 'typeorm';
import { Category } from './entities/category.entity'; // Beimportáljuk a tervrajzot
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';

@Injectable()
export class CategoryService {
  constructor(
    @InjectRepository(Category) // Beadjuk a "szakácsnak" a Category tábla kulcsait
    private categoryRepository: Repository<Category>,
  ) {}

  async create(createCategoryDto: CreateCategoryDto) {
    // Létrehozunk egy új kategória példányt a kapott adatokból
    const newCategory = this.categoryRepository.create(createCategoryDto);
    // Elmentjük az adatbázisba és megvárjuk (await), amíg végez
    return await this.categoryRepository.save(newCategory);
  }

  async findAll() {
    // Visszaadjuk az összes kategóriát az adatbázisból
    return await this.categoryRepository.find();
  }

  // A többi metódust (findOne, update, remove) egyelőre hagyhatod, 
  // vagy átírhatod hasonlóan a repository használatával.
}