import { createHash } from 'crypto';
import { BadRequestException, Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { RealtimeGateway } from '../realtime/realtime.gateway';
import { CreateChatMessageDto } from './dto/create-chat-message.dto';

const CHAT_TTL_MS = 24 * 60 * 60 * 1000;

function sanitizeText(text: string): string {
  return text
    .replace(/[<>&"']/g, (char) => {
      switch (char) {
        case '<': return '&lt;';
        case '>': return '&gt;';
        case '&': return '&amp;';
        case '"': return '&quot;';
        case "'": return '&#39;';
        default: return char;
      }
    })
    .replace(/[\u0000-\u001F\u007F-\u009F]/g, '')
    .trim();
}
const MAX_MESSAGES = 100;

@Injectable()
export class ChatService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly realtime: RealtimeGateway
  ) {}

  async findRecent(room = 'tv') {
    await this.deleteExpired();
    return this.prisma.chatMessage.findMany({
      where: {
        room,
        isHidden: false,
        createdAt: { gte: this.expirationDate() }
      },
      orderBy: { createdAt: 'asc' },
      take: MAX_MESSAGES
    });
  }

  async create(dto: CreateChatMessageDto, ip?: string) {
    await this.deleteExpired();
    const author = sanitizeText(dto.author.trim());
    const messageText = sanitizeText(dto.message.trim());
    if (!author || !messageText) {
      throw new BadRequestException('El nombre y mensaje son obligatorios.');
    }
    if (messageText.length > 180 || author.length > 28) {
      throw new BadRequestException('El mensaje o nombre excede el largo maximo.');
    }

    const message = await this.prisma.chatMessage.create({
      data: {
        room: dto.room ?? 'tv',
        author,
        message: messageText,
        ipHash: ip ? this.hashIp(ip) : undefined
      }
    });

    this.realtime.emitChatMessage(message);
    return message;
  }

  private deleteExpired() {
    return this.prisma.chatMessage.deleteMany({
      where: { createdAt: { lt: this.expirationDate() } }
    });
  }

  private expirationDate() {
    return new Date(Date.now() - CHAT_TTL_MS);
  }

  private hashIp(ip: string) {
    return createHash('sha256').update(ip).digest('hex');
  }
}
