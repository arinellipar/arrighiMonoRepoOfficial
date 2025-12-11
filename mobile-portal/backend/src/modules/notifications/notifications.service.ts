import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In, LessThan, Between } from 'typeorm';
import { Boleto } from '../../entities/boleto.entity';
import { Contrato } from '../../entities/contrato.entity';
import { ClienteCredencial } from '../../entities/cliente-credencial.entity';

export interface Notification {
  id: string;
  tipo:
    | 'boleto_vencendo'
    | 'boleto_vencido'
    | 'pagamento_confirmado'
    | 'novo_boleto';
  titulo: string;
  mensagem: string;
  data: Date;
  lida: boolean;
  dados?: any;
}

@Injectable()
export class NotificationsService {
  constructor(
    @InjectRepository(Boleto)
    private boletoRepository: Repository<Boleto>,
    @InjectRepository(Contrato)
    private contratoRepository: Repository<Contrato>,
    @InjectRepository(ClienteCredencial)
    private credencialRepository: Repository<ClienteCredencial>,
  ) {}

  async getNotifications(clienteId: number): Promise<Notification[]> {
    const notifications: Notification[] = [];
    const hoje = new Date();
    const em7Dias = new Date();
    em7Dias.setDate(em7Dias.getDate() + 7);

    // Buscar contratos do cliente
    const contratos = await this.contratoRepository.find({
      where: { ClienteId: clienteId, Ativo: true },
      select: ['Id'],
    });

    if (contratos.length === 0) {
      return notifications;
    }

    const contratoIds = contratos.map((c) => c.Id);

    // Boletos vencendo nos próximos 7 dias
    const boletosVencendo = await this.boletoRepository.find({
      where: {
        ContratoId: In(contratoIds),
        Ativo: true,
        Status: In(['REGISTRADO', 'ATIVO', 'PENDENTE']),
        DueDate: Between(hoje, em7Dias),
      },
      order: { DueDate: 'ASC' },
    });

    for (const boleto of boletosVencendo) {
      const diasParaVencer = Math.ceil(
        (new Date(boleto.DueDate).getTime() - hoje.getTime()) /
          (1000 * 60 * 60 * 24),
      );

      notifications.push({
        id: `vencendo-${boleto.Id}`,
        tipo: 'boleto_vencendo',
        titulo:
          diasParaVencer === 0
            ? 'Boleto vence hoje!'
            : `Boleto vence em ${diasParaVencer} dia(s)`,
        mensagem: `Boleto de R$ ${Number(boleto.NominalValue).toFixed(2)} vence em ${new Date(boleto.DueDate).toLocaleDateString('pt-BR')}`,
        data: new Date(boleto.DueDate),
        lida: false,
        dados: {
          boletoId: boleto.Id,
          valor: boleto.NominalValue,
          dataVencimento: boleto.DueDate,
        },
      });
    }

    // Boletos vencidos
    const boletosVencidos = await this.boletoRepository.find({
      where: {
        ContratoId: In(contratoIds),
        Ativo: true,
        Status: In(['REGISTRADO', 'ATIVO', 'PENDENTE']),
        DueDate: LessThan(hoje),
      },
      order: { DueDate: 'DESC' },
      take: 5,
    });

    for (const boleto of boletosVencidos) {
      const diasVencido = Math.ceil(
        (hoje.getTime() - new Date(boleto.DueDate).getTime()) /
          (1000 * 60 * 60 * 24),
      );

      notifications.push({
        id: `vencido-${boleto.Id}`,
        tipo: 'boleto_vencido',
        titulo: `Boleto vencido há ${diasVencido} dia(s)`,
        mensagem: `Boleto de R$ ${Number(boleto.NominalValue).toFixed(2)} venceu em ${new Date(boleto.DueDate).toLocaleDateString('pt-BR')}`,
        data: new Date(boleto.DueDate),
        lida: false,
        dados: {
          boletoId: boleto.Id,
          valor: boleto.NominalValue,
          dataVencimento: boleto.DueDate,
        },
      });
    }

    // Pagamentos confirmados recentes (últimos 30 dias)
    const umMesAtras = new Date();
    umMesAtras.setDate(umMesAtras.getDate() - 30);

    const boletosPagos = await this.boletoRepository.find({
      where: {
        ContratoId: In(contratoIds),
        Ativo: true,
        Status: 'LIQUIDADO',
        DataAtualizacao: Between(umMesAtras, hoje),
      },
      order: { DataAtualizacao: 'DESC' },
      take: 5,
    });

    for (const boleto of boletosPagos) {
      notifications.push({
        id: `pago-${boleto.Id}`,
        tipo: 'pagamento_confirmado',
        titulo: 'Pagamento confirmado',
        mensagem: `Pagamento de R$ ${Number(boleto.NominalValue).toFixed(2)} confirmado`,
        data: boleto.DataAtualizacao || new Date(),
        lida: true,
        dados: {
          boletoId: boleto.Id,
          valor: boleto.NominalValue,
          dataConfirmacao: boleto.DataAtualizacao,
        },
      });
    }

    // Ordenar por data (mais recentes primeiro)
    notifications.sort((a, b) => b.data.getTime() - a.data.getTime());

    return notifications;
  }

  async registerPushToken(clienteId: number, token: string) {
    const credencial = await this.credencialRepository.findOne({
      where: { ClienteId: clienteId },
    });

    if (credencial) {
      credencial.DispositivoToken = token;
      await this.credencialRepository.save(credencial);
    }

    return { success: true };
  }
}
