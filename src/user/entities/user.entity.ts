import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';

import { BankAccount } from './bank-account.entity';
import { UserNetwork } from './user-network.entity';
import { WalletSet } from './wallet-set.entity';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: 15 })
  phone: string;

  @OneToMany(() => BankAccount, (bankAccounts) => bankAccounts.user)
  bankAccounts: BankAccount[];

  @OneToMany(() => UserNetwork, (userNetwork) => userNetwork.user)
  networks: UserNetwork[];

  @OneToMany(() => WalletSet, (walletSet) => walletSet.user)
  walletSets: WalletSet[];
}