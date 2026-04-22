import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { UserModule } from '../user/user.module'; // <--- A modult importáljuk
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { PassportModule } from '@nestjs/passport/dist/passport.module';
import { JwtStrategy } from './strategies/jwt.strategy';

@Module({
  imports: [
    UserModule, // <--- Ettől fog működni a UserService a konstruktorban!
    PassportModule,
JwtModule.registerAsync({
  imports: [ConfigModule],
  inject: [ConfigService],
  useFactory: async (configService: ConfigService) => ({
    secret: 'valami_nagyon_titkos_szoveg_123', 
    signOptions: { expiresIn: '1h' },
  }),
}),
  ],
  providers: [AuthService, JwtStrategy],
  controllers: [AuthController],
})
export class AuthModule {}
