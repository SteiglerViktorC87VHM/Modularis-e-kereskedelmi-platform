import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Role } from 'src/modules/user/enum/role.enum';
import { ROLES_KEY } from '../decorators/roles.decorator';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    // 1. Beolvassuk a @Roles() dekorátorból, hogy ki jöhet be
    const requiredRoles = this.reflector.getAllAndOverride<Role[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    // Ha nincs @Roles dekorátor, akkor az út nyilvános, bárki mehet
    if (!requiredRoles) {
      return true;
    }

    // 2. Kiszerezzük a felhasználót a kérésből (ezt a JwtAuthGuard tette bele a kérésbe!)
    const { user } = context.switchToHttp().getRequest();

    // 3. Ellenőrizzük: a júzer rangja benne van-e az engedélyezettek között?
    return requiredRoles.some((role) => user?.role === role);
  }
}