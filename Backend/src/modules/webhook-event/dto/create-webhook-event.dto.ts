import { IsString, IsNotEmpty, IsObject, IsOptional, IsUUID } from 'class-validator';

export class CreateWebhookEventDto {
  @IsUUID()
  @IsOptional() // Nem minden webhook jön pluginon keresztül
  plugin_id?: string;

  @IsUUID()
  @IsOptional() // Lehet, hogy a webhook még nem kötődik konkrét rendeléshez
  order_id?: string;

  @IsString()
  @IsNotEmpty()
  event_type: string; // pl. 'order.paid', 'plugin.installed'

  @IsObject()
  @IsNotEmpty()
  payload: any; // A nyers JSON adat a külső rendszertől
}
