import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';

function cookieExtractor(req: any) {
  return req?.cookies?.refresh_token || null;
}

@Injectable()
export class RefreshJwtStrategy extends PassportStrategy(
  Strategy,
  'jwt-refresh',
) {
  constructor() {
    super({
      jwtFromRequest: ExtractJwt.fromExtractors([
        cookieExtractor,
        ExtractJwt.fromAuthHeaderAsBearerToken(),
        (req) => {
          const token = req?.headers?.['x-refresh-token'];
          if (Array.isArray(token)) {
            return token[0] || null;
          }
          return typeof token === 'string' ? token : null;
        },
      ]),
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
