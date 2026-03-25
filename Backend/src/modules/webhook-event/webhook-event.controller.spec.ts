import { Test, TestingModule } from '@nestjs/testing';
import { WebhookEventController } from './webhook-event.controller';
import { WebhookEventService } from './webhook-event.service';

describe('WebhookEventController', () => {
  let controller: WebhookEventController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [WebhookEventController],
      providers: [WebhookEventService],
    }).compile();

    controller = module.get<WebhookEventController>(WebhookEventController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
