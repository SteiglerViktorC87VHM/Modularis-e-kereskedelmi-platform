import { PartialType } from '@nestjs/mapped-types';
import { CreateInstalledPluginDto } from './create-installed-plugin.dto';

export class UpdateInstalledPluginDto extends PartialType(CreateInstalledPluginDto) {}
