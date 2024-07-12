import { HttpService } from '@nestjs/axios';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import fetch from 'node-fetch';

import { AppLogger } from '../../shared/logger/logger.service';

@Injectable()
export class CircleService {
  constructor(
    private readonly logger: AppLogger,
    private readonly httpService: HttpService,
    private readonly configService: ConfigService,
  ) {
    this.logger.setContext(CircleService.name);
    this.API_KEY = this.configService.get('circle.secret');
    this.GET_OPTIONS = {
      method: 'GET',
      headers: {
        'Content-Yype': 'application/json',
        Authorization: `Bearer ${this.API_KEY}`,
      },
    };
  }

  private readonly API_KEY;
  private readonly GET_OPTIONS;
  private PK_URL = 'https://api.circle.com/v1/w3s/config/entity/publicKey';

  getPublicKeys() {

    return new Promise((resolve, reject) => {
      fetch(this.PK_URL, this.GET_OPTIONS)
        .then((res: { json: () => any; }) => res.json())
        .then((json: any) => {
          resolve(json);
        })
        .catch((error: any) => {
          reject(error);
        });
    });
  };

}
