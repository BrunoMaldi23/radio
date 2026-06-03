import { WebSocketGateway, WebSocketServer } from '@nestjs/websockets';
import { Server } from 'socket.io';

@WebSocketGateway({
  cors: {
    origin: process.env.WEB_ORIGIN ?? 'http://localhost:3000',
    credentials: true
  }
})
export class RealtimeGateway {
  @WebSocketServer()
  private server?: Server;

  emitBookingCreated(payload: unknown) {
    this.server?.emit('booking.created', payload);
  }

  emitBookingUpdated(payload: unknown) {
    this.server?.emit('booking.updated', payload);
  }

  emitStreamStatus(payload: unknown) {
    this.server?.emit('stream.status', payload);
  }

  emitStreamMetadata(payload: unknown) {
    this.server?.emit('stream.metadata', payload);
  }

  emitRankingUpdated(payload: unknown) {
    this.server?.emit('ranking.updated', payload);
  }

  emitContentPublished(payload: unknown) {
    this.server?.emit('content.published', payload);
  }
}
