import { initiateDeveloperControlledWalletsClient } from '@circle-fin/developer-controlled-wallets';
import { Blockchain } from '@circle-fin/smart-contract-platform';
import { HttpService } from '@nestjs/axios';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as crypto from 'crypto';
import { encodeParameter } from 'web3-eth-abi';
import { AppLogger } from '../../shared/logger/logger.service';
import { UserService } from '../../user/services/user.service';
import { Web3 } from 'web3';
import fetch from 'node-fetch';

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
    this.TRANSACTION_URI = this.configService.get('circle.transaction_uri');
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
  private readonly TRANSACTION_URI;

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
    console.log('userId', userId.toString());

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
    const circleDeveloperSdk = initiateDeveloperControlledWalletsClient({
      apiKey: this.API_KEY,
      entitySecret: this.API_SK,
    });

    const ALL_BLOCKCHAINS = ['ETH', 'MATIC'] as Blockchain[];

    console.log('all blockchains', ALL_BLOCKCHAINS, walletSetId);
    const responsesArray = [] as any;
    for (const blockchain of ALL_BLOCKCHAINS) {
      console.log('blockchain', blockchain);
      const response = await circleDeveloperSdk.createWallets({
        accountType: 'SCA',
        blockchains: [blockchain],
        count: 1,
        walletSetId,
      });
      response?.data?.wallets.forEach((wallet) => {
        responsesArray.push(wallet);
      });
    }

    const user = await this.userService.findUserByWalletSetId(walletSetId);
    if (!user) return;

    const wallets = responsesArray;

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
    return wallets;
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
    console.log({
      walletId,
      tokenId,
      amounts,
      destinationAddress,
    });

    const circleDeveloperSdk = initiateDeveloperControlledWalletsClient({
      apiKey: this.API_KEY,
      entitySecret: this.API_SK,
    });

    //await this.configureApproveTransaction(walletId);
    //return

    const usdValue = 1;
    const amount = [String(Number(amounts[0]) * usdValue)];

    const response = await circleDeveloperSdk.createTransaction({
      walletId,
      tokenId,
      destinationAddress,
      amount,
      fee: {
        type: 'level',
        config: {
          feeLevel: 'HIGH',
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
    const contractAddress = '0x1c7D4B196Cb0C7B01d743Fbc6116a902379C7238';
    const tokenMessengerAddress = '0x9f3B8679c73C2Fef8b59B4f3444d4e156fb70AA5';

    const res = await circleDeveloperSdk.createContractExecutionTransaction({
      contractAddress,
      abiFunctionSignature: 'approve(address spender, uint256 value)',
      abiParameters: [tokenMessengerAddress, fixedAmount],
      walletId,
      fee: {
        type: 'level',
        config: {
          feeLevel: 'HIGH',
        },
      },
    });

    return res.data;
  }

  // async transferForDifferentNetwork(
  //   walletId: string,
  //   originTokenId: string,
  //   destinationTokenId: string,
  //   amounts: string[],
  //   destinationAddress: string,
  //   destinationName: string,
  // ) {
  //   const circleDeveloperSdk = initiateDeveloperControlledWalletsClient({
  //     apiKey: this.API_KEY,
  //     entitySecret: this.API_SK,
  //   });

  //   //await this.configureApproveTransaction(walletId);
  //   //return;

  //   const contractAddress = '0x9f3B8679c73C2Fef8b59B4f3444d4e156fb70AA5';
  //   const encodedDestination = encodeParameter('address', destinationAddress);

  //   const usdValue = 1000000;
  //   const amount = String(Number(amounts[0]) * usdValue);

  //   // Transfer to Polygon
  //   let domainValue = '7';
  //   let contractToken = '0x1c7D4B196Cb0C7B01d743Fbc6116a902379C7238';
  //   if (destinationName === 'ETH-SEPOLIA') {
  //     domainValue = '0';
  //     contractToken = '0x41e94eb019c0762f9bfcf9fb1e58725bfb0e7582';
  //   }
  //   /**
  //    const response = await circleDeveloperSdk.createContractExecutionTransaction({
  //    abiFunctionSignature: 'depositForBurn(uint256 amount, uint32 destinationDomain, bytes32 mintRecipient, address burnToken)',
  //    abiParameters: [amount, domainValue, encodedDestination, contractToken],
  //    contractAddress,
  //    walletId,
  //    fee: {
  //    type: 'level',
  //    config: {
  //    feeLevel: 'HIGH',
  //    },
  //    },
  //    });

  //    return response.data;
  //    **/
  //   const transactionId = '8312cfbb-3520-5ef7-b699-650ff40787df';

  //   console.log('transactionId', transactionId);
  //   fetch(`${this.TRANSACTION_URI}/${transactionId}`, this.GET_OPTIONS)
  //     .then((res) => res.json())
  //     .then(async (json) => {
  //       const txHash = json.data.transaction.txHash;

  //       console.log('txHash', txHash);
  //       let rpc = 'https://ethereum-sepolia.blockpi.network/v1/rpc/public';
  //       if (destinationName === 'ETH-SEPOLIA') {
  //         rpc = 'https://rpc-amoy.polygon.technology/';
  //       }

  //       const web3 = new Web3(rpc);

  //       // get messageBytes from EVM logs using txHash of the transaction.
  //       const transactionReceipt = await web3.eth.getTransactionReceipt(txHash);

  //       const eventTopic = web3.utils.keccak256('MessageSent(bytes)');
  //       const log = transactionReceipt.logs.find((l) => {
  //         if (!Array.isArray(l.topics)) return false;
  //         return l.topics[0] === eventTopic;
  //       });
  //       if (!log?.data) return;

  //       // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  //       // @ts-expect-error
  //       const messageBytes = web3.eth.abi.decodeParameters(
  //         ['bytes'],
  //         log.data,
  //       )[0];

  //       // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  //       // @ts-expect-error
  //       const messageHash = web3.utils.keccak256(messageBytes);

  //       // Get attestation signature from iris-api.circle.com
  //       let attestationResponse = { status: 'pending', attestation: '' };
  //       while (attestationResponse.status != 'complete') {
  //         const response = await fetch(
  //           `https://iris-api-sandbox.circle.com/attestations/${messageHash}`,
  //         );
  //         attestationResponse = await response.json();
  //         console.log('trying again', attestationResponse.status);
  //         await new Promise((r) => setTimeout(r, 2000));
  //       }

  //       console.log('attestationResponse', attestationResponse);
  //       const attestation = attestationResponse.attestation;
  //       const messageTransmitterContractAddress =
  //         '0x7865fAfC2db2093669d92c0F33AeEF291086BEFD';

  //       console.log('Before receiveMessage', attestation, destinationAddress);
  //       const response =
  //         await circleDeveloperSdk.createContractExecutionTransaction({
  //           abiFunctionSignature:
  //             'receiveMessage(bytes message,bytes attestation)',
  //           abiParameters: [messageHash, attestation],
  //           contractAddress: messageTransmitterContractAddress,
  //           walletId: 'befa3540-ab35-5fcf-ac4a-c4a1a2e3c903',
  //           fee: {
  //             type: 'level',
  //             config: {
  //               feeLevel: 'HIGH',
  //             },
  //           },
  //         });

  //       console.log('response', response.data);
  //       return response.data;
  //     });
  //   //return response.data;
  // }
}
