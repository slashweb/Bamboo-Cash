import { Injectable, NotFoundException } from '@nestjs/common';
import { DataSource, Repository } from 'typeorm';

import { Contact } from '../entities/contact.entity';

@Injectable()
export class ContactRepository extends Repository<Contact> {
  constructor(private dataSource: DataSource) {
    super(Contact, dataSource.createEntityManager());
  }

  async getById(id: number): Promise<Contact> {
    const entity = await this.findOne({ where: { id } });
    if (!entity) {
      throw new NotFoundException();
    }

    return entity;
  }
}
