import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { WebSocketGateway, WebSocketServer } from '@nestjs/websockets';
import * as jwt from 'jsonwebtoken';
import { Server, Socket } from 'socket.io';

@Injectable()
@WebSocketGateway({
  cors: {
    origin: (process.env.WEB_ORIGIN ?? 'http://localhost:3000')
      .split(',')
      .map((origin) => origin.trim())
      .filter(Boolean),
    credentials: true
  },
  maxHttpBufferSize: 1e6,
  pingInterval: 25000,
  pingTimeout: 20000
})
export class RealtimeGateway {
  @WebSocketServer()
  private server?: Server;

  private readonly jwtSecret: string;

  constructor(private readonly config: ConfigService) {
    this.jwtSecret = this.config.get<string>('JWT_SECRET') ?? '';
  }

  afterInit() {
    if (!this.jwtSecret) {
      throw new Error('JWT_SECRET no configurado para Socket.io');
    }
  }

  handleConnection(client: Socket) {
    const token =
      client.handshake.auth?.token ??
      client.handshake.query?.token as string | undefined;

    if (token) {
      try {
        jwt.verify(token, this.jwtSecret);
        client.data.authenticated = true;
      } catch {
        client.data.authenticated = false;
      }
    } else {
      client.data.authenticated = false;
    }
  }

  private sanitizePayload(payload: unknown): unknown {
    if (payload && typeof payload === 'object') {
      const json = JSON.stringify(payload);
      if (json.length > 50000) {
        return { _truncated: true, message: 'Payload exceeds size limit' };
      }
    }
    return payload;
  }

  private emitToAll(event: string, payload: unknown) {
    this.server?.emit(event, this.sanitizePayload(payload));
  }

  private emitToAuthenticated(event: string, payload: unknown) {
    if (!this.server) return;
    const sanitized = this.sanitizePayload(payload);
    const sockets = this.server.sockets.sockets;
    for (const [, socket] of sockets) {
      if (socket.data.authenticated) {
        socket.emit(event, sanitized);
      }
    }
  }

  emitBookingCreated(payload: unknown) {
    this.emitToAuthenticated('booking.created', payload);
  }

  emitBookingUpdated(payload: unknown) {
    this.emitToAuthenticated('booking.updated', payload);
  }

  emitStreamStatus(payload: unknown) {
    this.emitToAuthenticated('stream.status', payload);
  }

  emitStreamMetadata(payload: unknown) {
    this.emitToAuthenticated('stream.metadata', payload);
  }

  emitRankingUpdated(payload: unknown) {
    this.emitToAll('ranking.updated', payload);
  }

  emitChatMessage(payload: unknown) {
    this.emitToAll('chat.message', payload);
  }

  emitContentPublished(payload: unknown) {
    this.emitToAll('content.published', payload);
  }
}
