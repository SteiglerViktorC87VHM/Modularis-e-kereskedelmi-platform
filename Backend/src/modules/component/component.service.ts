import { Injectable } from '@nestjs/common';
import { CreateComponentDto } from './dto/create-component.dto';
import { UpdateComponentDto } from './dto/update-component.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Component } from './entities/component.entity';
import { Repository } from 'typeorm';

@Injectable()
export class ComponentService {
 constructor(
@InjectRepository(Component)
private componentRepository: Repository<Component>
 ) {}

  async create(createComponentDto: CreateComponentDto) {
  return await this.componentRepository.save(createComponentDto);
  }

  async findAll() {
    return await this.componentRepository.find();
  }

  async findOne(id: string) {
    return await this.componentRepository.findOneBy({ id });
  }

   async update(id: string, updateComponentDto: UpdateComponentDto) {
    return await this.componentRepository.update(id, updateComponentDto);
  }

  async remove(id: string) {
    return await this.componentRepository.delete(id);
  }
}
