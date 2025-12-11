import {
  Controller,
  Get,
  Post,
  Body,
  UseGuards,
  Request,
} from '@nestjs/common';
import { NotificationsService } from './notifications.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('notifications')
@UseGuards(JwtAuthGuard)
export class NotificationsController {
  constructor(private readonly notificationsService: NotificationsService) {}

  @Get()
  async getAll(@Request() req) {
    return this.notificationsService.getNotifications(req.user.clienteId);
  }

  @Post('register-token')
  async registerToken(@Request() req, @Body('token') token: string) {
    return this.notificationsService.registerPushToken(
      req.user.clienteId,
      token,
    );
  }
}
