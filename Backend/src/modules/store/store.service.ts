import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Store } from './entities/store.entity';
import { CreateStoreDto } from './dto/create-store.dto';
import { UpdateStoreDto } from './dto/update-store.dto';

@Injectable()
export class StoreService {
  constructor(
    @InjectRepository(Store)
    private storeRepository: Repository<Store>, // A TypeORM "keze", amivel eléri a táblát
  ) {}

  // Létrehozás logika
  async create(createStoreDto: CreateStoreDto) {
    return await this.storeRepository.save(createStoreDto);
  }

  // Listázás logika
  async findAll() {
    return await this.storeRepository.find();
  }
}
