import { Module } from '@nestjs/common';
import { CacheModule } from '@nestjs/cache-manager';
import { ConfigModule } from '@nestjs/config';
import envValidation from './config/env.validation';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ThrottlerModule, seconds } from '@nestjs/throttler';
import { ScheduleModule } from '@nestjs/schedule';
import { ProductsModule } from './products/products.module';
import { SyncModule } from './sync/sync.module';
import { ReportsModule } from './reports/reports.module';
import { AuthModule } from './auth/auth.module';
import { Product } from './products/product.entity';
import { User } from './auth/user.entity';
import * as redisStore from 'cache-manager-ioredis';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true, validate: envValidation }),
    // Register Redis cache (env variables REDIS_HOST and REDIS_PORT should be set)
     CacheModule.register({
      isGlobal: true,
      store: redisStore as any,
      host: process.env.REDIS_HOST || 'localhost',
      port: parseInt(process.env.REDIS_PORT ?? '6379', 10),
      ttl: 60_000, // 60s in ms for @nestjs/cache-manager
    }),
    ThrottlerModule.forRoot({
      throttlers: [
        { ttl: seconds(60), limit: 10 }, // 60s window, 10 requests
      ],
    }),
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
        synchronize: true,
      }),
    }),
    AuthModule,
    ProductsModule,
    SyncModule,
    ReportsModule,
  ],
  providers: [],
})
export class AppModule {}
