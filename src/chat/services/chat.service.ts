import { Cache, CACHE_MANAGER } from '@nestjs/cache-manager';
import { Inject, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { TwilioService } from 'nestjs-twilio';

import { AppLogger } from '../../shared/logger/logger.service';
import { OpenAIService } from './open-ai.service';

@Injectable()
export class ChatService {
  private readonly fromNumber: string;
  constructor(
    private readonly logger: AppLogger,
    private readonly configService: ConfigService,
    private readonly twilioService: TwilioService,
    private readonly openAIService: OpenAIService,
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
  ) {
    this.fromNumber = `whatsapp:${this.configService.get('twilio.phoneNumber')}`;
    this.logger.setContext(ChatService.name);
  }

  async sendMessage(to: string, message: string): Promise<any> {
    const response = await this.twilioService.client.messages.create({
      body: message,
      from: this.fromNumber,
      to: to,
    });

    return response;
  }

  async trackMessageStatus(sid: string): Promise<any> {
    const message = await this.twilioService.client.messages(sid).fetch();
    return message;
  }

  async receiveMessage(body: any): Promise<any> {
    const response = await this.openAIService.createThread();

    return response;
  }
}
