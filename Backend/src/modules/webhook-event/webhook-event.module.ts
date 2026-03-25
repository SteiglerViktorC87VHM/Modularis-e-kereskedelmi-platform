import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { WebhookEventService } from './webhook-event.service';
import { WebhookEventController } from './webhook-event.controller';
import { WebhookEvent } from './entities/webhook-event.entity'; 
import { Order } from 'src/modules/order/entities/order.entity'; 
import { Plugin } from 'src/modules/plugin/entities/plugin.entity';

@Module({
  
  imports: [
    TypeOrmModule.forFeature([WebhookEvent, Order, Plugin])
  ],
  controllers: [WebhookEventController],
  providers: [WebhookEventService],
  exports: [WebhookEventService], 
})
export class WebhookEventModule {}
