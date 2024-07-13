import { HttpService } from '@nestjs/axios';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as crypto from 'crypto';
import fetch from 'node-fetch';
import { v4 as uuidv4 } from 'uuid';
import { initiateDeveloperControlledWalletsClient } from '@circle-fin/developer-controlled-wallets';

import { AppLogger } from '../../shared/logger/logger.service';
import { UserService } from '../../user/services/user.service';

@Injectable()
export class CircleService {

  constructor(
    private readonly logger: AppLogger,
    private readonly httpService: HttpService,
    private readonly configService: ConfigService,
    private readonly userService: UserService,
  ) {
    this.logger.setContext(CircleService.name);
    this.API_KEY = this.configService.get('circle.secret');
    this.API_SK = this.configService.get('circle.sk');
    this.GET_OPTIONS = {
      method: 'GET',
      headers: {
        'Content-Yype': 'application/json',
        Authorization: `Bearer ${this.API_KEY}`,
      },
    };
    this.POST_OPTIONS = {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${this.API_KEY}`,
      },
    };
  }

  private readonly API_KEY;
  private API_SK;
  private readonly GET_OPTIONS;
  private readonly POST_OPTIONS;
  private PK_URL = 'https://api.circle.com/v1/w3s/config/entity/publicKey';
  private WALLET_SET = 'https://api.circle.com/v1/w3s/developer/walletSets';

  getPublicKeys() {
    return new Promise((resolve, reject) => {
      const secret = crypto.randomBytes(32).toString('hex');

      const circleDeveloperSdk = initiateDeveloperControlledWalletsClient({
        apiKey: this.API_KEY,
        entitySecret: secret,
      });

      circleDeveloperSdk.getPublicKey()
        .then((res) => {
          resolve({ pk: res.data?.publicKey, secret });
        })
        .catch((error: any) => {
          reject(error);
        });
    });
  };

  async createWalletSet(userId: number) {

    const circleDeveloperSdk = initiateDeveloperControlledWalletsClient({
      apiKey: this.API_KEY,
      entitySecret: this.API_SK,
    });

    const response = await circleDeveloperSdk.createWalletSet({
      name: userId.toString(),
    });


    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-expect-error
    const walletSetId = response.data.walletSet.id;

    const walletSet = await this.userService.createWalletSet(userId.toString(), walletSetId);

    return walletSet;
  }

}