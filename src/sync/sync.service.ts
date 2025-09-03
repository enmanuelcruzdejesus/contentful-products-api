import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { ProductsService } from '../products/products.service';
import { ContentfulService } from './contenful.service';

@Injectable()
export class SyncService implements OnModuleInit {
  private readonly logger = new Logger(SyncService.name);
  constructor(private readonly cf: ContentfulService, private readonly products: ProductsService) {}

  async onModuleInit() {
    // Initial pull at startup (idempotent)
    await this.sync();
  }

  @Cron(process.env.SYNC_CRON || '0 * * * *')
  async sync() {
    try {
      const items = await this.cf.listAllProducts();
      const res = await this.products.upsertBatch(items);
      this.logger.log(`Sync stats: ${JSON.stringify(res)}`);
      return res;
    } catch (e: any) {
      this.logger.error('Sync failed', e.stack || e.message);
      throw e;
    }
  }
}