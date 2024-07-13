import {
  Body,
  ClassSerializerInterceptor,
  Controller,
  Get,
  HttpStatus,
  Param,
  Post,
  Query,
  UseInterceptors,
} from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';

import {
  BaseApiErrorResponse,
  BaseApiResponse,
  SwaggerBaseApiResponse,
} from '../../shared/dtos/base-api-response.dto';
import { PaginationParamsDto } from '../../shared/dtos/pagination-params.dto';
import { AppLogger } from '../../shared/logger/logger.service';
import { ReqContext } from '../../shared/request-context/req-context.decorator';
import { RequestContext } from '../../shared/request-context/request-context.dto';
import {
  GetCurrencyWalletInput,
  SendWithdrawalInput,
  SwapCurrencyInput,
} from '../dtos/payment-input.dto';
import {
  GetCurrencyWalletOutput,
  SwapCurrencyOutput,
} from '../dtos/payment-output.dto';
import { PaymentService } from '../services/payment.service';

@ApiTags('payment')
@Controller('payment')
export class PaymentController {
  constructor(
    private readonly paymentService: PaymentService,
    private readonly logger: AppLogger,
  ) {
    this.logger.setContext(PaymentController.name);
  }

  @UseInterceptors(ClassSerializerInterceptor)
  @Get('wallet')
  @ApiOperation({
    summary: 'Get payment wallet by currency',
  })
  async getWalletId(
    @ReqContext() ctx: RequestContext,
    @Query() input: GetCurrencyWalletInput,
  ): Promise<BaseApiResponse<GetCurrencyWalletOutput>> {
    this.logger.log(ctx, `${this.getWalletId.name} was called`);
    const { currency } = input;

    const walletId =
      await this.paymentService.getWalletIdByWidAndCurrency(currency);

    return {
      data: {
        walletId,
      },
      meta: {},
    };
  }

  @UseInterceptors(ClassSerializerInterceptor)
  @Post('swap-currency')
  @ApiOperation({
    summary: 'Get payment wallet by currency',
  })
  async SwapBetweenCurrency(
    @ReqContext() ctx: RequestContext,
    @Body() input: SwapCurrencyInput,
  ): Promise<BaseApiResponse<SwapCurrencyOutput>> {
    this.logger.log(ctx, `${this.getWalletId.name} was called`);
    const { fromCurrency, toCurrency, spendAmount } = input;

    await this.paymentService.SwapBetweenCurrency(
      fromCurrency,
      toCurrency,
      spendAmount,
    );

    return {
      data: {
        success: true,
      },
      meta: {},
    };
  }

  @UseInterceptors(ClassSerializerInterceptor)
  @Post('/:clabe/:amount/:name')
  @ApiOperation({
    summary: 'Get payment wallet by currency',
  })
  async SendWithdrawal(
    @ReqContext() ctx: RequestContext,
    @Param('clabe') clabe: string,
    @Param('amount') amount: string,
    @Param('name') name: string,
  ): Promise<BaseApiResponse<SwapCurrencyOutput>> {
    this.logger.log(ctx, `${this.getWalletId.name} was called`);

    await this.paymentService.sendWithdrawal({
      clabe,
      amount,
      beneficiary: name,
    });

    return {
      data: {
        success: true,
      },
      meta: {},
    };
  }

  @UseInterceptors(ClassSerializerInterceptor)
  @Post('hello')
  @ApiOperation({
    summary: 'Get payment wallet by currency',
  })
  async hello(
    @ReqContext() ctx: RequestContext,
    @Body() input: object,
  ): Promise<any> {
    this.logger.log(ctx, `${this.getWalletId.name} was called`);

    return {
      ...input,
    };
  }
}
