import { Test, TestingModule } from '@nestjs/testing';
import { InstalledPluginController } from './installed-plugin.controller';
import { InstalledPluginService } from './installed-plugin.service';

describe('InstalledPluginController', () => {
  let controller: InstalledPluginController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [InstalledPluginController],
      providers: [InstalledPluginService],
    }).compile();

    controller = module.get<InstalledPluginController>(InstalledPluginController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
