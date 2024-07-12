import { Injectable, NotFoundException } from '@nestjs/common';
import { DataSource, Repository } from 'typeorm';

import { Network } from '../entities/network.entity';

@Injectable()
export class NetworkRepository extends Repository<Network> {
  constructor(private dataSource: DataSource) {
    super(Network, dataSource.createEntityManager());
  }

  async getById(id: number): Promise<Network> {
    const entity = await this.findOne({ where: { id } });
    if (!entity) {
      throw new NotFoundException();
    }

    return entity;
  }
}
