import { Response } from 'express';

export function setAuthCookies(
  res: Response,
  accessToken: string,
  refreshToken: string,
) {
  const isProd = process.env.NODE_ENV === 'production';
  res.cookie('access_token', accessToken, {
    httpOnly: true,
    secure: isProd,
    sameSite: 'strict',
    path: '/',
    maxAge: 15 * 60 * 1000,
  });
  res.cookie('refresh_token', refreshToken, {
    httpOnly: true,
    secure: isProd,
    sameSite: 'strict',
    path: '/',
    maxAge: parseTtlMs(process.env.JWT_REFRESH_TTL || '7d'),
  });
}

export function clearAuthCookies(res: Response) {
  const isProd = process.env.NODE_ENV === 'production';
  res.clearCookie('access_token', {
    httpOnly: true,
    secure: isProd,
    sameSite: 'strict',
    path: '/',
  });
  res.clearCookie('refresh_token', {
    httpOnly: true,
    secure: isProd,
    sameSite: 'strict',
    path: '/',
  });
}

function parseTtlMs(ttl: string) {
  const n = parseInt(ttl, 10);
  const unit = ttl.slice(-1);
  if (Number.isNaN(n)) return 7 * 24 * 60 * 60 * 1000;
  if (unit === 's') return n * 1000;
  if (unit === 'm') return n * 60 * 1000;
  if (unit === 'h') return n * 60 * 60 * 1000;
  if (unit === 'd') return n * 24 * 60 * 60 * 1000;
  return n; // assume ms if plain number
}
