import { ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import type { NextFunction, Request, Response } from 'express';
import { static as serveStatic } from 'express';
import { join } from 'path';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const config = app.get(ConfigService);
  const webOrigin = config.get<string>('WEB_ORIGIN') ?? 'http://localhost:3000';
  const loginAttempts = new Map<string, { count: number; resetAt: number }>();

  app.getHttpAdapter().getInstance().disable('x-powered-by');
  app.use((request: Request, response: Response, next: NextFunction) => {
    response.setHeader('X-Content-Type-Options', 'nosniff');
    response.setHeader('X-Frame-Options', 'DENY');
    response.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
    response.setHeader('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');
    response.setHeader('Cross-Origin-Resource-Policy', request.path.startsWith('/uploads/') ? 'cross-origin' : 'same-site');
    next();
  });
  app.use('/uploads', serveStatic(join(process.cwd(), 'uploads'), { maxAge: '30d' }));
  app.use((request: Request, response: Response, next: NextFunction) => {
    if (request.method !== 'POST' || request.path !== '/auth/login') {
      next();
      return;
    }

    const key = request.ip ?? request.socket.remoteAddress ?? 'unknown';
    const now = Date.now();
    const current = loginAttempts.get(key);
    const windowMs = 60_000;

    if (!current || current.resetAt < now) {
      loginAttempts.set(key, { count: 1, resetAt: now + windowMs });
      next();
      return;
    }

    if (current.count >= 20) {
      response.status(429).json({ message: 'Demasiados intentos. Espera un minuto e intenta nuevamente.' });
      return;
    }

    current.count += 1;
    next();
  });

  app.enableCors({
    origin: webOrigin,
    methods: ['GET', 'POST', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true
  });
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true
    })
  );

  await app.listen(config.get<number>('PORT') ?? 3001);
}

void bootstrap();
