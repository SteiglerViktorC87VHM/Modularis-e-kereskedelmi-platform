import { Injectable } from '@nestjs/common';
import { CreatePageDto } from './dto/create-page.dto';
import { UpdatePageDto } from './dto/update-page.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Page } from './entities/page.entity';
import { Repository } from 'typeorm';

@Injectable()
export class PageService {

  constructor(
  @InjectRepository(Page)
  private repository: Repository<Page>
  ) {}

  async create(createPageDto: CreatePageDto) {
    return await this.repository.save(createPageDto);
  }

  async findAll() {
    return await this.repository.find();
  }

  async findOne(id: string) {
    return await this.repository.findOneBy({ id });
  }

   async update(id: string, updatePageDto: UpdatePageDto) {
    return  await this.repository.update(id, updatePageDto);
  }

  async remove(id: string) {
    return  await this.repository.delete(id);
  }
}
