import { Controller, Get, Post, Body } from '@nestjs/common';
import { StoreService } from './store.service';
import { CreateStoreDto } from './dto/create-store.dto';
import { UpdateStoreDto } from './dto/update-store.dto';

@Controller('store') // Ez nyitja meg a http://localhost:3000/store útvonalat
export class StoreController {
  constructor(private readonly storeService: StoreService) {}

  @Post() // Itt küldjük be az adatokat
  create(@Body() createStoreDto: CreateStoreDto) {
    return this.storeService.create(createStoreDto);
  }

  @Get() // Itt kérjük le a listát
  findAll() {
    return this.storeService.findAll();
  }
}
