import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ClientsService } from './clients.service';
import { ClientsController } from './clients.controller';
import {
  Cliente,
  PessoaFisica,
  PessoaJuridica,
} from '../../entities/cliente.entity';
import { Contrato } from '../../entities/contrato.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Cliente, PessoaFisica, PessoaJuridica, Contrato]),
  ],
  controllers: [ClientsController],
  providers: [ClientsService],
  exports: [ClientsService],
})
export class ClientsModule {}
