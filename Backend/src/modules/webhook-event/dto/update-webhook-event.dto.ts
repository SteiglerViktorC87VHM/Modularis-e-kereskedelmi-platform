import { PartialType } from '@nestjs/mapped-types';
import { CreateWebhookEventDto } from './create-webhook-event.dto';

export class UpdateWebhookEventDto extends PartialType(CreateWebhookEventDto) {}
