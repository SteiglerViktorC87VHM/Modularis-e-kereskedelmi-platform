import { Injectable } from '@nestjs/common';
import { UserService } from '../user/user.service';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
  constructor(
    private userService: UserService, // Itt érjük el a felhasználókat
    private jwtService: JwtService,   // Itt generáljuk a tokent
  ) {}

  // 1. A Jelszó ellenőrzése
  async validateUser(email: string, pass: string): Promise<any> {
    const user = await this.userService.findOneByEmail(email);
    
    // Ha létezik a user és a jelszó is stimmel (bcrypt-tel összehasonlítva)
    if (user && await bcrypt.compare(pass, user.password)) {
      const { password, ...result } = user; // A jelszót kiszedjük, ne küldjük vissza
      return result;
    }
    return null;
  }

  // 2. A Token legenerálása
  async login(user: any) {
    const payload = { 
      email: user.email, 
      sub: user.id, 
      role: user.role // Ez kell majd a jogosultságkezeléshez (RBAC)!
    };
    
    return {
      access_token: this.jwtService.sign(payload),
    };
  }
}