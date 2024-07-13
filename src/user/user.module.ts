import { forwardRef, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { JwtAuthStrategy } from '../auth/strategies/jwt-auth.strategy';
import { CircleModule } from '../circle/circle.module';
import { SharedModule } from '../shared/shared.module';
import { UserController } from './controllers/user.controller';
import { BankAccount } from './entities/bank-account.entity';
import { Contact } from './entities/contact.entity';
import { Network } from './entities/network.entity';
import { User } from './entities/user.entity';
import { UserNetwork } from './entities/user-network.entity';
import { WalletSet } from './entities/wallet-set.entity';
import { ContactRepository } from './repositories/contact.repository';
import { NetworkRepository } from './repositories/network.repository';
import { UserRepository } from './repositories/user.repository';
import { UserNetworkRepository } from './repositories/user-network.repository';
import { WalletSetRepository } from './repositories/wallet-set.repository';
import { UserService } from './services/user.service';
import { UserAclService } from './services/user-acl.service';

@Module({
  imports: [
    SharedModule,
    TypeOrmModule.forFeature([
      User,
      UserNetwork,
      Network,
      BankAccount,
      WalletSet,
      Contact,
    ]),
  ],
  providers: [
    UserService,
    JwtAuthStrategy,
    NetworkRepository,
    UserAclService,
    UserRepository,
    WalletSetRepository,
    UserNetworkRepository,
    ContactRepository,
  ],
  controllers: [UserController],
  exports: [UserService],
})
export class UserModule {}
