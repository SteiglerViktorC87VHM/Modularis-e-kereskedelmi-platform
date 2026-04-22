import { Controller, Post, Body, UnauthorizedException } from '@nestjs/common';
import { AuthService } from './auth.service';
import { ApiBody } from '@nestjs/swagger';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}





  @Post('login')

@ApiBody({ 
  schema: {
    type: 'object',
    properties: {
      email: { type: 'string', example: 'owner@example.com' },
      password: { type: 'string', example: 'password123' }
    }
  }
})

  async login(@Body() loginDto: any) {
    // 1. Megpróbáljuk hitelesíteni a felhasználót az AuthService segítségével
    const user = await this.authService.validateUser(loginDto.email, loginDto.password);
    
    // Ha a validateUser null-t ad vissza, akkor hiba
    if (!user) {
      throw new UnauthorizedException('Sajnos rossz az email vagy a jelszó!');
    }

    // 2. Ha minden oké, generálunk neki egy JWT tokent
    return this.authService.login(user);
  }
}
