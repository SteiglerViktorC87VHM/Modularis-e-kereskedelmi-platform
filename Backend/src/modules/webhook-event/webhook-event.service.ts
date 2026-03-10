import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { WebhookEvent } from './entities/webhook-event.entity'; // Figyelj az elérési útra!
import { CreateWebhookEventDto } from './dto/create-webhook-event.dto';
import { UpdateWebhookEventDto } from './dto/update-webhook-event.dto';

@Injectable()
export class WebhookEventService {
  constructor(
    @InjectRepository(WebhookEvent)
    private readonly webhookRepository: Repository<WebhookEvent>,
  ) {}

  // 1. Létrehozás
  async create(createDto: CreateWebhookEventDto) {
    const newEvent = this.webhookRepository.create(createDto);
    return await this.webhookRepository.save(newEvent);
  }

  // 2. Összes lekérése
  async findAll() {
    return await this.webhookRepository.find({
      relations: ['order', 'plugin'], // Így látni fogod a kapcsolt adatokat is a listában
      order: { created_at: 'DESC' },
    });
  }

  // 3. Egy konkrét keresése UUID alapján
  async findOne(id: string) {
    const event = await this.webhookRepository.findOne({
      where: { id },
      relations: ['order', 'plugin'],
    });
    
    if (!event) {
      throw new NotFoundException(`Webhook event with ID ${id} not found`);
    }
    return event;
  }

  // 4. Módosítás (Ha pl. a státuszt akarod állítani 'processed'-re)
  async update(id: string, updateDto: UpdateWebhookEventDto) {
    const event = await this.findOne(id); // Megnézzük, létezik-e
    return await this.webhookRepository.save({ ...event, ...updateDto });
  }

  // 5. Törlés
  async remove(id: string) {
    const event = await this.findOne(id);
    return await this.webhookRepository.remove(event);
  }
}
