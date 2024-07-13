import { CacheModule } from '@nestjs/cache-manager';
import { Module } from '@nestjs/common';

import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { ChatModule } from './chat/chat.module';
import { CircleModule } from './circle/circle.module';
import { PaymentModule } from './payment/payment.module';
import { SharedModule } from './shared/shared.module';
import { UserModule } from './user/user.module';
import { WireModule } from './wire/wire.module';

@Module({
  imports: [
    SharedModule,
    UserModule,
    AuthModule,
    CircleModule,
    ChatModule,
    WireModule,
    CacheModule.register(),
    PaymentModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
