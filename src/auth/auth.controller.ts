import {
  Body,
  Controller,
  Get,
  HttpCode,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBody, ApiBearerAuth } from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { LoginDto, RegisterDto } from './dto';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly auth: AuthService) {}

  @HttpCode(201)
  @Post('register')
  @ApiOperation({ summary: 'Register a new user' })
  @ApiBody({ type: RegisterDto, description: 'User registration payload' })
  @ApiResponse({ status: 201, description: 'User successfully registered' })
  register(@Body() body: RegisterDto) {
    return this.auth.register(body.email, body.password);
  }

  @HttpCode(200)
  @Post('login')
  @ApiOperation({ summary: 'Authenticate a user and return a JWT' })
  @ApiBody({ type: LoginDto, description: 'User login payload' })
  @ApiResponse({
    status: 200,
    description: 'User successfully logged in',
    schema: {
      type: 'object',
      properties: {
        access_token: { type: 'string', example: 'jwt.token.here' },
      },
    },
  })
  login(@Body() body: LoginDto) {
    return this.auth.login(body.email, body.password);
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Get('me')
  @ApiOperation({ summary: 'Retrieve the current user profile' })
  @ApiResponse({
    status: 200,
    description: 'The user profile',
    schema: {
      type: 'object',
      properties: {
        userId: { type: 'string', example: '123' },
        email: { type: 'string', example: 'user@example.com' },
      },
    },
  })
  me(@Req() req: any) {
    return req.user;
  }
}
