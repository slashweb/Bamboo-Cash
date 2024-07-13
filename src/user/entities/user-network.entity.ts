import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';

import { Network } from './network.entity';
import { User } from './user.entity';

@Entity('user_networks')
export class UserNetwork {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'userId' })
  userId: string;

  @Column({ name: 'networkId' })
  networkId: string;

  @Column({ default: '0' })
  balance: string;

  @Column({ length: 1024 })
  address: string;

  @ManyToOne(() => User, (user) => user.networks)
  @JoinColumn({ name: 'userId' })
  user: User;

  @ManyToOne(() => Network, (network) => network.id)
  @JoinColumn({ name: 'networkId' })
  network: Network;
}
