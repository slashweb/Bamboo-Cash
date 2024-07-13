import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';

import { User } from './user.entity';

@Entity('contacts')
export class Contact {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'ownerId' })
  ownerId: number;

  @Column()
  phone: string;

  @Column()
  name: string;

  @ManyToOne(() => User, (user) => user.contacts)
  @JoinColumn({ name: 'ownerId' })
  owner: User;
}
