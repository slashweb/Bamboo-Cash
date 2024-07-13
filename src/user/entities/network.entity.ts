import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity('networks')
export class Network {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  chainId: string;

  @Column()
  name: string;

  @Column({ nullable: true })
  address: string;
}
