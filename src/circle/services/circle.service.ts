import { initiateDeveloperControlledWalletsClient } from '@circle-fin/developer-controlled-wallets';
import { Blockchain } from '@circle-fin/smart-contract-platform';
import { HttpService } from '@nestjs/axios';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as crypto from 'crypto';
import { encodeParameter } from 'web3-eth-abi';
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
  private readonly API_SK;
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

      circleDeveloperSdk
        .getPublicKey()
        .then((res) => {
          resolve({ pk: res.data?.publicKey, secret });
        })
        .catch((error: any) => {
          reject(error);
        });
    });
  }

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

    return await this.userService.createWalletSet(
      userId.toString(),
      walletSetId,
    );
  }

  async createWallet(walletSetId: string) {
    console.log('walletSetId: ', walletSetId);

    const circleDeveloperSdk = initiateDeveloperControlledWalletsClient({
      apiKey: this.API_KEY,
      entitySecret: this.API_SK,
    });

    const BLOCKCHAINS = ['MATIC-AMOY'] as Blockchain[];
    const response = await circleDeveloperSdk.createWallets({
      accountType: 'SCA',
      blockchains: BLOCKCHAINS,
      count: 1,
      walletSetId,
    });

    const user = await this.userService.findUserByWalletSetId(walletSetId);
    if (!user) return;

    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-expect-error
    const wallets = response.data.wallets;

    const returnWallets = [];
    for (const wallet of wallets) {
      returnWallets.push(
        await this.userService.createUserNetworkRepository(
          user.id.toString(),
          wallet.blockchain,
          wallet.address,
          wallet.id,
        ),
      );
    }
    return response.data;
  }

  async getBalanceOfWallets(id: string) {
    const circleDeveloperSdk = initiateDeveloperControlledWalletsClient({
      apiKey: this.API_KEY,
      entitySecret: this.API_SK,
    });
    const response = await circleDeveloperSdk.getWalletTokenBalance({
      id,
    });
    return response.data;
  }

  async transferForSameNetwork(
    walletId: string,
    tokenId: string,
    amounts: string[],
    destinationAddress: string,
  ) {
    const circleDeveloperSdk = initiateDeveloperControlledWalletsClient({
      apiKey: this.API_KEY,
      entitySecret: this.API_SK,
    });

    const usdValue = 1000000;
    const amount = [String(Number(amounts[0]) * usdValue)];

    const response = await circleDeveloperSdk.createTransaction({
      walletId,
      tokenId,
      destinationAddress,
      amount,
      fee: {
        type: 'level',
        config: {
          feeLevel: 'LOW',
        },
      },
    });

    return response.data;
  }

  async configureApproveTransaction(walletId: string) {
    const circleDeveloperSdk = initiateDeveloperControlledWalletsClient({
      apiKey: this.API_KEY,
      entitySecret: this.API_SK,
    });

    const fixedAmount = '100000000000000'; // 1000 USD
    const contractAddress = '0x41e94eb019c0762f9bfcf9fb1e58725bfb0e7582';
    const tokenMessengerAddress = '0x9f3B8679c73C2Fef8b59B4f3444d4e156fb70AA5';

    const res = await circleDeveloperSdk.createContractExecutionTransaction({
      contractAddress,
      abiFunctionSignature: 'approve(address spender, uint256 value)',
      abiParameters: [tokenMessengerAddress, fixedAmount],
      walletId,
      fee: {
        type: 'level',
        config: {
          feeLevel: 'LOW',
        },
      },
    });

    return res.data;
  }

  async transferForDifferentNetwork(
    walletId: string,
    originTokenId: string,
    destinationTokenId: string,
    amounts: string[],
    destinationAddress: string,
    destinationName: string,
  ) {
    const circleDeveloperSdk = initiateDeveloperControlledWalletsClient({
      apiKey: this.API_KEY,
      entitySecret: this.API_SK,
    });

    //await this.configureApproveTransaction(walletId);
    //return;

    const contractAddress = '0x9f3B8679c73C2Fef8b59B4f3444d4e156fb70AA5';
    const encodedDestination = encodeParameter('address', destinationAddress);

    const usdValue = 1000000;
    const amount = String(Number(amounts[0]) * usdValue);

    // Transfer to Polygon
    let domainValue = '7';
    let contractToken = '0x1c7D4B196Cb0C7B01d743Fbc6116a902379C7238';
    if (destinationName === 'ETH-SEPOLIA') {
      domainValue = '0';
      contractToken = '0x41e94eb019c0762f9bfcf9fb1e58725bfb0e7582';
    }

    /**
    const response = await circleDeveloperSdk.createContractExecutionTransaction({
      abiFunctionSignature: 'depositForBurn(uint256 amount, uint32 destinationDomain, bytes32 mintRecipient, address burnToken)',
      abiParameters: [amount, domainValue, encodedDestination, contractToken],
      contractAddress,
      walletId,
      fee: {
        type: 'level',
        config: {
          feeLevel: 'HIGH',
        },
      },
    });
    **/
    const transactionId = 'df8e76b7-5ba6-5cb1-98a5-eaa7f27464b6';

    //return response.data;
  }
}
