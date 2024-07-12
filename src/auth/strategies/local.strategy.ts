import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-local';

import { AppLogger } from '../../shared/logger/logger.service';
import { STRATEGY_LOCAL } from '../constants/strategy.constant';
import { AuthService } from '../services/auth.service';

@Injectable()
export class LocalStrategy extends PassportStrategy(Strategy, STRATEGY_LOCAL) {
  constructor(
    private authService: AuthService,
    private readonly logger: AppLogger,
  ) {
    // Add option passReqToCallback: true to configure strategy to be request-scoped.
    super({
      usernameField: 'username',
      passwordField: 'password',
      passReqToCallback: true,
    });
    this.logger.setContext(LocalStrategy.name);
  }
}
