import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BoletosService } from './boletos.service';
import { BoletosController } from './boletos.controller';
import { Boleto } from '../../entities/boleto.entity';
import { Contrato } from '../../entities/contrato.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Boleto, Contrato])],
  controllers: [BoletosController],
  providers: [BoletosService],
  exports: [BoletosService],
})
export class BoletosModule {}
