import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { InstalledPlugin } from './entities/installed-plugin.entity';
import { CreateInstalledPluginDto } from './dto/create-installed-plugin.dto';
import { UpdateInstalledPluginDto } from './dto/update-installed-plugin.dto';

@Injectable()
export class InstalledPluginService {
  constructor(
    @InjectRepository(InstalledPlugin)
    private readonly installedRepo: Repository<InstalledPlugin>,
  ) {}

  // 1. Telepítés (Létrehozás)
  async create(createDto: CreateInstalledPluginDto) {
    // Ellenőrizzük, hogy ez a bolt már telepítette-e ezt a plugint korábban
    const existing = await this.installedRepo.findOne({
      where: { 
        store_id: createDto.store_id, 
        plugin_id: createDto.plugin_id 
      }
    });

    if (existing) {
      throw new BadRequestException('Ez a plugin már telepítve van ebben a boltban!');
    }

    const newInstall = this.installedRepo.create(createDto);
    return await this.installedRepo.save(newInstall);
  }

  // 2. Összes telepítés (Admin felületre)
  async findAll() {
    return await this.installedRepo.find({
      relations: ['store', 'plugin'], // Így látjuk a bolt és a plugin adatait is
    });
  }

  // 3. Egy konkrét bolt összes pluginja
  async findAllByStore(storeId: string) {
    return await this.installedRepo.find({
      where: { store_id: storeId },
      relations: ['plugin'], // Itt elég csak a plugin infó
    });
  }

  // 4. Egy konkrét telepítés adatai (pl. config lekérése)
  async findOne(id: string) {
    const install = await this.installedRepo.findOne({
      where: { id },
      relations: ['plugin', 'store'],
    });

    if (!install) {
      throw new NotFoundException(`Installation with ID ${id} not found`);
    }
    return install;
  }

  // 5. Frissítés (Config módosítása vagy ki/be kapcsolás)
  async update(id: string, updateDto: UpdateInstalledPluginDto) {
    const install = await this.findOne(id);
    
    // Biztonságos frissítés spread operátorral
    return await this.installedRepo.save({
      ...install,
      ...updateDto,
    });
  }

  // 6. Eltávolítás (Uninstall)
  async remove(id: string) {
    const install = await this.findOne(id);
    return await this.installedRepo.remove(install);
  }
}
