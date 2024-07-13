import { Injectable, NotFoundException } from '@nestjs/common';
import { DataSource, Repository } from 'typeorm';

import { WalletSet } from '../entities/wallet-set.entity';

@Injectable()
export class WalletSetRepository extends Repository<WalletSet> {
  constructor(private dataSource: DataSource) {
    super(WalletSet, dataSource.createEntityManager());
  }

  async getById(id: number): Promise<WalletSet> {
    const entity = await this.findOne({ where: { id } });
    if (!entity) {
      throw new NotFoundException();
    }

    return entity;
  }
}
