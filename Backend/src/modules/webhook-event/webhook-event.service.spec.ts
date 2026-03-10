import { Test, TestingModule } from '@nestjs/testing';
import { WebhookEventService } from './webhook-event.service';

describe('WebhookEventService', () => {
  let service: WebhookEventService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [WebhookEventService],
    }).compile();

    service = module.get<WebhookEventService>(WebhookEventService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
