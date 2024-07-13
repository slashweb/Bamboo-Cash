import { CacheModule } from '@nestjs/cache-manager';
import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TwilioModule } from 'nestjs-twilio';

import { CircleModule } from '../circle/circle.module';
import { SharedModule } from '../shared/shared.module';
import { UserModule } from '../user/user.module';
import { TransactionRepository } from '../wire/repositories/transaction.repository';
import { WireModule } from '../wire/wire.module';
import { ChatController } from './controllers/chat.controller';
import { ChatService } from './services/chat.service';
import { OpenAIService } from './services/open-ai.service';

@Module({
  imports: [
    SharedModule,
    TwilioModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (config: ConfigService) => ({
        accountSid: config.get('twilio.accountSid'),
        authToken: config.get('twilio.authToken'),
      }),
      inject: [ConfigService],
    }),
    CacheModule.register(),
    UserModule,
    CircleModule,
    WireModule,
  ],
  providers: [ChatService, OpenAIService, TransactionRepository],
  controllers: [ChatController],
  exports: [ChatService],
})
export class ChatModule {}
