import { ApiProperty } from '@nestjs/swagger';
import { Expose } from 'class-transformer';

export class GetCurrencyWalletOutput {
  @Expose()
  @ApiProperty()
  walletId: string;
}

export class SwapCurrencyOutput {
  @Expose()
  @ApiProperty()
  success: boolean;
}
