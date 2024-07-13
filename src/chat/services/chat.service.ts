import { Cache, CACHE_MANAGER } from '@nestjs/cache-manager';
import { Inject, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { TwilioService } from 'nestjs-twilio';

import { CircleService } from '../../circle/services/circle.service';
import { AppLogger } from '../../shared/logger/logger.service';
import { UserService } from '../../user/services/user.service';
import {
  CreateContactAction,
  DepositType,
  DepostAction,
  OpenAIAction,
  Operation,
  SearchContactAction,
  SendMoneyAction,
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
    console.log('sending message', to, message);
    const response = await this.twilioService.client.messages.create({
      body: message,
      from: this.fromNumber,
      to: `whatsapp:${to}`,
    });

    return response;
  }

  async trackMessageStatus(sid: string): Promise<any> {
    const message = await this.twilioService.client.messages(sid).fetch();
    return message;
  }

  async receiveMessage(
    message: TwilioMessage,
    instructions?: string,
  ): Promise<any> {
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
      if (user) {
        await this.cacheManager.set(
          `chat:thread:${number}:userId`,
          user.id,
          SESSION_TTL,
        );
      }
    }

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
      const onlyPhoneNumber = message.From.replace('whatsapp:', '');
      this.sendMessage(onlyPhoneNumber, result);
    }
  }

  async processActionMessage(
    openIaAction: OpenAIAction,
    message: TwilioMessage,
  ) {
    const number = message.From.replace('whatsapp:', '');
    const userId =
      ((await this.cacheManager.get(
        `chat:thread:${number}:userId`,
      )) as number) ?? 0;
    console.log('openIaAction: ', openIaAction);
    if (openIaAction.operation === Operation.DEPOSIT) {
      const payload = openIaAction.payload as DepostAction;

      if (payload.type === DepositType.CRYPTO) {
        const network = await this.userService.getNetworkByName(
          payload.network,
        );

        if (!network) {
          return this.sendMessage(message.From, 'Invalid network');
        }

        this.receiveMessage(
          {
            ...message,
            Body: 'Give me the address to send the crypto',
          },
          `Indicate to the user that he needs to send the crypto to the following address: ${network.address} and tell him the session is over`,
        );
      }
    } else if (openIaAction.operation === Operation.SEARCH_CONTACT) {
      const payload = openIaAction.payload as SearchContactAction;

      const contact = await this.userService.findContactByFilter({
        [payload.filter]: payload.value,
      });

      if (!contact) {
        this.receiveMessage(
          {
            ...message,
            Body: 'I dont have that contact in my contact list. Give me the infomation to create the contact',
          },
          `Indicate to the user he does not have that contact created, he needs either the phone or the name that was missing of the contact to create`,
        );
      }
    } else if (openIaAction.operation === Operation.CREATE_CONTACT) {
      const payload = openIaAction.payload as CreateContactAction;

      await this.userService.createContact(userId, payload.name, payload.phone);
      this.receiveMessage(
        {
          ...message,
          Body: 'I just created the contact',
        },
        `Indicate to the user that the contact was created successfully and ask for the amount to send in USD`,
      );
    } else if (openIaAction.operation === Operation.SEND_MONEY) {
      const payload = openIaAction.payload as SendMoneyAction;

      this.sendMessage(
        payload.contactPhone,
        `Hello {${payload.contactName}}, You have a wire transfer pending, reply this message to start checking the details`,
      );
    }
  }
}
