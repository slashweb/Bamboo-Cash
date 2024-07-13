import { Body, Controller, Get, Param, Post } from '@nestjs/common';

import { AppLogger } from '../../shared/logger/logger.service';
import { ChatService } from '../services/chat.service';

@Controller('chat')
export class ChatController {
  constructor(
    private readonly logger: AppLogger,
    private readonly chatService: ChatService,
  ) {
    this.logger.setContext(ChatController.name);
  }

  @Post('message')
  async message(@Body() body: { to: string; message: string }) {
    const { to, message } = body;
    return this.chatService.sendMessage(`whatsapp:${to}`, message);
  }

  @Get('status/:sid')
  async status(@Param('sid') sid: string) {
    return this.chatService.trackMessageStatus(sid);
  }

  @Post('webhook')
  async webhook(@Body() body: any) {
    console.log({
      body,
    });
    return 'OK';
  }

  @Get('create-assistant')
  async createAssistant() {
    return this.chatService.createAssistant();
  }
}
