import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';

import { User } from '../../user/entities/user.entity';
import { UserNetwork } from '../../user/entities/user-network.entity';

@Entity('transactions')
export class Transaction {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  threadId: string;

  @Column({ name: 'fromId' })
  fromUserId: number;

  @Column({ name: 'toId', nullable: true })
  toUserId: number;

  @Column({ name: 'userNetworkId', nullable: true })
  userNetworkId: number;

  @Column({ nullable: true })
  amount: number;

  @Column({ default: 'created' })
  status: 'created' | 'receiver_notified' | 'completed' | 'failed';

  @ManyToOne(() => User, (user) => user.inTransactions)
  @JoinColumn({ name: 'fromId' })
  fromUser: User;

  @ManyToOne(() => User, (user) => user.outTransactions)
  @JoinColumn({ name: 'toId' })
  toUser: User;

  @ManyToOne(() => UserNetwork, (userNetwork) => userNetwork.transactions)
  @JoinColumn({ name: 'userNetworkId' })
  userNetwork: UserNetwork;
}
