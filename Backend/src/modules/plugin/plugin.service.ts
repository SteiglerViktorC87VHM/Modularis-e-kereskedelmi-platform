import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Plugin } from './entities/plugin.entity';
import { CreatePluginDto } from './dto/create-plugin.dto';
import { UpdatePluginDto } from './dto/update-plugin.dto';

@Injectable()
export class PluginService {
  constructor(
    @InjectRepository(Plugin)
    private readonly pluginRepository: Repository<Plugin>,
  ) {}

  // 1. Új plugin rögzítése a katalógusba
  async create(createDto: CreatePluginDto) {
    const newPlugin = this.pluginRepository.create(createDto);
    return await this.pluginRepository.save(newPlugin);
  }

  // 2. Az összes elérhető plugin listázása
  async findAll() {
    return await this.pluginRepository.find({
      order: { name: 'ASC' },
    });
  }

  // 3. Egy konkrét plugin keresése UUID alapján
  async findOne(id: string) {
    const plugin = await this.pluginRepository.findOne({ where: { id } });
    if (!plugin) {
      throw new NotFoundException(`Plugin with ID ${id} not found`);
    }
    return plugin;
  }

  // 4. Plugin adatainak frissítése (pl. új verziószám)
  async update(id: string, updateDto: UpdatePluginDto) {
    const plugin = await this.findOne(id); // Ellenőrizzük, létezik-e
    
    // Itt használjuk a spread operátort a biztonságos összefűzéshez
    return await this.pluginRepository.save({
      ...plugin,
      ...updateDto,
    });
  }

  // 5. Plugin törlése a katalógusból
  async remove(id: string) {
    const plugin = await this.findOne(id);
    return await this.pluginRepository.remove(plugin);
  }
}
