// src/products/products.controller.ts
import { Controller, Delete, Get, Param, Query } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { ProductsService } from './products.service';
import { QueryProductsDto } from './dto/query-products.dto';

@ApiTags('public/products')
@Controller('public/products')
export class ProductsController {
  constructor(private readonly service: ProductsService) {}

  @Get()
  list(@Query() q: QueryProductsDto) {
    return this.service.findPublic(q);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.service.deletePublic(id);
  }
}
