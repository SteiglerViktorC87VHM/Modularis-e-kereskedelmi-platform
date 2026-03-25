import { Injectable, ConflictException, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Store } from './entities/store.entity';
import { CreateStoreDto } from './dto/create-store.dto';
import { User } from '../user/entities/user.entity';
import { UpdateStoreDto } from './dto/update-store.dto';

@Injectable()
export class StoreService {
  constructor(
    @InjectRepository(Store)
    private storeRepository: Repository<Store>,
  ) {}

  async create(createStoreDto: CreateStoreDto, owner: User) {
    // 1. Ellenőrizzük, hogy a slug egyedi-e (mivel az Entity-ben unique: true)
    const existingStore = await this.storeRepository.findOne({ 
      where: { slug: createStoreDto.slug } 
    });

    if (existingStore) {
      throw new ConflictException('Ez a bolt azonosító (slug) már foglalt!');
    }

    // 2. Példányosítjuk a boltot a DTO adatai és a tulajdonos alapján
    const newStore = this.storeRepository.create({
      ...createStoreDto,
      owner: owner, // Itt kötjük össze a boltot a User-rel
    });

    // 3. Mentés az adatbázisba
    return await this.storeRepository.save(newStore);
  }


async findAll() {
  return await this.storeRepository.find({
    relations: ['owner'] // Ha látni akarod, ki a tulajdonos
  });
}



async findOne(id: string) {
  const store = await this.storeRepository.findOne({
    where: { id },
    relations: ['owner'], 
  });

  if (!store) {
    throw new NotFoundException('A keresett bolt nem található!');
  }

  return store;
}



  // A findAll-t is érdemes úgy módosítani, hogy csak a saját boltjainkat lássuk
  async findAllByUser(userId: string) {
    return await this.storeRepository.find({
      where: { owner: { id: userId } }
    });
  }

async update(id: string, updateStoreDto: UpdateStoreDto, user: any) {
  // 1. Megkeressük a boltot a tulajdonosával együtt
  const store = await this.storeRepository.findOne({
    where: { id },
    relations: ['owner'], // Ez kritikus a tulajdonos ellenőrzéséhez!
  });

  if (!store) {
    throw new NotFoundException('A keresett bolt nem található!');
  }

  // 2. TULAJDONOS ELLENŐRZÉSE: A tokenből jött userId egyezik a bolt owner id-jával?
  if (store.owner.id !== user.userId && user.role !== 'ADMIN') {
    throw new ForbiddenException('Nincs jogosultságod más boltját módosítani!');
  }

  // 3. Adatok frissítése (csak amit küldtek a DTO-ban)
  Object.assign(store, updateStoreDto);

  // 4. Ha a név változott, érdemes lehet a slug-ot is újragenerálni
  if (updateStoreDto.name) {
    store.slug = updateStoreDto.name.toLowerCase().replace(/ /g, '-');
  }

  return await this.storeRepository.save(store);
}



}
