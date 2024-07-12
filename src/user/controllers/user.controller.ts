import { Controller } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';

import { AppLogger } from '../../shared/logger/logger.service';
import { UserService } from '../services/user.service';

@ApiTags('users')
@Controller('users')
export class UserController {
  constructor(
    private readonly userService: UserService,
    private readonly logger: AppLogger,
  ) {
    this.logger.setContext(UserController.name);
  }
}
