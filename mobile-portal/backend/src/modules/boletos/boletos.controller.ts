import {
  Controller,
  Get,
  Param,
  UseGuards,
  Request,
  ParseIntPipe,
} from '@nestjs/common';
import { BoletosService } from './boletos.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('boletos')
@UseGuards(JwtAuthGuard)
export class BoletosController {
  constructor(private readonly boletosService: BoletosService) {}

  @Get()
  async getAll(@Request() req) {
    return this.boletosService.getBoletosByCliente(req.user.clienteId);
  }

  @Get('resumo')
  async getResumo(@Request() req) {
    return this.boletosService.getResumo(req.user.clienteId);
  }

  @Get('abertos')
  async getAbertos(@Request() req) {
    return this.boletosService.getBoletosAbertos(req.user.clienteId);
  }

  @Get('pagos')
  async getPagos(@Request() req) {
    return this.boletosService.getBoletosPagos(req.user.clienteId);
  }

  @Get(':id')
  async getById(@Request() req, @Param('id', ParseIntPipe) id: number) {
    return this.boletosService.getBoletoById(req.user.clienteId, id);
  }
}
