import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { StoreService } from './store.service';
import { StoreController } from './store.controller';
import { Store } from './entities/store.entity';
import { StoreConfig } from './entities/store-config';

@Module({
  imports: [TypeOrmModule.forFeature([Store, StoreConfig])], // Ezzel kapcsoljuk be az adatbázis elérést
  controllers: [StoreController],
  providers: [StoreService],
  exports: [StoreService],
})
export class StoreModule {} 