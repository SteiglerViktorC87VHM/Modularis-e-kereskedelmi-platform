import { Controller, Get, Post, Body, Patch, Param, Delete, ParseUUIDPipe } from '@nestjs/common';
import { InstalledPluginService } from './installed-plugin.service';
import { CreateInstalledPluginDto } from './dto/create-installed-plugin.dto';
import { UpdateInstalledPluginDto } from './dto/update-installed-plugin.dto';

@Controller('installed-plugins')
export class InstalledPluginController {
  constructor(private readonly installedPluginService: InstalledPluginService) {}

  @Post()
  create(@Body() createDto: CreateInstalledPluginDto) {
    return this.installedPluginService.create(createDto);
  }

  // Ez minden telepítést visszaad (Admin funkció)
  @Get()
  findAll() {
    return this.installedPluginService.findAll();
  }

  // ÚJ: Lekérdezés egy adott bolthoz (Store ID alapján)
  @Get('store/:storeId')
  findAllByStore(@Param('storeId', new ParseUUIDPipe()) storeId: string) {
    return this.installedPluginService.findAllByStore(storeId);
  }

  @Get(':id')
  findOne(@Param('id', new ParseUUIDPipe()) id: string) {
    return this.installedPluginService.findOne(id);
  }

  @Patch(':id')
  update(
    @Param('id', new ParseUUIDPipe()) id: string, 
    @Body() updateDto: UpdateInstalledPluginDto
  ) {
    return this.installedPluginService.update(id, updateDto);
  }

  @Delete(':id')
  remove(@Param('id', new ParseUUIDPipe()) id: string) {
    return this.installedPluginService.remove(id);
  }
}
