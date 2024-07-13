import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { SharedModule } from '../shared/shared.module';
import { Transaction } from './entities/transaction.entity';
import { TransactionRepository } from './repositories/transaction.repository';
import { WireService } from './services/wire.service';

@Module({
  imports: [SharedModule, TypeOrmModule.forFeature([Transaction])],
  providers: [WireService, TransactionRepository],
  controllers: [],
  exports: [],
})
export class WireModule {}
