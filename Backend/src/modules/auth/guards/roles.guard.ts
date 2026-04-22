import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Role } from '../../user/enum/role.enum';
import { ROLES_KEY } from '../decorators/roles.decorator';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

 canActivate(context: ExecutionContext): boolean {
    // 1. Beolvassuk a @Roles() dekorátorból az elvárt szerepköröket
    const requiredRoles = this.reflector.getAllAndOverride<Role[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    // Ha nincs @Roles dekorátor, mehet tovább a kérés
    if (!requiredRoles) {
      return true;
    }

    // 2. Kiszerezzük a kérést (request), hogy hozzáférjünk a fejlécekhez és a userhez
    const request = context.switchToHttp().getRequest();
    
    // 3. Kiszerezzük a felhasználót (amit a JwtAuthGuard már beletett korábban)
    const user = request.user;

    // --- DEBUG RÉSZ ---
    console.log('--- RolesGuard DEBUG ---');
    console.log('Token a fejlécben:', request.headers?.authorization);
    console.log('User a kérésben:', user);
    console.log('Elvárt role-ok:', requiredRoles);

    // 4. Ellenőrzés: ha nincs user, vagy nincs meg a kellő rangja, akkor Forbidden (403)
    if (!user) {
      return false;
    }

    return requiredRoles.some((role) => user?.role === role);
  }
}