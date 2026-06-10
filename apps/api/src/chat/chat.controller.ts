import { Body, Controller, Get, Post, Query, Req } from '@nestjs/common';
import type { Request } from 'express';
import { ChatService } from './chat.service';
import { CreateChatMessageDto } from './dto/create-chat-message.dto';

@Controller('chat')
export class ChatController {
  constructor(private readonly chatService: ChatService) {}

  @Get('messages')
  findRecent(@Query('room') room = 'tv') {
    return this.chatService.findRecent(room);
  }

  @Post('messages')
  create(@Body() dto: CreateChatMessageDto, @Req() request: Request) {
    const ip = request.ip ?? request.socket.remoteAddress;
    return this.chatService.create(dto, ip);
  }
}
