import {
  BadRequestException,
  Body,
  Controller,
  MaxFileSizeValidator,
  ParseFilePipe,
  Post,
  UploadedFile,
  UseGuards,
  UseInterceptors
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { Role } from '@prisma/client';
import { randomUUID } from 'crypto';
import { existsSync, mkdirSync, writeFileSync } from 'fs';
import { memoryStorage } from 'multer';
import { extname, join } from 'path';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { Roles } from '../auth/roles.decorator';
import { RolesGuard } from '../auth/roles.guard';

const uploadDir = join(process.cwd(), 'uploads', 'images');
const allowedMimeTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
const maxImageSize = 5 * 1024 * 1024;
const extensionByMimeType: Record<string, string> = {
  'image/jpeg': '.jpg',
  'image/png': '.png',
  'image/webp': '.webp',
  'image/gif': '.gif'
};
const JPEG_MAGIC = Buffer.from([0xff, 0xd8, 0xff]);
const PNG_MAGIC = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);
const WEBP_MAGIC = Buffer.from([0x52, 0x49, 0x46, 0x46]);
const GIF_MAGIC_87 = Buffer.from([0x47, 0x49, 0x46, 0x38, 0x37, 0x61]);
const GIF_MAGIC_89 = Buffer.from([0x47, 0x49, 0x46, 0x38, 0x39, 0x61]);

const HTTP_OK = 200;

import { lookup } from 'dns/promises';

function isPrivateIp(hostname: string): boolean {
  // Check if it's a valid IPv4
  const parts = hostname.split('.');
  if (parts.length === 4) {
    const nums = parts.map(Number);
    if (!nums.some(isNaN)) {
      if (nums[0] === 10) return true;
      if (nums[0] === 172 && nums[1] >= 16 && nums[1] <= 31) return true;
      if (nums[0] === 192 && nums[1] === 168) return true;
      if (nums[0] === 127) return true;
      if (nums[0] === 0) return true;
      if (nums[0] === 169 && nums[1] === 254) return true;
      if (nums[0] === 100 && nums[1] >= 64 && nums[1] <= 127) return true;
    }
  }
  // Check for IPv6 private ranges
  if (hostname === '::1' || hostname === '[::1]') return true;
  if (hostname.startsWith('fc') || hostname.startsWith('fd') || hostname.startsWith('[fc') || hostname.startsWith('[fd')) return true;
  if (hostname === 'localhost' || hostname === '[localhost]') return true;
  return false;
}

async function isPrivateHost(hostname: string): Promise<boolean> {
  if (isPrivateIp(hostname)) return true;
  // DNS rebind protection: resolve and check all addresses
  try {
    const addresses = await lookup(hostname, { all: true });
    for (const addr of addresses) {
      const ip = typeof addr === 'string' ? addr : addr.address;
      if (isPrivateIp(ip)) return true;
    }
  } catch {
    // If DNS fails, block it
    return true;
  }
  return false;
}

function detectImageType(buffer: Buffer): string | null {
  if (buffer.length >= 3 && JPEG_MAGIC.equals(buffer.subarray(0, 3))) {
    if (buffer[3] === 0xe0 || buffer[3] === 0xe1 || buffer[3] === 0xe2) {
      return 'image/jpeg';
    }
    const jfif = buffer.indexOf(Buffer.from('JFIF'));
    const exif = buffer.indexOf(Buffer.from('Exif'));
    if (jfif !== -1 || exif !== -1) return 'image/jpeg';
    return 'image/jpeg';
  }
  if (buffer.length >= 8 && PNG_MAGIC.equals(buffer.subarray(0, 8))) return 'image/png';
  if (buffer.length >= 4 && WEBP_MAGIC.equals(buffer.subarray(0, 4))) {
    if (buffer.length >= 12) {
      const webpHeader = buffer.subarray(8, 12).toString('ascii');
      if (webpHeader === 'WEBP') return 'image/webp';
    }
    return 'image/webp';
  }
  if (buffer.length >= 6 && (GIF_MAGIC_87.equals(buffer.subarray(0, 6)) || GIF_MAGIC_89.equals(buffer.subarray(0, 6)))) return 'image/gif';
  return null;
}

function ensureUploadDir() {
  if (!existsSync(uploadDir)) {
    mkdirSync(uploadDir, { recursive: true });
  }
}

