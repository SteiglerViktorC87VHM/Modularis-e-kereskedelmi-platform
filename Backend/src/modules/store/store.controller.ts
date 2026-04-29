import { Controller, Get, Post, Body, Request, UseGuards, Patch, Param, Delete } from '@nestjs/common';
import { StoreService } from './store.service';
import { CreateStoreDto } from './dto/create-store.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { Role } from '../user/enum/role.enum';
import { UpdateStoreDto } from './dto/update-store.dto';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';

@ApiTags('store')
@ApiBearerAuth()
@Controller('store')
export class StoreController {
  constructor(private readonly storeService: StoreService) {}

  // 1. ELŐSZÖR jöjjenek a fix útvonalak!
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Get('my-stores')
  @Roles(Role.STORE_OWNER, Role.ADMIN)
  findAllMyStores(@Request() req) {
    // Ez adja vissza a listádat a Dashboardon
    return this.storeService.findAllByUser(req.user.userId);
  }

  // 2. UTÁNA jöhetnek a paraméteres útvonalak (mint az :id)
  // Ez a publikus végpont a vásárlóknak
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.storeService.findOne(id);
  }

  // --- INNENTŐL A TÖBBI MŰVELET ---

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Post()
  @Roles(Role.STORE_OWNER) 
  create(@Body() createStoreDto: CreateStoreDto, @Request() req) {
    return this.storeService.create(createStoreDto, req.user); 
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Get()
  @Roles(Role.ADMIN)
  findAll() {
    return this.storeService.findAll();
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Patch(':id') 
  @Roles(Role.STORE_OWNER, Role.ADMIN)
  async update(
    @Param('id') id: string, 
    @Body() updateStoreDto: UpdateStoreDto, 
    @Request() req 
  ) {
    return await this.storeService.update(id, updateStoreDto, req.user);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Delete(':id')
  @Roles(Role.STORE_OWNER, Role.ADMIN)
  async remove(@Param('id') id: string, @Request() req) {
    return await this.storeService.remove(id, req.user);
  }
}