import { Module } from '@nestjs/common';
import { ContentfulService } from './contenful.service';
import { SyncService } from './sync.service';
import { ProductsModule } from '../products/products.module';

@Module({
  imports: [ProductsModule],
  providers: [ContentfulService, SyncService],
  exports: [SyncService],
})
export class SyncModule {}
