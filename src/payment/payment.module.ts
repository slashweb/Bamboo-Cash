import { HttpModule } from '@nestjs/axios';
import { Module } from '@nestjs/common';
import { UserModule } from 'src/user/user.module';

import { SharedModule } from '../shared/shared.module';
import { PaymentController } from './controllers/payment.controller';
import { BitsoService } from './services/bitso.service';
import { PaymentService } from './services/payment.service';

@Module({
  imports: [SharedModule, HttpModule, UserModule],
  providers: [PaymentService, BitsoService],
  controllers: [PaymentController],
  exports: [PaymentService],
})
export class PaymentModule {}
