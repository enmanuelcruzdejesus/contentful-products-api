import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Between, IsNull, Not, Repository } from 'typeorm';
import { Product } from '../products/product.entity';

@Injectable()
export class ReportsService {
  constructor(@InjectRepository(Product) private readonly repo: Repository<Product>) {}

  async percentageDeleted() {
    const total = await this.repo.count();
    const deleted = await this.repo.count({ where: { deletedAt: Not(IsNull()) } });
    const pct = total ? (deleted / total) * 100 : 0;
    return { total, deleted, percentage: Number(pct.toFixed(2)) };
  }

  async percentageNonDeletedWithPrice({ withPrice, from, to }: { withPrice: boolean; from?: Date; to?: Date }) {
    const dateCond = from && to ? { contentfulUpdatedAt: Between(from, to) } : {};
    const base = await this.repo.count({ where: { deletedAt: IsNull(), ...dateCond } });
    if (!base) return { base, matching: 0, percentage: 0 };

    const priceCond = withPrice ? Not(IsNull()) : IsNull();
    const matching = await this.repo.count({ where: { deletedAt: IsNull(), price: priceCond, ...dateCond } });
    const pct = (matching / base) * 100;
    return { base, matching, percentage: Number(pct.toFixed(2)) };
  }

  /** Custom report: price stats per category */
  async priceStatsByCategory() {
    const rows = await this.repo.query(`
      SELECT category,
             COUNT(*)                              AS count,
             AVG(CASE WHEN price IS NULL THEN NULL ELSE price::numeric END) AS avg_price,
             MIN(price::numeric)                   AS min_price,
             MAX(price::numeric)                   AS max_price
      FROM products
      WHERE deletedAt IS NULL
      GROUP BY category
      ORDER BY count DESC NULLS LAST;
    `);
    return rows;
  }
}