function imageResponse(filename: string, mimetype: string, size: number) {
  return {
    path: `/uploads/images/${filename}`,
    filename,
    mimetype,
    size
  };
}

const imageFileInterceptor = FileInterceptor('file', {
  limits: { fileSize: maxImageSize },
  storage: memoryStorage(),
  fileFilter: (_request, file, callback) => {
    if (!allowedMimeTypes.includes(file.mimetype)) {
      callback(new BadRequestException('Solo se permiten imagenes JPG, PNG, WEBP o GIF.'), false);
      return;
    }
    callback(null, true);
  }
});

async function importImage(url: string | undefined) {
  const cleanUrl = url?.trim();
  if (!cleanUrl) {
    throw new BadRequestException('Ingresa una URL de imagen.');
  }

  let parsed: URL;
  try {
    parsed = new URL(cleanUrl);
  } catch {
    throw new BadRequestException('La URL de imagen no es valida.');
  }

  if (!['http:', 'https:'].includes(parsed.protocol)) {
    throw new BadRequestException('La URL debe usar http o https.');
  }

  // SSRF protection with DNS rebind mitigation
  if (await isPrivateHost(parsed.hostname)) {
    throw new BadRequestException('No se permiten URLs hacia IPs privadas o locales.');
  }

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 10000);

  const response = await fetch(parsed, {
    signal: controller.signal,
    headers: { Accept: allowedMimeTypes.join(', ') }
  }).catch(() => null);
  clearTimeout(timeout);

  if (!response?.ok) {
    throw new BadRequestException('No se pudo descargar la imagen.');
  }

  const contentType = response.headers.get('content-type')?.split(';')[0]?.toLowerCase() ?? '';
  if (!allowedMimeTypes.includes(contentType)) {
    throw new BadRequestException('La URL debe apuntar a una imagen JPG, PNG, WEBP o GIF.');
  }

  const contentLength = Number(response.headers.get('content-length') ?? 0);
  if (contentLength > maxImageSize) {
    throw new BadRequestException('La imagen supera el limite de 5 MB.');
  }

  const buffer = Buffer.from(await response.arrayBuffer());
  if (buffer.length > maxImageSize) {
    throw new BadRequestException('La imagen supera el limite de 5 MB.');
  }

  const detectedType = detectImageType(buffer);
  if (!detectedType) {
    throw new BadRequestException('El archivo descargado no es una imagen valida.');
  }

  const extension = extensionByMimeType[detectedType];
  if (!extension) {
    throw new BadRequestException('Formato de imagen no soportado.');
  }

  ensureUploadDir();
  const filename = `${Date.now()}-${randomUUID()}${extension}`;
  writeFileSync(join(uploadDir, filename), buffer);

  return imageResponse(filename, detectedType, buffer.length);
}

function parseUploadedFile(file: Express.Multer.File) {
  const buffer = file.buffer;
  if (!buffer || buffer.length === 0) {
    throw new BadRequestException('El archivo esta vacio.');
  }
  const detectedType = detectImageType(buffer);
  if (!detectedType) {
    throw new BadRequestException('El archivo subido no es una imagen valida.');
  }
  ensureUploadDir();
  const extension = extensionByMimeType[detectedType];
  const filename = `${Date.now()}-${randomUUID()}${extension}`;
  writeFileSync(join(uploadDir, filename), buffer);
  return imageResponse(filename, detectedType, buffer.length);
}

function filePipe() {
  return new ParseFilePipe({
    validators: [new MaxFileSizeValidator({ maxSize: maxImageSize })]
  });
}

@Controller('uploads')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.ADMIN, Role.EDITOR, Role.OPERATOR)
export class UploadsController {
  @Post('images')
  @UseInterceptors(imageFileInterceptor)
  uploadImage(@UploadedFile(filePipe()) file: Express.Multer.File) {
    return parseUploadedFile(file);
  }

  @Post('images/from-url')
  importImageFromUrl(@Body() body: { url?: string }) {
    return importImage(body.url);
  }
}

@Controller('uploads/public')
export class PublicUploadsController {
  @Post('images')
  @UseInterceptors(imageFileInterceptor)
  uploadImage(@UploadedFile(filePipe()) file: Express.Multer.File) {
    return parseUploadedFile(file);
  }

  @Post('images/from-url')
  importImageFromUrl(@Body() body: { url?: string }) {
    return importImage(body.url);
  }
}
