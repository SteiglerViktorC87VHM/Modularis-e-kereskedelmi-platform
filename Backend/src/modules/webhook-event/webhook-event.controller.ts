import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { WebhookEventService } from './webhook-event.service';
import { CreateWebhookEventDto } from './dto/create-webhook-event.dto';
import { UpdateWebhookEventDto } from './dto/update-webhook-event.dto';

@Controller('webhook-events') // Érdemes többes számot használni az URL-ben
export class WebhookEventController {
  constructor(private readonly webhookEventService: WebhookEventService) {}

  @Post()
  create(@Body() createDto: CreateWebhookEventDto) {
    return this.webhookEventService.create(createDto);
  }

  @Get()
  findAll() {
    return this.webhookEventService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) { // Itt NINCS plusz jel!
    return this.webhookEventService.findOne(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateDto: UpdateWebhookEventDto) {
    return this.webhookEventService.update(id, updateDto); // Itt sincs plusz jel!
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.webhookEventService.remove(id); // Itt sincs plusz jel!
  }
}
