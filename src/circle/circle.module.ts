import { HttpModule } from '@nestjs/axios';
import { Module } from '@nestjs/common';

import { SharedModule } from '../shared/shared.module';
import { UserModule } from '../user/user.module';
import { CircleController } from './controllers/circle.controller';
import { CircleService } from './services/circle.service';

@Module({
  imports: [SharedModule, HttpModule, UserModule],
  providers: [CircleService],
  controllers: [CircleController],
  exports: [CircleService],
})
export class CircleModule {}
