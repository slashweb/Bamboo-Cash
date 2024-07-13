import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

import { AppLogger } from '../../shared/logger/logger.service';
import { Transaction } from '../entities/transaction.entity';
import { TransactionRepository } from '../repositories/transaction.repository';

@Injectable()
export class WireService {
  constructor(
    private readonly logger: AppLogger,
    private readonly configService: ConfigService,
    private readonly transactionRepository: TransactionRepository,
  ) {
    this.logger.setContext(WireService.name);
  }

  async createTransaction(data: Transaction) {
    return this.transactionRepository.save(data);
  }
}
