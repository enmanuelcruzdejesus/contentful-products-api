import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { ReportsService } from './reports.service';

@ApiTags('private/reports')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('private/reports')
export class ReportsController {
  constructor(private readonly service: ReportsService) {}

  @Get('deleted-percentage')
  deletedPct() {
    return this.service.percentageDeleted();
  }

  @Get('non-deleted-with-price')
  withPrice(@Query('withPrice') withPrice = 'true', @Query('from') from?: string, @Query('to') to?: string) {
    const f = from ? new Date(from) : undefined;
    const t = to ? new Date(to) : undefined;
    return this.service.percentageNonDeletedWithPrice({ withPrice: withPrice === 'true', from: f, to: t });
  }

  @Get('price-stats-by-category')
  priceStats() {
    return this.service.priceStatsByCategory();
  }
}