import { Controller, Get, UseGuards, Request } from '@nestjs/common';
import { ClientsService } from './clients.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('clients')
@UseGuards(JwtAuthGuard)
export class ClientsController {
  constructor(private readonly clientsService: ClientsService) {}

  @Get('profile')
  async getProfile(@Request() req) {
    return this.clientsService.getProfile(req.user.clienteId);
  }

  @Get('contracts')
  async getContracts(@Request() req) {
    return this.clientsService.getContracts(req.user.clienteId);
  }
}
