import { Test, TestingModule } from '@nestjs/testing';
import { InstalledPluginService } from './installed-plugin.service';

describe('InstalledPluginService', () => {
  let service: InstalledPluginService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [InstalledPluginService],
    }).compile();

    service = module.get<InstalledPluginService>(InstalledPluginService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
