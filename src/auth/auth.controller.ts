import {
  Body,
  Controller,
  Get,
  HttpCode,
  Post,
  Req,
  Res,
  UseGuards,
} from '@nestjs/common';
import { Response, Request } from 'express';
import { UserRole } from './user.entity';
// import { JwtAuthGuard } from '../auth/jwt-auth.guard';
// import { JwtAuthGuard } from './jwt-auth.guard';
import { AuthGuard } from '@nestjs/passport';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { Throttle } from '@nestjs/throttler';
import { clearAuthCookies, setAuthCookies } from './cookies';
import { SignupDto } from './dto/signup.dto';
import { LoginDto } from './dto/login.dto';
// import { JwtAuthGuard } from './jwt-auth.guard';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly auth: AuthService) {}

  @Post('signup')
  async signup(
    @Body() body: SignupDto,
    @Res({ passthrough: true }) res: Response,
  ) {
    if (process.env.ALLOW_OPEN_SIGNUP !== 'true') {
      // Allow only first user to be created without the flag
      // (admin seeded automatically if ADMIN_EMAIL/ADMIN_PASSWORD set)
      throw new Error(
        'Signups are disabled. Set ALLOW_OPEN_SIGNUP=true for local demos.',
      );
    }
    const result = await this.auth.register(
      body.email,
      body.password,
      body.role ?? UserRole.USER,
    );
    setAuthCookies(res, result.accessToken, result.refreshToken);
    return { user: result.user, access_token: result.accessToken };
  }

  @HttpCode(200)
  @Post('login')
  async login(
    @Body() body: LoginDto,
    @Res({ passthrough: true }) res: Response,
  ) {
    const result = await this.auth.login(body.email, body.password);
    setAuthCookies(res, result.accessToken, result.refreshToken);
    return { user: result.user, access_token: result.accessToken };
  }

  @UseGuards(AuthGuard('jwt-refresh'))
  @Post('refresh')
  async refresh(
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ) {
    const { sub, tv } = (req as any).user; // payload from strategy
    const token =
      req.cookies?.refresh_token ||
      req.headers['x-refresh-token'] ||
      req.headers.authorization?.split(' ')[1];
    const result = await this.auth.refresh(sub, tv, String(token));
    setAuthCookies(res, result.accessToken, result.refreshToken);
    return { user: result.user, access_token: result.accessToken };
  }

  @ApiBearerAuth()
  @UseGuards(AuthGuard)
  @Post('logout')
  async logout(@Req() req: Request, @Res({ passthrough: true }) res: Response) {
    const { sub } = (req as any).user;
    await this.auth.logout(sub);
    clearAuthCookies(res);
    return { success: true };
  }

  @ApiBearerAuth()
  @UseGuards(AuthGuard)
  @Get('me')
  me(@Req() req: Request) {
    return (req as any).user;
  }

  @ApiBearerAuth()
  @UseGuards(AuthGuard)
  @Post('change-password')
  async change(@Req() req: Request, @Body() body: ChangePwDto) {
    const { sub } = (req as any).user;
    await this.auth.changePassword(sub, body.currentPassword, body.newPassword);
    return { success: true };
  }
}
