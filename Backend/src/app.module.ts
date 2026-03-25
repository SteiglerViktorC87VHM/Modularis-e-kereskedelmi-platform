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
import { AuthModule } from './modules/auth/auth.module';
import { ConfigModule } from '@nestjs/config';
import { RolesGuard } from './modules/auth/guards/roles.guard';
import { APP_GUARD } from '@nestjs/core/constants';


@Module({
  imports: [


// 2. EZ LEGYEN AZ ELSŐ AZ IMPORTS LISTÁBAN:
    ConfigModule.forRoot({
      isGlobal: true, 
    }),


    TypeOrmModule.forRoot({
      type: 'postgres',
      host: 'localhost',
      port: 5432,
      username: process.env.DB_USERNAME || 'user', // Ha nincs az env-ben, a 'user'-t használja
      password: process.env.DB_PASSWORD || 'password',
      database: process.env.DB_NAME || 'modular_ecommerce',
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
    AuthModule,
    
  ],
providers: [
    // EZ HIÁNYZIK MÉG:
    {
      provide: APP_GUARD,
      useClass: RolesGuard,
    },
  ],
})


export class AppModule {}