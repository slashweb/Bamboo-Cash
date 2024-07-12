import { Injectable, NotFoundException } from '@nestjs/common';
import { DataSource, Repository } from 'typeorm';

import { UserNetwork } from '../entities/user-network.entity';

@Injectable()
export class UserNetworkRepository extends Repository<UserNetwork> {
  constructor(private dataSource: DataSource) {
    super(UserNetwork, dataSource.createEntityManager());
  }

  async getById(id: number): Promise<UserNetwork> {
    const entity = await this.findOne({ where: { id } });
    if (!entity) {
      throw new NotFoundException();
    }

    return entity;
  }
}
