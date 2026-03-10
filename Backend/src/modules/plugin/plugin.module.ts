import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PluginService } from './plugin.service';
import { PluginController } from './plugin.controller';
import { Plugin } from 'src/modules/plugin/entities/plugin.entity';
import { InstalledPlugin } from 'src/modules/installed-plugin/entities/installed-plugin.entity';

@Module({
  // 1. Regisztráljuk a Plugin táblát a TypeORM számára ebben a modulban
  imports: [TypeOrmModule.forFeature([Plugin, InstalledPlugin])],
  controllers: [PluginController],
  providers: [PluginService],
  
  // 2. Exportáljuk a szervizt, hogy más modulok (pl. Webhook) 
  // is ellenőrizni tudják a pluginokat rajta keresztül
  exports: [PluginService],
})
export class PluginModule {}