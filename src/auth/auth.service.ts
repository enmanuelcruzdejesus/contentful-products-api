import {
  Injectable,
  UnauthorizedException,
  BadRequestException,
  ForbiddenException,
  OnModuleInit,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as argon2 from 'argon2';
import { JwtService } from '@nestjs/jwt';
import { User, UserRole } from './user.entity';

type Tokens = { accessToken: string; refreshToken: string };

@Injectable()
export class AuthService implements OnModuleInit {
  constructor(
    @InjectRepository(User) private readonly users: Repository<User>,
    private readonly jwt: JwtService,
  ) {}

  async onModuleInit() {
    const count = await this.users.count();
    if (count === 0 && process.env.ADMIN_EMAIL && process.env.ADMIN_PASSWORD) {
      const passwordHash = await argon2.hash(process.env.ADMIN_PASSWORD, {
        type: argon2.argon2id,
      });
      await this.users.save(
        this.users.create({
          email: process.env.ADMIN_EMAIL,
          password: process.env.ADMIN_PASSWORD,
          role: UserRole.ADMIN,
        }),
      );
    }
  }

  private async signTokens(user: User): Promise<Tokens> {
    const payload = {
      sub: user.id,
      email: user.email,
      role: user.role,
      tv: user.tokenVersion,
    };
    const accessToken = await this.jwt.signAsync(payload);
    const refreshToken = await this.jwt.signAsync(payload, {
      expiresIn: process.env.JWT_REFRESH_TTL || '7d',
    });
    return { accessToken, refreshToken };
  }

  private async setRefreshToken(user: User, refreshToken: string) {
    user.refreshTokenHash = await argon2.hash(refreshToken, {
      type: argon2.argon2id,
    });
    await this.users.save(user);
  }

  async register(
    email: string,
    password: string,
    role: UserRole = UserRole.USER,
  ) {
    const exists = await this.users.findOne({ where: { email } });
    if (exists) throw new BadRequestException('Email already in use');
    const passwordHash = await argon2.hash(password, { type: argon2.argon2id });
    const user = await this.users.save(
      this.users.create({ email, password: passwordHash, role }),
    );
    const tokens = await this.signTokens(user);
    await this.setRefreshToken(user, tokens.refreshToken);
    return {
      user: { id: user.id, email: user.email, role: user.role },
      ...tokens,
    };
  }

  async validateUser(email: string, password: string): Promise<User> {
    const user = await this.users.findOne({ where: { email } });
    if (!user) throw new UnauthorizedException('Invalid credentials');
    const ok = await argon2.verify(user.password, password);
    if (!ok) throw new UnauthorizedException('Invalid credentials');
    return user;
  }

  async login(email: string, password: string) {
    const user = await this.validateUser(email, password);
    user.lastLoginAt = new Date();
    const tokens = await this.signTokens(user);
    await this.setRefreshToken(user, tokens.refreshToken);
    return {
      user: { id: user.id, email: user.email, role: user.role },
      ...tokens,
    };
  }

  async refresh(userId: string, tokenVersion: number, refreshToken: string) {
    const user = await this.users.findOne({ where: { id: userId } });
    if (!user || user.tokenVersion !== tokenVersion || !user.refreshTokenHash)
      throw new UnauthorizedException();
    const match = await argon2.verify(user.refreshTokenHash, refreshToken);
    if (!match) throw new UnauthorizedException();
    const tokens = await this.signTokens(user);
    await this.setRefreshToken(user, tokens.refreshToken); // rotate
    return {
      user: { id: user.id, email: user.email, role: user.role },
      ...tokens,
    };
  }

  async logout(userId: string) {
    const user = await this.users.findOne({ where: { id: userId } });
    if (!user) return { success: true };
    user.refreshTokenHash = null;
    user.tokenVersion += 1; // revoke previous tokens
    await this.users.save(user);
    return { success: true };
  }

  async changePassword(
    userId: string,
    currentPassword: string,
    newPassword: string,
  ) {
    const user = await this.users.findOne({ where: { id: userId } });
    if (!user) throw new ForbiddenException();
    const ok = await argon2.verify(user.password, currentPassword);
    if (!ok) throw new UnauthorizedException('Current password is incorrect');
    user.password = await argon2.hash(newPassword, {
      type: argon2.argon2id,
    });
    user.tokenVersion += 1; // force re-login on all devices
    await this.users.save(user);
    return { success: true };
  }
}
