import { Controller, Get, Post, Body, Request, UseGuards, Patch, Param, Delete } from '@nestjs/common';
import { StoreService } from './store.service';
import { CreateStoreDto } from './dto/create-store.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard'; // Importáld a most küldött Guard-ot!
import { Roles } from '../auth/decorators/roles.decorator'; // Importáld a dekorátort!
import { Role } from '../user/enum/role.enum';
import { UpdateStoreDto } from './dto/update-store.dto';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';


@ApiTags('store')
@ApiBearerAuth()
@Controller('store')
@UseGuards(JwtAuthGuard, RolesGuard) // Mindkét őr védi a kontrollert
export class StoreController {
  constructor(private readonly storeService: StoreService) {}

  @Delete(':id')
  @Roles(Role.STORE_OWNER, Role.ADMIN)
  async remove(@Param('id') id: string, @Request() req) {
    // Átadjuk az ID-t és a teljes user objektumot az ellenőrzéshez
    return await this.storeService.remove(id, req.user);
  }

  // store.controller.ts
@Post()
@Roles(Role.STORE_OWNER) 
create(@Body() createStoreDto: CreateStoreDto, @Request() req) {
  return this.storeService.create(createStoreDto, req.user); 
}

  @Get()
  @Roles(Role.ADMIN)
  findAll() {
  return this.storeService.findAll();
  }

@Get('my-stores') // Új végpont a saját boltoknak
@Roles(Role.STORE_OWNER, Role.ADMIN)
findAllMyStores(@Request() req) {
  return this.storeService.findAllByUser(req.user.userId);
}

@Patch(':id') // A :id jelöli, hogy itt egy változó jön az URL-ben (pl. /store/5)
  @Roles(Role.STORE_OWNER, Role.ADMIN) // Csak tulajdonos vagy admin próbálkozhat
  async update(
    @Param('id') id: string, // Kiszívja az ID-t az URL-ből
    @Body() updateStoreDto: UpdateStoreDto, // Kiszívja a módosításokat a Body-ból
    @Request() req // Kiszívja a usert, akit a JwtStrategy odarakott
  ) {
    // Meghívjuk a service-t, és átadjuk neki mind a három dolgot az ellenőrzéshez
    return await this.storeService.update(id, updateStoreDto, req.user);
  }





}