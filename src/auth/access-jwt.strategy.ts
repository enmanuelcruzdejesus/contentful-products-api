import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';

@Injectable()
export class AccessJwtStrategy extends PassportStrategy(Strategy, 'jwt') {
  constructor() {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: process.env.JWT_PUBLIC_KEY || process.env.JWT_SECRET,
      algorithms: [(process.env.JWT_ALG || 'HS256') as any],
      issuer: process.env.JWT_ISSUER || 'contentful-api',
      audience: process.env.JWT_AUDIENCE || 'contentful-api-clients',
    });
  }
  async validate(payload: any) {
    return payload;
  }
}
