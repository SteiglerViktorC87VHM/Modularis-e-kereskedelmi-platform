import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Request, Query } from '@nestjs/common';
import { ProductService } from './product.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { Role } from '../user/enum/role.enum';



@Controller('product')
@UseGuards(JwtAuthGuard, RolesGuard) 
export class ProductController {
  constructor(private readonly productService: ProductService) {}

  @Post('store/:storeId')
  @Roles(Role.STORE_OWNER, Role.ADMIN) 
  async create(
    @Param('storeId') storeId: string, 
    @Body() createProductDto: CreateProductDto, 
    @Request() req
  ) {
    return await this.productService.create(storeId, createProductDto, req.user);
  }


@Get()
async findAll(@Query() query: { storeId?: string; search?: string; minPrice?: number; maxPrice?: number }) {

  return await this.productService.findAll(query);
}




  @Get(':id')
  async findOne(@Param('id') id: string) {
    return await this.productService.findOne(id);
  }




@Patch(':id')
@Roles(Role.STORE_OWNER, Role.ADMIN)
async update(
  @Param('id') id: string,
  @Body() updateProductDto: UpdateProductDto,
  @Request() req
) {
  return await this.productService.update(id, updateProductDto, req.user);
}

@Delete(':id')
@Roles(Role.STORE_OWNER, Role.ADMIN)
async remove(@Param('id') id: string, @Request() req) {
  return await this.productService.remove(id, req.user);
}






}

  
  

