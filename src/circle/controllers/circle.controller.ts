import {
  Controller,
  Get,
} from '@nestjs/common';

import { AppLogger } from '../../shared/logger/logger.service';
import { CircleService } from '../services/circle.service';

@Controller('circle')
export class CircleController {
  constructor(
    private readonly logger: AppLogger,
    private readonly circleService: CircleService,
  ) {
    this.logger.setContext(CircleController.name);
  }


  @Get('register')
  async register() {
    try {
      const response = await this.circleService.getPublicKeys();
      console.log('respuesta tenebrosa', response)

      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-expect-error
      const pk = response.data.publicKey

      return pk

    } catch (error) {
      console.log('tenebroso', error)
      return error
    }
  }

}
