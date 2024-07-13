import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';

import { User } from '../../user/entities/user.entity';

@Entity('transactions')
export class Transaction {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'fromId' })
  fromUserId: number;

  @Column({ name: 'toId' })
  toUserId: number;

  @Column()
  status: 'receiver_notified' | 'completed' | 'failed';

  @ManyToOne(() => User, (user) => user.inTransactions)
  @JoinColumn({ name: 'fromId' })
  fromUser: User;

  @ManyToOne(() => User, (user) => user.outTransactions)
  @JoinColumn({ name: 'toId' })
  toUser: User;
}
