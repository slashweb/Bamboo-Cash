import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class GetCurrencyWalletInput {
  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  currency: string;
}

export class SwapCurrencyInput {
  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  fromCurrency: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  toCurrency: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  spendAmount: string;
}

export class SendWithdrawalInput {
  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  clabe: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  amount: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  beneficiary: string;
}
