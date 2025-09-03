import {
  BadRequestException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { JwtService } from '@nestjs/jwt';
import * as argon2 from 'argon2';
import { Repository } from 'typeorm';
import { User } from './user.entity';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User) private readonly users: Repository<User>,
    private readonly jwt: JwtService,
  ) {}

  private async signAccessToken(user: User): Promise<string> {
    // keep payload tiny; add claims as needed
    const payload = { sub: user.id, email: user.email };
    return this.jwt.signAsync(payload); // uses secret + expiresIn from JwtModule
  }

  async register(email: string, password: string) {
    const normalized = email.trim().toLowerCase();
    if (password.length < 8)
      throw new BadRequestException('Password must be at least 8 characters');

    const exists = await this.users.findOne({ where: { email: normalized } });
    if (exists) throw new BadRequestException('Email already in use');

    const passwordHash = await argon2.hash(password, { type: argon2.argon2id });
    const user = await this.users.save(
      this.users.create({ email: normalized, passwordHash }),
    );

    const accessToken = await this.signAccessToken(user);
    return {
      user: { id: user.id, email: user.email },
      access_token: accessToken,
    };
  }

  async login(email: string, password: string) {
    const normalized = email.trim().toLowerCase();
    const user = await this.users.findOne({ where: { email: normalized } });
    if (!user) throw new UnauthorizedException('Invalid credentials');

    const ok = await argon2.verify(user.passwordHash, password);
    if (!ok) throw new UnauthorizedException('Invalid credentials');

    const accessToken = await this.signAccessToken(user);
    return {
      user: { id: user.id, email: user.email },
      access_token: accessToken,
    };
  }
}
