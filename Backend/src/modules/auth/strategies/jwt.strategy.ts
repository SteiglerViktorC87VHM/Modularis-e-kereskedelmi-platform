import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(configService: ConfigService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: 'valami_nagyon_titkos_szoveg_123', 
    });
  }

  // Ez a metódus fut le, amikor a Passport megpróbálja felnyitni a tokent
  async validate(payload: any) {
    console.log('--- JWT STRATEGY: VALIDATE LEFUTOTT ---');
    console.log('A token tartalma (payload):', payload);

    if (!payload) {
      console.log('HIBA: Nincs payload a tokenben!');
      return null;
    }

    // Amit itt visszaadunk, az lesz a req.user!
    return { 
      userId: payload.sub, 
      email: payload.email, 
      role: payload.role 
    };
  }
}