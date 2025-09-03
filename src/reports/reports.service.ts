import { Injectable, Inject } from '@nestjs/common';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';
import { InjectRepository } from '@nestjs/typeorm';
import { Between, IsNull, Not, Repository } from 'typeorm';
import { Product } from '../products/product.entity';

@Injectable()
export class ReportsService {
  private readonly TTL_SECONDS = 60;

  constructor(
    @InjectRepository(Product) private readonly repo: Repository<Product>,
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
  ) {}

  async percentageDeleted() {
    const cacheKey = 'reports:deleted-percentage';
    const cached = await this.cacheManager.get(cacheKey);
    if (cached) return cached;

    const total = await this.repo.count();
    const deleted = await this.repo.count({ where: { deletedAt: Not(IsNull()) } });
    const pct = total ? (deleted / total) * 100 : 0;
    const result = { total, deleted, percentage: Number(pct.toFixed(2)) };
    await this.cacheManager.set(cacheKey, result, this.TTL_SECONDS);
    return result;
  }

  async percentageNonDeletedWithPrice(filters: { withPrice: boolean; from?: Date; to?: Date }) {
    const { withPrice, from, to } = filters;
    const cacheKey =
      `reports:non-deleted-with-price:withPrice=${withPrice}:from=${from?.toISOString() || ''}:to=${to?.toISOString() || ''}`;
    const cached = await this.cacheManager.get(cacheKey);
    if (cached) return cached;

    const dateCond = from && to ? { contentfulUpdatedAt: Between(from, to) } : {};
    const base = await this.repo.count({ where: { deletedAt: IsNull(), ...dateCond } });
    if (!base) return { base, matching: 0, percentage: 0 };

    const priceCond = withPrice ? Not(IsNull()) : IsNull();
    const matching = await this.repo.count({ where: { deletedAt: IsNull(), price: priceCond, ...dateCond } });
    const pct = (matching / base) * 100;
    const result = { base, matching, percentage: Number(pct.toFixed(2)) };
    await this.cacheManager.set(cacheKey, result, this.TTL_SECONDS);
    return result;
  }

  async priceStatsByCategory() {
    const cacheKey = 'reports:price-stats-by-category';
    const cached = await this.cacheManager.get(cacheKey);
    if (cached) return cached;

    const rows = await this.repo.query(`
      SELECT category,
             COUNT(*) AS count,
             AVG(CASE WHEN price IS NULL THEN NULL ELSE price::numeric END) AS avg_price,
             MIN(price::numeric) AS min_price,
             MAX(price::numeric) AS max_price
      FROM products
      WHERE deletedAt IS NULL
      GROUP BY category
      ORDER BY count DESC NULLS LAST;
    `);
    await this.cacheManager.set(cacheKey, rows, this.TTL_SECONDS);
    return rows;
  }
}
