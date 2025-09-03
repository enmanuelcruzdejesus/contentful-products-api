import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import envValidation from './config/env.validation';
import { TypeOrmModule } from '@nestjs/typeorm';
// import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';
import { ScheduleModule } from '@nestjs/schedule';
import { ProductsModule } from './products/products.module';
import { SyncModule } from './sync/sync.module';
import { ReportsModule } from './reports/reports.module';
import { AuthModule } from './auth/auth.module';
import { Product } from './products/product.entity';
import { User } from './auth/user.entity';
import { APP_GUARD } from '@nestjs/core';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true, validate: envValidation }),
    // ThrottlerModule.forRoot([{ ttl: 60, limit: 60 }]),
    ScheduleModule.forRoot(),
    TypeOrmModule.forRootAsync({
      useFactory: () => ({
        type: 'postgres',
        host: process.env.DB_HOST,
        port: parseInt(process.env.DB_PORT || '5432', 10),
        username: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        database: process.env.DB_NAME,
        entities: [Product, User],
        synchronize: true, // For challenge simplicity; use migrations in prod
      }),
    }),
    AuthModule,
    ProductsModule,
    SyncModule,
    ReportsModule,
  ],
  providers: [
    // { provide: APP_GUARD, useClass: ThrottlerGuard }, // make throttling a global guard via DI
  ],
})
export class AppModule {}
