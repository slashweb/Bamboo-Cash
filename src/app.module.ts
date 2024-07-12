import { Module } from '@nestjs/common';

import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { SharedModule } from './shared/shared.module';
import { UserModule } from './user/user.module';
import { CircleModule } from './circle/circle.module';

@Module({
  imports: [SharedModule, UserModule, AuthModule, CircleModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
