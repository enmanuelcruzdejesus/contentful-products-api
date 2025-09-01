import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
// import { AccessJwtStrategy } from './strategies/access-jwt.strategy';
// import { RefreshJwtStrategy } from './strategies/refresh-jwt.strategy';
import { User } from './user.entity';
import { AccessJwtStrategy } from './access-jwt.strategy';
import { RefreshJwtStrategy } from './refresh-jwt.strategy';

@Module({
  imports: [
    ConfigModule,
    PassportModule,
    TypeOrmModule.forFeature([User]),
    JwtModule.registerAsync({
      inject: [ConfigService],
      useFactory: (cfg: ConfigService) => {
        const alg = (cfg.get<string>('JWT_ALG') || 'HS256') as any;
        const base = {
          signOptions: {
            algorithm: alg,
            expiresIn: cfg.get<string>('JWT_ACCESS_TTL') || '15m',
            issuer: cfg.get<string>('JWT_ISSUER') || 'contentful-api',
            audience:
              cfg.get<string>('JWT_AUDIENCE') || 'contentful-api-clients',
          },
        } as any;
        if (
          cfg.get<string>('JWT_PRIVATE_KEY') &&
          cfg.get<string>('JWT_PUBLIC_KEY')
        ) {
          base.privateKey = cfg.get<string>('JWT_PRIVATE_KEY');
          base.publicKey = cfg.get<string>('JWT_PUBLIC_KEY');
        } else {
          base.secret = cfg.get<string>('JWT_SECRET');
        }
        return base;
      },
    }),
  ],
  providers: [AuthService, AccessJwtStrategy, RefreshJwtStrategy],
  controllers: [AuthController],
  exports: [AuthService],
})
export class AuthModule {}
