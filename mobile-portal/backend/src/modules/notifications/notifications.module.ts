import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { NotificationsService } from './notifications.service';
import { NotificationsController } from './notifications.controller';
import { Boleto } from '../../entities/boleto.entity';
import { Contrato } from '../../entities/contrato.entity';
import { ClienteCredencial } from '../../entities/cliente-credencial.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Boleto, Contrato, ClienteCredencial])],
  controllers: [NotificationsController],
  providers: [NotificationsService],
  exports: [NotificationsService],
})
export class NotificationsModule {}
