import { Injectable } from '@nestjs/common';
import { AppLogger } from 'src/shared/logger/logger.service';
import { UserService } from 'src/user/services/user.service';

import { SendWithdrawalInput } from '../dtos/payment-input.dto';
import { BitsoService } from './bitso.service';

@Injectable()
export class PaymentService {
  constructor(
    private readonly logger: AppLogger,
    private readonly bitsoService: BitsoService,
    private readonly userService: UserService,
  ) {
    this.logger.setContext(PaymentService.name);
  }

  async getWalletIdByWidAndCurrency(currency: string) {
    const walletId =
      await this.bitsoService.getCurrencyWalletPublicKey(currency);
    return walletId;
  }

  async SwapBetweenCurrency(
    fromCurrency: string,
    toCurrency: string,
    spendAmount: string,
  ) {
    console.log({
      fromCurrency,
      toCurrency,
      spendAmount,
    });

    const walletId = await this.bitsoService.SwapBetweenCurrency(
      fromCurrency,
      toCurrency,
      spendAmount,
    );
    return walletId;
  }

  async sendWithdrawal(input: SendWithdrawalInput) {
    const { clabe, amount, beneficiary } = input;
    const result = await this.bitsoService.sendWithdrawal(
      amount,
      clabe,
      beneficiary,
    );

    return result;
  }
}
