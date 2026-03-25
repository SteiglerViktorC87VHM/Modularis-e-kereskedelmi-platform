import { Module } from '@nestjs/common';
import { UserService } from './user.service';
import { UserController } from './user.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { Store } from '../store/entities/store.entity';


@Module({
  imports: [TypeOrmModule.forFeature([User, Store])], 
  controllers: [UserController],
  providers: [UserService],
  exports: [UserService], // Ezt exportáljuk, hogy más modulokban is használni tudjuk (pl. AuthModule)
})
export class UserModule {}
