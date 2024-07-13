import { Cache, CACHE_MANAGER } from '@nestjs/cache-manager';
import { Inject, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { TwilioService } from 'nestjs-twilio';

import { CircleService } from '../../circle/services/circle.service';
import { AppLogger } from '../../shared/logger/logger.service';
import { UserService } from '../../user/services/user.service';
import { TransactionRepository } from '../../wire/repositories/transaction.repository';
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
    private readonly transactionRepository: TransactionRepository,
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

  async sendMessageWithButtons(
    to: string,
    message: string,
    buttons: { label: string; action: string }[],
  ): Promise<any> {
    const response = await this.twilioService.client.messages.create({
      body: message,
      from: this.fromNumber,
      to: `whatsapp:${to}`,
      mediaUrl: buttons.map((button) => {
        return `https://api.twilio.com/2010-04-01/Accounts/${this.configService.get(
          'twilio.accountSid',
        )}/Messages/${button.action}/Media`;
      }),
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
    let threadId = await this.getThreadId(number);

    if (!threadId) {
      const thread = await this.openAIService.createThread();
      await this.cacheManager.set(
        `chat:thread:${number}`,
        thread.id,
        SESSION_TTL,
      );
      threadId = thread.id;
    }

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

    const result = await this.openAIService.processMessage(
      threadId,
      message.Body,
      instructions,
    );

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
    const threadId = await this.getThreadId(number);
    const userId =
      ((await this.cacheManager.get(
        `chat:thread:${number}:userId`,
      )) as number) ?? 0;
    if (openIaAction.operation === Operation.DEPOSIT) {
      const payload = openIaAction.payload as DepostAction;

      const userNetworks =
        await this.userService.findUserNetworksByUserId(userId);

      const userNetwork = userNetworks.find(
        (network) => network.network.name === payload.network,
      );

      const result = await this.transactionRepository.save({
        threadId: threadId,
        fromUserId: userId,
        userNetworkId: userNetwork?.id,
      });

      console.log('result: ', result);

      this.receiveMessage({
        ...message,
        Body: 'Done',
      });
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
      } else {
        this.receiveMessage(
          {
            ...message,
            Body: `I found the contact. This are the datails: name: ${contact.name}, phone: ${contact.phone}`,
          },
          `Indicate to the user that the contact was found successfully and ask for the amount to send in USD`,
        );

        const threadId = (await this.cacheManager.get(
          `chat:thread:${number}`,
        )) as string;
        await this.cacheManager.set(
          `chat:thread:reply:${contact.phone}`,
          threadId,
          SESSION_TTL,
        );
      }
    } else if (openIaAction.operation === Operation.CREATE_CONTACT) {
      const payload = openIaAction.payload as CreateContactAction;

      const contact = await this.userService.createContact(
        userId,
        payload.name,
        payload.phone,
      );

      const threadId = (await this.cacheManager.get(
        `chat:thread:${number}`,
      )) as string;
      await this.cacheManager.set(
        `chat:thread:reply:${contact.phone}`,
        threadId,
        SESSION_TTL,
      );

      this.receiveMessage(
        {
          ...message,
          Body: 'I just created the contact',
        },
        `Indicate to the user that the contact was created successfully and ask for the amount to send in USD`,
      );
    } else if (openIaAction.operation === Operation.SEND_MONEY) {
      const payload = openIaAction.payload as SendMoneyAction;

      const destinationUser = await this.userService.findUserByPhoneNumber(
        payload.contactPhone,
      );
      console.log('destinationUser: ', destinationUser);
      const threadId = await this.getThreadId(number);
      const transaction = await this.transactionRepository.findOne({
        relations: ['fromUser'],
        where: {
          threadId,
        },
      });

      if (transaction) {
        transaction.amount = payload.amount;
        if (destinationUser) {
          transaction.toUserId = destinationUser.id;
        }
        transaction.status = 'receiver_notified';
        this.transactionRepository.save(transaction);
      }

      await this.receiveMessage(
        {
          ...message,
          Body: `I just accepted`,
        },
        `Notify to the user that we are going to contact to the destination user directly`,
      );

      await this.receiveMessage(
        {
          ...message,
          From: payload.contactPhone,
          Body: `Hello ${payload.contactName}, You have a wire transfer pending. Select an option: 1. Accept Wire 2. Reject`,
        },
        `Now you are sending directly the message to the contact to accept or reject the wire transfer, and replace the sender phone number with this one ${transaction?.fromUser.phone}`,
      );
    } else if (openIaAction.operation === Operation.CONFIRM_TRANSACTION) {
      const transaction = await this.transactionRepository.findOne({
        where: {
          threadId,
        },
      });

      if (transaction) {
        transaction.status = 'completed';
        this.transactionRepository.save(transaction);
      }

      await this.receiveMessage(
        {
          ...message,
          Body: `I just confirmed`,
        },
        `Notify to the user that the transaction was completed successfully`,
      );
    }
  }

  async getThreadId(number: string): Promise<string> {
    const initialThreadId = (await this.cacheManager.get(
      `chat:thread:${number}`,
    )) as string;

    const replyThreadId = (await this.cacheManager.get(
      `chat:thread:reply:${number}`,
    )) as string;

    return replyThreadId ?? initialThreadId ?? '';
  }
}
