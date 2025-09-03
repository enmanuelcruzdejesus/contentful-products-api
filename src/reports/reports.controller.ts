import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiResponse, ApiQuery } from '@nestjs/swagger';
import { ReportsService } from './reports.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';

@ApiTags('reports')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('reports')
export class ReportsController {
  constructor(private readonly service: ReportsService) {}

  @Get('deleted-percentage')
  @ApiOperation({ summary: 'Get percentage of deleted products' })
  @ApiResponse({
    status: 200,
    description: 'The percentage of deleted products',
    schema: {
      type: 'object',
      properties: {
        percentageDeleted: { type: 'number', example: 25 },
      },
    },
  })
  deletedPct() {
    return this.service.percentageDeleted();
  }

  @Get('non-deleted-with-price')
  @ApiOperation({ summary: 'Get percentage of non-deleted products with price filter' })
  @ApiQuery({ name: 'withPrice', required: false, description: 'Filter by price', example: 'true' })
  @ApiQuery({ name: 'from', required: false, description: 'Start date filter', example: '2025-08-01' })
  @ApiQuery({ name: 'to', required: false, description: 'End date filter', example: '2025-08-31' })
  @ApiResponse({
    status: 200,
    description: 'The percentage of non-deleted products with price within the optional date range',
    schema: {
      type: 'object',
      properties: {
        percentageNonDeletedWithPrice: { type: 'number', example: 75 },
      },
    },
  })
  withPrice(@Query('withPrice') withPrice = 'true', @Query('from') from?: string, @Query('to') to?: string) {
    const f = from ? new Date(from) : undefined;
    const t = to ? new Date(to) : undefined;
    return this.service.percentageNonDeletedWithPrice({ withPrice: withPrice === 'true', from: f, to: t });
  }

  @Get('price-stats-by-category')
  @ApiOperation({ summary: 'Get price statistics by category' })
  @ApiResponse({
    status: 200,
    description: 'Price statistics by category',
    schema: {
      type: 'object',
      properties: {
        stats: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              category: { type: 'string', example: 'Electronics' },
              avgPrice: { type: 'number', example: 100 },
            },
          },
        },
      },
    },
  })
  priceStats() {
    return this.service.priceStatsByCategory();
  }
}