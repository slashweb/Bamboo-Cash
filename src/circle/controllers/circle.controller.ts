import {
  Body,
  Controller,
  Get, Post,
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
      const response = await this.circleService.getPublicKeys() as unknown as any;

      const entitySecret = forge.util.hexToBytes(response.secret);
      const publicKey = forge.pki.publicKeyFromPem(response.pk);
      const encryptedData = publicKey.encrypt(entitySecret, 'RSA-OAEP', {
        md: forge.md.sha256.create(),
        mgf1: {
          md: forge.md.sha256.create(),
        },
      });

      return {
        encryptedData: forge.util.encode64(encryptedData),
        secret: response.secret,
      }


      /**
       const pk = response.data.publicKey;

       const secret = crypto.randomBytes(32).toString('hex');


       const entitySecret = forge.util.hexToBytes(secret);
       const publicKey = forge.pki.publicKeyFromPem(pk);
       const encryptedData = publicKey.encrypt(entitySecret, 'RSA-OAEP', {
       md: forge.md.sha256.create(),
       mgf1: {
       md: forge.md.sha256.create(),
       },
       });
       const base64EncryptedData = forge.util.encode64(encryptedData);

       return {
       encryptedData: base64EncryptedData,
       secret,
       };
       **/

    } catch (error) {
      return error;
    }
  }

  @Post('wallet-set')
  async walletSet(@Body() body: { userId: number}) {
    try {
      const walletSet = await this.circleService.createWalletSet(body.userId);

      return walletSet;
    } catch (error) {
      console.log('error tenebroso', error);
      return error;
    }
  }

}
