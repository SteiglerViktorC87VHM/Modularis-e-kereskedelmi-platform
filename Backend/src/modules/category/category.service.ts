
import { Injectable, NotFoundException} from '@nestjs/common';
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


async findOne(id: string): Promise<Category> {
    // A Repository 'findOne' metódusát használjuk, ami már tudja, hogyan kell SQL-t írni
    const category = await this.categoryRepository.findOne({
      where: { id },
      relations: ['store'], // <--- Ez a kulcs! Így hozza el a boltot is.
    });

    // Ha nincs ilyen ID az adatbázisban, dobunk egy hibát
    if (!category) {
      throw new NotFoundException(`A(z) ${id} azonosítójú kategória nem található.`);
    }

    return category;
  }
}







