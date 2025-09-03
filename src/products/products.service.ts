import { Injectable, NotFoundException, Inject } from '@nestjs/common';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In, Not, IsNull } from 'typeorm';
import { Cache } from 'cache-manager';
import { Product } from '../products/product.entity';
import { QueryProductsDto } from '../products/dto/query-products.dto';

@Injectable()
export class ProductsService {
  private readonly DEFAULT_PAGE_SIZE = 5;
  private readonly TTL_SECONDS = 60;

  constructor(
    @InjectRepository(Product) private readonly repo: Repository<Product>,
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
  ) {}

  async findQuery(query: QueryProductsDto) {
    const page = query.page ?? 1;
    const limit = query.limit ?? this.DEFAULT_PAGE_SIZE;

    // Dynamic cache key based on query parameters
    const cacheKey =
      `products:list:page=${page}:limit=${limit}` +
      `:name=${query.name || ''}:category=${query.category || ''}` +
      `:priceMin=${query.priceMin ?? ''}:priceMax=${query.priceMax ?? ''}`;

    const cached = await this.cacheManager.get(cacheKey);
    if (cached) return cached;

    const qb = this.repo.createQueryBuilder('p').where('p.deletedAt IS NULL');

    if (query.name) {
      qb.andWhere('LOWER(p.name) LIKE :name', { name: `%${query.name.toLowerCase()}%` });
    }
    if (query.category) {
      qb.andWhere('p.category = :cat', { cat: query.category });
    }
    if (query.priceMin != null) {
      qb.andWhere('p.price::numeric >= :min', { min: query.priceMin });
    }
    if (query.priceMax != null) {
      qb.andWhere('p.price::numeric <= :max', { max: query.priceMax });
    }

    const [items, total] = await qb
      .orderBy('p.createdAt', 'DESC')
      .skip((page - 1) * limit)
      .take(limit)
      .getManyAndCount();

    const result = {
      page,
      pageSize: limit,
      total,
      totalPages: Math.ceil(total / limit),
      items,
    };

    // ⚠️ Pass TTL as a number (seconds), not { ttl: number }
    await this.cacheManager.set(cacheKey, result, this.TTL_SECONDS);

    return result;
  }

  async delete(id: string) {
    const product = await this.repo.findOne({ where: { id } });
    if (!product || product.deletedAt) throw new NotFoundException('Product not found');

    product.deletedAt = new Date();
    await this.repo.save(product);

    // (Optional) Invalidate caches if you’re caching lists/details
    // await this.cacheManager.reset();

    return { success: true };
  }

  /** Upsert from Contentful, skipping tombstoned (deleted) items */
  async upsertBatch(items: Array<Partial<Product>>) {
    const ids = items.map(i => i.contentfulId);
    if (!ids.length) return { inserted: 0, updated: 0, skippedDeleted: 0 };

    // Use Not(IsNull()) for "IS NOT NULL"
    const deleted = await this.repo.find({
      where: ids.map(id => ({ contentfulId: id, deletedAt: Not(IsNull()) })) as any,
    });
    const deletedIds = new Set(deleted.map(d => d.contentfulId));

    let inserted = 0, updated = 0, skippedDeleted = 0;

    for (const it of items) {
      if (!it.contentfulId) continue;
      if (deletedIds.has(it.contentfulId)) { skippedDeleted++; continue; }

      const existing = await this.repo.findOne({ where: { contentfulId: it.contentfulId } });
      if (!existing) {
        await this.repo.save(this.repo.create(it));
        inserted++;
      } else if (!existing.deletedAt) {
        await this.repo.save({ ...existing, ...it });
        updated++;
      }
    }

    // (Optional) Invalidate caches after batch changes
    // await this.cacheManager.reset();

    return { inserted, updated, skippedDeleted };
  }
}
