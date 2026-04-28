import { Injectable, ConflictException, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Store } from './entities/store.entity';
import { StoreConfig } from './entities/store-config';
import { CreateStoreDto } from './dto/create-store.dto';
import { UpdateStoreDto } from './dto/update-store.dto';

@Injectable()
export class StoreService {
  constructor(
    @InjectRepository(Store)
    private storeRepository: Repository<Store>,
    @InjectRepository(StoreConfig)
    private storeConfigRepository: Repository<StoreConfig>,
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

  async create(createStoreDto: CreateStoreDto, user: any) { 
    let slug = createStoreDto.slug || this.generateSlug(createStoreDto.name);

    const existingStore = await this.storeRepository.findOne({ where: { slug } });
    if (existingStore) {
      throw new ConflictException('Ez a bolt név vagy URL azonosító már foglalt!');
    }

    const newStore = this.storeRepository.create({
      ...createStoreDto,
      slug, 
      owner: { id: user.userId } as any, 
    });

    const defaultConfig = new StoreConfig();
    defaultConfig.primaryColor = '#3b82f6';
    defaultConfig.secondaryColor = '#1d4ed8';
    defaultConfig.backgroundColor = '#ffffff';
    defaultConfig.bannerText = `Üdvözöljük a ${createStoreDto.name} boltban!`;

    newStore.config = defaultConfig;

    return await this.storeRepository.save(newStore);
  }

  async updateConfig(storeId: string, configData: any, user: any) {
    const store = await this.storeRepository.findOne({
      where: { id: storeId },
      relations: ['owner', 'config'],
    });

    if (!store) throw new NotFoundException('Bolt nem található');
    if (store.owner.id !== user.userId && user.role !== 'ADMIN') {
      throw new ForbiddenException('Nincs jogosultságod módosítani!');
    }

   if (!store.config) {
      const newConfig = new StoreConfig();
      Object.assign(newConfig, configData); 
      store.config = newConfig; 
    } else {
      Object.assign(store.config, configData);
    }

    return await this.storeRepository.save(store);
  }

  async findAll() {
    return await this.storeRepository.find({ relations: ['owner', 'config'] });
  }

  async findOne(id: string) {
    const store = await this.storeRepository.findOne({
      where: { id },
      relations: ['owner', 'config', 'products'], 
    });
    if (!store) throw new NotFoundException('Bolt nem található');
    return store;
  }

  async findAllByUser(userId: string) {
    return await this.storeRepository.find({
      where: { owner: { id: userId } },
      relations: ['owner', 'config', 'products'] 
    });
  }

  async update(id: string, updateStoreDto: UpdateStoreDto, user: any) {
    const store = await this.findOne(id);
    if (store.owner.id !== user.userId && user.role !== 'ADMIN') {
      throw new ForbiddenException('Nincs jogosultságod!');
    }

    // --- JAVÍTÁS ITT KEZDŐDIK ---
    // Ha a Frontend küldött 'config' adatokat (oldalak, színek, stb.)
    if (updateStoreDto.config) {
      if (store.config) {
        // Ha már van config az adatbázisban, csak BELEFÉSÜLJÜK az újat (így megmarad az ID-ja)
        Object.assign(store.config, updateStoreDto.config);
      } else {
        // Ha valamiért teljesen üres lenne a bolt beállítása
        const newConfig = new StoreConfig();
        Object.assign(newConfig, updateStoreDto.config);
        store.config = newConfig;
      }
      // Töröljük a DTO-ból a configot, hogy a lenti "buta" Object.assign ne írja felül véletlenül
      delete updateStoreDto.config;
    }
    // --- JAVÍTÁS VÉGE ---

    Object.assign(store, updateStoreDto);
    if (updateStoreDto.name && !updateStoreDto.slug) {
      store.slug = this.generateSlug(updateStoreDto.name);
    }
    return await this.storeRepository.save(store);
  }

  async remove(id: string, user: any) {
    const store = await this.findOne(id);
    if (store.owner.id !== user.userId && user.role !== 'ADMIN') {
      throw new ForbiddenException('Nincs jogosultságod!');
    }
    return await this.storeRepository.remove(store);
  }
}