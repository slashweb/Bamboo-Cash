import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { JwtAuthStrategy } from '../auth/strategies/jwt-auth.strategy';
import { SharedModule } from '../shared/shared.module';
import { UserController } from './controllers/user.controller';
import { User } from './entities/user.entity';
import { UserRepository } from './repositories/user.repository';
import { UserService } from './services/user.service';
import { UserAclService } from './services/user-acl.service';
import { HttpModule } from '@nestjs/axios';

@Module({
  imports: [SharedModule, TypeOrmModule.forFeature([User]), HttpModule],
  providers: [UserService, JwtAuthStrategy, UserAclService, UserRepository],
  controllers: [UserController],
  exports: [UserService],
})
export class UserModule {}
