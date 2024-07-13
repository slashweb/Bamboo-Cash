import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { TwilioService } from 'nestjs-twilio';
import OpenAI from 'openai';

import { AppLogger } from '../../shared/logger/logger.service';

@Injectable()
export class OpenAIService {
  private readonly openIaClient;
  constructor(
    private readonly logger: AppLogger,
    private readonly configService: ConfigService,
    private readonly twilioService: TwilioService,
  ) {
    this.openIaClient = new OpenAI(this.configService.get('openai.apiKey'));
  }

  async createThread(): Promise<any> {
    const thread = await this.openIaClient.beta.threads.create();

    return thread;
  }
}
