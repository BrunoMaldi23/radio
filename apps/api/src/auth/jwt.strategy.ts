import { Injectable, InternalServerErrorException, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import type { Request } from 'express';
import { PrismaService } from '../prisma/prisma.service';
import { JwtPayload } from './jwt-payload';

function extractJwtFromCookie(req: Request): string | null {
  return req?.cookies?.radio_token ?? null;
}

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    config: ConfigService,
    private readonly prisma: PrismaService
  ) {
    const secret = config.get<string>('JWT_SECRET');
    if (!secret) {
      throw new InternalServerErrorException('JWT_SECRET no configurado');
    }
    super({
      jwtFromRequest: ExtractJwt.fromExtractors([
        ExtractJwt.fromAuthHeaderAsBearerToken(),
        extractJwtFromCookie
      ]),
      ignoreExpiration: false,
      secretOrKey: secret
    });
  }

  async validate(payload: JwtPayload) {
    const user = await this.prisma.user.findUnique({
      where: { id: payload.sub },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        isActive: true,
        isPenalized: true,
        penaltyEndDate: true
      }
    });

    if (!user || !user.isActive) {
      throw new UnauthorizedException('Invalid credentials.');
    }

    return user;
  }
}
