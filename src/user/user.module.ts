import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { JwtAuthStrategy } from '../auth/strategies/jwt-auth.strategy';
import { SharedModule } from '../shared/shared.module';
import { UserController } from './controllers/user.controller';
import { BankAccount } from './entities/bank-account.entity';
import { Network } from './entities/network.entity';
import { User } from './entities/user.entity';
import { UserNetwork } from './entities/user-network.entity';
import { UserRepository } from './repositories/user.repository';
import { UserService } from './services/user.service';
import { UserAclService } from './services/user-acl.service';
import { WalletSet } from './entities/wallet-set.entity';
import { WalletSetRepository } from './repositories/wallet-set.repository';

@Module({
  imports: [
    SharedModule,
    TypeOrmModule.forFeature([User, UserNetwork, Network, BankAccount, WalletSet]),
  ],
  providers: [UserService, JwtAuthStrategy, UserAclService, UserRepository, WalletSetRepository],
  controllers: [UserController],
  exports: [UserService],
})
export class UserModule {}
