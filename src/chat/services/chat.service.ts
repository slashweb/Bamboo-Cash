import { Cache, CACHE_MANAGER } from '@nestjs/cache-manager';
import { Inject, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { TwilioService } from 'nestjs-twilio';

import { CircleService } from '../../circle/services/circle.service';
import { AppLogger } from '../../shared/logger/logger.service';
import { UserService } from '../../user/services/user.service';
import {
  DepositType,
  DepostAction,
  OpenAIAction,
  Operation,
} from '../types/openai.type';
import { TwilioMessage } from '../types/twilio.type';
import { OpenAIService } from './open-ai.service';

const SESSION_TTL = 60000 * 3;

@Injectable()
export class ChatService {
  private readonly fromNumber: string;
  constructor(
    private readonly logger: AppLogger,
    private readonly configService: ConfigService,
    private readonly twilioService: TwilioService,
    private readonly openAIService: OpenAIService,
    private readonly userService: UserService,
    private readonly circleService: CircleService,
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

  async receiveMessage(message: TwilioMessage): Promise<any> {
    const number = message.From.replace('whatsapp:', '');
    let threadId = (await this.cacheManager.get(
      `chat:thread:${number}`,
    )) as string;

    if (!threadId) {
      const thread = await this.openAIService.createThread();
      await this.cacheManager.set(
        `chat:thread:${number}`,
        thread.id,
        SESSION_TTL,
      );
      threadId = thread.id;

      let user = await this.userService.findUserByPhoneNumber(number);
      if (!user) {
        user = await this.userService.createUser(number);
        if (user) {
          const walletSet = await this.circleService.createWalletSet(user.id);
          if (!walletSet) return;
          const responseCreateWallet = await this.circleService.createWallet(
            String(walletSet.walletSetId),
          );
          console.log('responseCreateWallet: ', responseCreateWallet);
        }
      }
    }

    const instructions = '';

    const result = await this.openAIService.processMessage(
      threadId,
      message.Body,
      instructions,
    );

    console.log('result: ', result);

    try {
      const openIaAction = JSON.parse(result) as OpenAIAction;
      this.processActionMessage(openIaAction, message);
    } catch (e) {
      this.sendMessage(message.From, result);
    }
  }

  async processActionMessage(
    openIaAction: OpenAIAction,
    message: TwilioMessage,
  ) {
    console.log('openIaAction: ', openIaAction);
    if (openIaAction.operation === Operation.DEPOSIT) {
      const payload = openIaAction.payload as DepostAction;

      if (payload.type === DepositType.CRYPTO) {
        const network = await this.userService.getNetworkByName(
          payload.network,
        );

        console.log('network: ', network);
      }
    }
  }
}
