import { HttpService } from '@nestjs/axios';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InternalAxiosRequestConfig } from 'axios';
import * as CryptoJS from 'crypto-js';
import { AppLogger } from 'src/shared/logger/logger.service';

import { BITSO_ENDOIINTS, BitsoEnvironments } from '../constants/bitso';

@Injectable()
export class BitsoService {
  private apiKey: string;
  private apiSecret: string;

  constructor(
    private readonly logger: AppLogger,
    private readonly httpService: HttpService,
    private configService: ConfigService,
  ) {
    this.logger.setContext(BitsoService.name);
    const bitsoEnv = this.configService.get<string>('BITSO_ENV');
    this.apiKey = this.configService.get<string>('BITSO_API_KEY') ?? '';
    this.apiSecret = this.configService.get<string>('BITSO_API_SECRET') ?? '';
    const bitsoUrl =
      BITSO_ENDOIINTS[bitsoEnv as keyof typeof BitsoEnvironments];

    this.httpService.axiosRef.defaults.baseURL = bitsoUrl;
    this.httpService.axiosRef.interceptors.request.use((request) => {
      return this.signRequest(request);
    });
  }

  private signRequest(request: InternalAxiosRequestConfig) {
    const url = new URL(
      BITSO_ENDOIINTS[
        this.configService.get<string>(
          'BITSO_ENV',
        ) as keyof typeof BitsoEnvironments
      ] + request.url,
    );

    const nonce = Date.now();
    const method = request?.method?.toUpperCase();
    const path = url.pathname + url.search;
    const body = JSON.stringify(request.data) || '';

    const data = `${nonce}${method}${path}${body}`;
    const hash = CryptoJS.HmacSHA256(data, this.apiSecret);
    const signature = CryptoJS.enc.Hex.stringify(hash);

    console.log({ nonce, signature, data });

    request.headers.Authorization = `Bitso ${this.apiKey}:${nonce}:${signature}`;
    return request;
  }

  async getCurrencyWalletPublicKey(currency: string) {
    let walletIdByCurrency = '';
    try {
      const result = await this.httpService
        .get(`/funding_details?currency=${currency}&protocol=${currency}`)
        .toPromise();

      walletIdByCurrency = result?.data.payload[0].details[0].value;
    } catch (err) {}

    return walletIdByCurrency;
  }

  async SwapBetweenCurrency(
    fromCurrency: string,
    toCurrency: string,
    spendAmount: string,
  ) {
    try {
      const quoteResult = await this.httpService
        .post(
          '/currency_conversions',
          {
            from_currency: fromCurrency,
            to_currency: toCurrency,
            spend_amount: spendAmount,
          },
          {
            headers: {
              'Content-Type': 'application/json',
            },
          },
        )
        .toPromise();

      const quoteId = quoteResult?.data.payload.id;

      const executeResult = await this.httpService
        .put(`/currency_conversions/${quoteId}`, {
          heeaders: {
            'Content-Type': 'application/json',
          },
        })
        .toPromise();

      if (executeResult) {
        console.log({ executeResult });
      }
    } catch (error) {
      console.error({ error });
    }
  }

  async sendWithdrawal(amount: string, clabe: string, beneficiary: string) {
    try {
      const withdrawalResult = await this.httpService
        .post('/withdrawals', {
          amount,
          method: 'praxis',
          integration: 'praxis',
          network: 'spei',
          protocol: 'clabe',
          clabe,
          beneficiary,
          currency: 'mxn',
        })
        .toPromise();

      if (withdrawalResult) {
        console.log({ withdrawalResult: withdrawalResult.data });
      }
    } catch (error) {
      console.error({ error });
    }
  }
}
