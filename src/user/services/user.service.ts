import { Injectable } from '@nestjs/common';
import { plainToClass } from 'class-transformer';

import { AppLogger } from '../../shared/logger/logger.service';
import { RequestContext } from '../../shared/request-context/request-context.dto';
import { CreateUserInput } from '../dtos/user-create-input.dto';
import { UserOutput } from '../dtos/user-output.dto';
import { User } from '../entities/user.entity';
import { UserRepository } from '../repositories/user.repository';
import { UserNetworkRepository } from '../repositories/user-network.repository';
import { WalletSetRepository } from '../repositories/wallet-set.repository';
import { NetworkRepository } from '../repositories/network.repository';

@Injectable()
export class UserService {
  constructor(
    private repository: UserRepository,
    private readonly logger: AppLogger,
    private walletSetRepository: WalletSetRepository,
    private userNetworkRepository: UserNetworkRepository,
    private networkRepository: NetworkRepository,
  ) {
    this.logger.setContext(UserService.name);
  }

  async findById(ctx: RequestContext, id: number): Promise<UserOutput> {
    this.logger.log(ctx, `${this.findById.name} was called`);

    this.logger.log(ctx, `calling ${UserRepository.name}.findOne`);
    const user = await this.repository.findOne({ where: { id } });

    return plainToClass(UserOutput, user, {
      excludeExtraneousValues: true,
    });
  }

  async createUser(
    ctx: RequestContext,
    input: CreateUserInput,
  ): Promise<UserOutput> {
    this.logger.log(ctx, `${this.createUser.name} was called`);

    const user = plainToClass(User, input);

    this.logger.log(ctx, `calling ${UserRepository.name}.saveUser`);
    await this.repository.save(user);

    return plainToClass(UserOutput, user, {
      excludeExtraneousValues: true,
    });
  }

  async findUserByWalletSetId(walletSetId: string) {
    const walletSet = await this.walletSetRepository.findOne({
      where: { walletSetId },
    });

    if (!walletSet) {
      return null;
    }

    return await this.repository.findOne({
      where: { id: Number(walletSet.userId) },
    });
  }

  async createWalletSet(userId: string, walletSetId: string) {
    return await this.walletSetRepository.save({ userId, walletSetId });
  }

  async createUserNetworkRepository(userId: string, chainId: string, address: string) {

    const network = await this.networkRepository.findOne({ where: { chainId } });

    if (!network) {
      throw new Error('Network not found');
    }

    return await this.userNetworkRepository.save({
      userId,
      networkId: String(network.id),
      address,
    });
  }

  // async validateUsernamePassword(
  //   ctx: RequestContext,
  //   username: string,
  //   pass: string,
  // ): Promise<UserOutput> {
  //   this.logger.log(ctx, `${this.validateUsernamePassword.name} was called`);

  //   this.logger.log(ctx, `calling ${UserRepository.name}.findOne`);
  //   const user = await this.repository.findOne({ where: { username } });
  //   if (!user) throw new UnauthorizedException();

  //   const match = await compare(pass, user.password);
  //   if (!match) throw new UnauthorizedException();

  //   return plainToClass(UserOutput, user, {
  //     excludeExtraneousValues: true,
  //   });
  // }

  // async getUsers(
  //   ctx: RequestContext,
  //   limit: number,
  //   offset: number,
  // ): Promise<{ users: UserOutput[]; count: number }> {
  //   this.logger.log(ctx, `${this.getUsers.name} was called`);

  //   this.logger.log(ctx, `calling ${UserRepository.name}.findAndCount`);
  //   const [users, count] = await this.repository.findAndCount({
  //     where: {},
  //     take: limit,
  //     skip: offset,
  //   });

  //   const usersOutput = plainToClass(UserOutput, users, {
  //     excludeExtraneousValues: true,
  //   });

  //   return { users: usersOutput, count };
  // }

  // async getUserById(ctx: RequestContext, id: number): Promise<UserOutput> {
  //   this.logger.log(ctx, `${this.getUserById.name} was called`);

  //   this.logger.log(ctx, `calling ${UserRepository.name}.getById`);
  //   const user = await this.repository.getById(id);

  //   return plainToClass(UserOutput, user, {
  //     excludeExtraneousValues: true,
  //   });
  // }

  // async findByUsername(
  //   ctx: RequestContext,
  //   username: string,
  // ): Promise<UserOutput> {
  //   this.logger.log(ctx, `${this.findByUsername.name} was called`);

  //   this.logger.log(ctx, `calling ${UserRepository.name}.findOne`);
  //   const user = await this.repository.findOne({ where: { username } });

  //   return plainToClass(UserOutput, user, {
  //     excludeExtraneousValues: true,
  //   });
  // }

  // async updateUser(
  //   ctx: RequestContext,
  //   userId: number,
  //   input: UpdateUserInput,
  // ): Promise<UserOutput> {
  //   this.logger.log(ctx, `${this.updateUser.name} was called`);

  //   this.logger.log(ctx, `calling ${UserRepository.name}.getById`);
  //   const user = await this.repository.getById(userId);

  //   // Hash the password if it exists in the input payload.
  //   if (input.password) {
  //     input.password = await hash(input.password, 10);
  //   }

  //   // merges the input (2nd line) to the found user (1st line)
  //   const updatedUser: User = {
  //     ...user,
  //     ...input,
  //   };

  //   this.logger.log(ctx, `calling ${UserRepository.name}.save`);
  //   await this.repository.save(updatedUser);

  //   return plainToClass(UserOutput, updatedUser, {
  //     excludeExtraneousValues: true,
  //   });
  // }
}
