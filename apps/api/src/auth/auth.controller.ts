import { Body, Controller, Get, Headers, Post, Res, UnauthorizedException, UseGuards } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { Throttle } from '@nestjs/throttler';
import { Role } from '@prisma/client';
import type { Response } from 'express';
import { CurrentUser, AuthenticatedUser } from './current-user.decorator';
import { AuthService } from './auth.service';
import { BootstrapAdminDto } from './dto/bootstrap-admin.dto';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { JwtAuthGuard } from './jwt-auth.guard';
import type { JwtPayload } from './jwt-payload';
import { Roles } from './roles.decorator';
import { RolesGuard } from './roles.guard';

@Controller('auth')
export class AuthController {
  private readonly bootstrapToken: string;

  constructor(
    private readonly authService: AuthService,
    private readonly config: ConfigService,
    private readonly jwt: JwtService
  ) {
    this.bootstrapToken = this.config.get<string>('BOOTSTRAP_TOKEN') ?? '';
  }

  @Post('register')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  register(@Body() dto: RegisterDto) {
    return this.authService.register(dto);
  }

  @Get('has-users')
  hasUsers() {
    return this.authService.hasUsers();
  }

  @Post('bootstrap-admin')
  bootstrapAdmin(@Body() dto: BootstrapAdminDto, @Headers('x-bootstrap-token') headerToken?: string) {
    const token = headerToken || dto.bootstrapToken;
    if (!this.bootstrapToken || token !== this.bootstrapToken) {
      throw new UnauthorizedException('Token de bootstrap invalido.');
    }
    return this.authService.bootstrapAdmin(dto);
  }

  @Post('login')
  @Throttle({ default: { ttl: 60000, limit: 10 } })
  async login(@Body() dto: LoginDto, @Res({ passthrough: true }) response: Response) {
    const result = await this.authService.login(dto);
    const maxAge = this.config.get<string>('JWT_EXPIRES_IN') ?? '30d';
    const maxAgeMs = maxAge.endsWith('h') ? parseInt(maxAge) * 3600 * 1000 : maxAge.endsWith('d') ? parseInt(maxAge) * 86400 * 1000 : 30 * 86400 * 1000;
    response.cookie('radio_token', result.accessToken, {
      httpOnly: true,
      sameSite: 'strict',
      secure: this.config.get<string>('NODE_ENV') === 'production',
      path: '/',
      maxAge: maxAgeMs
    });
    return result;
  }

  @Get('me')
  @UseGuards(JwtAuthGuard)
  me(@CurrentUser() user: AuthenticatedUser) {
    const payload: JwtPayload = {
      sub: user.id,
      email: user.email,
      role: user.role as Role
    };
    return {
      user,
      accessToken: this.jwt.sign(payload)
    };
  }

  @Post('logout')
  logout(@Res({ passthrough: true }) response: Response) {
    response.clearCookie('radio_token', { path: '/' });
    return { ok: true };
  }
}
