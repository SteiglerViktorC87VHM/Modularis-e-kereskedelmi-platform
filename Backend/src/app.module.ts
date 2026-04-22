import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';
import { StoreModule } from './modules/store/store.module'; 
import { CategoryModule } from './modules/category/category.module';
import { ProductModule } from './modules/product/product.module'; 
import { UserModule } from './modules/user/user.module';
import { AuthModule } from './modules/auth/auth.module';
import { PageModule } from './modules/page/page.module';
import { ComponentModule } from './modules/component/component.module';
import { WebhookEventModule } from './modules/webhook-event/webhook-event.module';
import { PluginModule } from './modules/plugin/plugin.module';
import { OrderModule } from './modules/order/order.module';
import { InstalledPluginModule } from './modules/installed-plugin/installed-plugin.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: process.env.DATABASE_HOST || 'localhost',
      port: parseInt(String(process.env.DATABASE_PORT || 5432), 10),
      // A docker-compose.yml alapján ezek a jó adatok:
      username: 'user', 
      password: 'password',
      database: 'modular_ecommerce',
      autoLoadEntities: true,
      // Mivel a Docker tiszta, ez most hiba nélkül felépíti a rendszert
      synchronize: true,
      logging: false,
    }),
    StoreModule,
    CategoryModule,
    ProductModule,
    UserModule,
    PageModule,
    ComponentModule,
    WebhookEventModule,
    PluginModule,
    InstalledPluginModule,
    OrderModule,
    AuthModule,
  ],
})
export class AppModule {}