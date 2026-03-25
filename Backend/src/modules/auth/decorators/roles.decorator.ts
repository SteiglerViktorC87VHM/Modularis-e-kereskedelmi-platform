import { SetMetadata } from '@nestjs/common';
import { Role } from 'src/modules/user/enum/role.enum';

// Ez a kulcs, ami alatt elmentjük a metaadatot
export const ROLES_KEY = 'roles';

// Ez maga a dekorátor, ami elfogad több szerepkört is (pl. Admin és Owner)
export const Roles = (...roles: Role[]) => SetMetadata(ROLES_KEY, roles);   