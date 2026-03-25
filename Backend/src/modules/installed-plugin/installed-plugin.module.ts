import { Module } from '@nestjs/common';
import { InstalledPluginService } from './installed-plugin.service';
import { InstalledPluginController } from './installed-plugin.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { InstalledPlugin } from './entities/installed-plugin.entity';
import { Store } from '../store/entities/store.entity';
import { Plugin } from '../plugin/entities/plugin.entity';

@Module({
  imports: [TypeOrmModule.forFeature([InstalledPlugin, Store, Plugin])],
  controllers: [InstalledPluginController],
  providers: [InstalledPluginService],
})
export class InstalledPluginModule {}