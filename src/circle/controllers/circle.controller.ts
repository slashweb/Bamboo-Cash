import {
  Controller,
  Get,
} from '@nestjs/common';

import { AppLogger } from '../../shared/logger/logger.service';
import { CircleService } from '../services/circle.service';
import forge from 'node-forge';
import * as crypto from 'crypto';

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

      const secret = crypto.randomBytes(32).toString('hex')

      const entitySecret = forge.util.hexToBytes(secret)
      const publicKey = forge.pki.publicKeyFromPem(pk)
      const encryptedData = publicKey.encrypt(entitySecret, 'RSA-OAEP', { md: forge.md.sha256.create(), mgf1: { md: forge.md.sha256.create(), }, });
      const encryptedDataHex = forge.util.encode64(encryptedData)

      console.log('tenebrosamente', encryptedDataHex)
      return encryptedDataHex

    } catch (error) {
      console.log('tenebroso', error)
      return error
    }
  }

}
