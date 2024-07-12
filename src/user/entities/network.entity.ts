import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity('networks')
export class Network {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  chanId: string;

  @Column()
  name: string;
}
