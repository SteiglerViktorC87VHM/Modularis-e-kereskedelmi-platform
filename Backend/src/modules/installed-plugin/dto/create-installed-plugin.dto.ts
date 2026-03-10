import { IsUUID, IsObject, IsOptional, IsBoolean } from 'class-validator';

export class CreateInstalledPluginDto {
  @IsUUID()
  store_id: string;

  @IsUUID()
  plugin_id: string;

  @IsObject()
  @IsOptional()
  config?: any;

  @IsBoolean()
  @IsOptional()
  enabled?: boolean;
}