import { Injectable } from '@nestjs/common';
import { DataSource, Repository } from 'typeorm';

import { Payment } from '../entities/payment.entity';

@Injectable()
export class PaymentRepository extends Repository<Payment> {
  constructor(private dataSource: DataSource) {
    super(Payment, dataSource.createEntityManager());
  }
}
