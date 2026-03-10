import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { StoreModule } from './modules/store/store.module'; 
import { CategoryModule } from './modules/category/category.module';
import { ProductModule} from 'src/modules/product/product.module'; 
import { UserModule } from './modules/user/user.module';
import { PageModule } from './modules/page/page.module';
import { ComponentModule } from './modules/component/component.module';
import { WebhookEventModule } from './modules/webhook-event/webhook-event.module';
import { PluginModule } from './modules/plugin/plugin.module';
import { OrderModule } from './modules/order/order.module';
import { InstalledPluginModule } from './modules/installed-plugin/installed-plugin.module';
import { OrderItem } from './modules/order/entities/order-item.entity';


@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: 'localhost',
      port: 5432,
      username: 'user', // amit a dockerben megadtál
      password: 'password', // amit a dockerben megadtál
      database: 'modular_ecommerce',
      autoLoadEntities: true,
      synchronize: true, // fejlesztés alatt ez csinálja meg a táblákat
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
    
  ],
})
export class AppModule {}