import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(configService: ConfigService) {
    super({
      // 1. Kicsomagoljuk a tokent a fejlécből (Bearer Token)
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      // 2. Ellenőrizzük a titkos kulccsal
      secretOrKey: configService.get<string>('JWT_SECRET') || 'titkos-kulcs-123', 
    });
  }

  // 3. Ez a legfontosabb rész!
  async validate(payload: any) {
    // Amit itt visszaadsz, az kerül bele a request.user-be
    return { 
      userId: payload.sub, 
      email: payload.email, 
      role: payload.role // <--- Ezt fogja a RolesGuard keresni!
    };
  }
}