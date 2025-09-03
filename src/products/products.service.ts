import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In, Not, IsNull } from 'typeorm';
import { Product } from '../products/product.entity';
import { QueryProductsDto } from '../products/dto/query-products.dto';

@Injectable()
export class ProductsService {
  private readonly PAGE_SIZE = 5;
  constructor(@InjectRepository(Product) private readonly repo: Repository<Product>) {}

  async findPublic(query: QueryProductsDto) {
    const page = query.page ?? 1;
    const qb = this.repo.createQueryBuilder('p').where('p.deletedAt IS NULL');

    if (query.name) qb.andWhere('LOWER(p.name) LIKE :name', { name: `%${query.name.toLowerCase()}%` });
    if (query.category) qb.andWhere('p.category = :cat', { cat: query.category });
    if (query.priceMin != null) qb.andWhere('p.price::numeric >= :min', { min: query.priceMin });
    if (query.priceMax != null) qb.andWhere('p.price::numeric <= :max', { max: query.priceMax });

    const [items, total] = await qb
      .orderBy('p.createdAt', 'DESC')
      .skip((page - 1) * this.PAGE_SIZE)
      .take(this.PAGE_SIZE)
      .getManyAndCount();

    return {
      page,
      pageSize: this.PAGE_SIZE,
      total,
      totalPages: Math.ceil(total / this.PAGE_SIZE),
      items,
    };
  }

  async deletePublic(id: string) {
    const product = await this.repo.findOne({ where: { id } });
    if (!product || product.deletedAt) throw new NotFoundException('Product not found');
    product.deletedAt = new Date();
    await this.repo.save(product);
    return { success: true };
  }

  /** Upsert from Contentful, skipping tombstoned (deleted) items */
  async upsertBatch(items: Array<Partial<Product>>) {
    const ids = items.map(i => i.contentfulId);
    if (!ids.length) return { inserted: 0, updated: 0, skippedDeleted: 0 };

    const deleted = await this.repo.find({ where: ids.map(id => ({ contentfulId: id, deletedAt: Not(null) })) as any });
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
    return { inserted, updated, skippedDeleted };
  }
}