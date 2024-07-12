import { Injectable, NotFoundException } from '@nestjs/common';
import { DataSource, Repository } from 'typeorm';

import { BankAccount } from '../entities/bank-account.entity';

@Injectable()
export class BankAccountRepository extends Repository<BankAccount> {
  constructor(private dataSource: DataSource) {
    super(BankAccount, dataSource.createEntityManager());
  }

  async getById(id: number): Promise<BankAccount> {
    const entity = await this.findOne({ where: { id } });
    if (!entity) {
      throw new NotFoundException();
    }

    return entity;
  }
}
