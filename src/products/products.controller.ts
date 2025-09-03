// src/products/products.controller.ts
import { Controller, Delete, Get, Param, Query } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { ProductsService } from './products.service';
import { QueryProductsDto } from './dto/query-products.dto';

@ApiTags('products')
@Controller('products')
export class ProductsController {
  constructor(private readonly service: ProductsService) {}

  @Get()
  @ApiOperation({ summary: 'Get a paginated list of products' })
  @ApiResponse({
    status: 200,
    description: 'Paginated list of products',
    schema: {
      properties: {
        page: { type: 'number', example: 1 },
        pageSize: { type: 'number', example: 5 },
        total: { type: 'number', example: 20 },
        totalPages: { type: 'number', example: 4 },
        items: {
          type: 'array',
          items: { $ref: '#/components/schemas/Product' },
        },
      },
    },
  })
  list(@Query() q: QueryProductsDto) {
    return this.service.findQuery(q);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a product by id' })
  @ApiResponse({
    status: 200,
    description: 'Product marked as deleted successfully',
    schema: {
      properties: {
        success: { type: 'boolean', example: true },
      },
    },
  })
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.service.delete(id);
  }
}
