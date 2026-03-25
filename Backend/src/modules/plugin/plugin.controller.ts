import { Controller, Get, Post, Body, Patch, Param, Delete, ParseUUIDPipe } from '@nestjs/common';
import { PluginService } from './plugin.service';
import { CreatePluginDto } from './dto/create-plugin.dto';
import { UpdatePluginDto } from './dto/update-plugin.dto';

@Controller('plugins') // Érdemes többes számot használni az API útvonalaknál
export class PluginController {
  constructor(private readonly pluginService: PluginService) {}

  @Post()
  create(@Body() createPluginDto: CreatePluginDto) {
    return this.pluginService.create(createPluginDto);
  }

  @Get()
  findAll() {
    return this.pluginService.findAll();
  }

  @Get(':id')
  // A ParseUUIDPipe ellenőrzi, hogy a küldött ID valóban UUID formátumú-e
  findOne(@Param('id', new ParseUUIDPipe()) id: string) {
    return this.pluginService.findOne(id); // NINCS + jel!
  }

  @Patch(':id')
  update(
    @Param('id', new ParseUUIDPipe()) id: string, 
    @Body() updatePluginDto: UpdatePluginDto
  ) {
    return this.pluginService.update(id, updatePluginDto); // NINCS + jel!
  }

  @Delete(':id')
  remove(@Param('id', new ParseUUIDPipe()) id: string) {
    return this.pluginService.remove(id); // NINCS + jel!
  }
}
