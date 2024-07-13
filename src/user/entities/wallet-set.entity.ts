import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';

import { User } from './user.entity';

@Entity('wallet_sets')
export class WalletSet {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'userId' })
  userId: string;

  @Column()
  walletSetId: string;

  @ManyToOne(() => User, (user) => user.walletSets)
  @JoinColumn({ name: 'userId' })
  user: User;
}
