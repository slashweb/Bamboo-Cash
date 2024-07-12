import { Controller, Get } from '@nestjs/common';

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

  @Get('message')
  async message() {
    return 'hello world';
  }
}
