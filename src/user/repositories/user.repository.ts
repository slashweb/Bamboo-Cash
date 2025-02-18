import { Injectable, NotFoundException } from '@nestjs/common';
import { DataSource, Repository } from 'typeorm';

import { User } from '../entities/user.entity';

@Injectable()
export class UserRepository extends Repository<User> {
  constructor(private dataSource: DataSource) {
    super(User, dataSource.createEntityManager());
  }

  async getById(id: number): Promise<User> {
    const entity = await this.findOne({ where: { id } });
    if (!entity) {
      throw new NotFoundException();
    }

    return entity;
  }
}
