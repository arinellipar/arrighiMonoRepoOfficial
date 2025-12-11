import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import { Boleto } from '../../entities/boleto.entity';
import { Contrato } from '../../entities/contrato.entity';

@Injectable()
export class BoletosService {
  constructor(
    @InjectRepository(Boleto)
    private boletoRepository: Repository<Boleto>,
    @InjectRepository(Contrato)
    private contratoRepository: Repository<Contrato>,
  ) {}

  async getBoletosByCliente(clienteId: number) {
    // Buscar contratos do cliente
    const contratos = await this.contratoRepository.find({
      where: { ClienteId: clienteId, Ativo: true },
      select: ['Id'],
    });

    if (contratos.length === 0) {
      return [];
    }

    const contratoIds = contratos.map((c) => c.Id);

    // Buscar boletos dos contratos
    const boletos = await this.boletoRepository.find({
      where: {
        ContratoId: In(contratoIds),
        Ativo: true,
      },
      order: { DueDate: 'ASC' },
    });

    return boletos.map((b) => this.mapBoletoToDto(b));
  }

  async getBoletoById(clienteId: number, boletoId: number) {
    // Verificar se o boleto pertence ao cliente
    const contratos = await this.contratoRepository.find({
      where: { ClienteId: clienteId, Ativo: true },
      select: ['Id'],
    });

    const contratoIds = contratos.map((c) => c.Id);

    const boleto = await this.boletoRepository.findOne({
      where: {
        Id: boletoId,
        ContratoId: In(contratoIds),
        Ativo: true,
      },
    });

    if (!boleto) {
      throw new NotFoundException('Boleto não encontrado');
    }

    return this.mapBoletoToDto(boleto);
  }

  async getBoletosAbertos(clienteId: number) {
    const contratos = await this.contratoRepository.find({
      where: { ClienteId: clienteId, Ativo: true },
      select: ['Id'],
    });

    if (contratos.length === 0) {
      return [];
    }

    const contratoIds = contratos.map((c) => c.Id);

    const boletos = await this.boletoRepository.find({
      where: {
        ContratoId: In(contratoIds),
        Ativo: true,
        Status: In(['REGISTRADO', 'ATIVO', 'PENDENTE']),
      },
      order: { DueDate: 'ASC' },
    });

    return boletos.map((b) => this.mapBoletoToDto(b));
  }

  async getBoletosPagos(clienteId: number) {
    const contratos = await this.contratoRepository.find({
      where: { ClienteId: clienteId, Ativo: true },
      select: ['Id'],
    });

    if (contratos.length === 0) {
      return [];
    }

    const contratoIds = contratos.map((c) => c.Id);

    const boletos = await this.boletoRepository.find({
      where: {
        ContratoId: In(contratoIds),
        Ativo: true,
        Status: 'LIQUIDADO',
      },
      order: { DataAtualizacao: 'DESC' },
    });

    return boletos.map((b) => this.mapBoletoToDto(b));
  }

  async getResumo(clienteId: number) {
    const contratos = await this.contratoRepository.find({
      where: { ClienteId: clienteId, Ativo: true },
      select: ['Id'],
    });

    if (contratos.length === 0) {
      return {
        totalAberto: 0,
        totalPago: 0,
        totalVencido: 0,
        quantidadeAbertos: 0,
        quantidadePagos: 0,
        quantidadeVencidos: 0,
        proximoVencimento: null,
      };
    }

    const contratoIds = contratos.map((c) => c.Id);
    const hoje = new Date();

    // Boletos abertos
    const boletosAbertos = await this.boletoRepository.find({
      where: {
        ContratoId: In(contratoIds),
        Ativo: true,
        Status: In(['REGISTRADO', 'ATIVO', 'PENDENTE']),
      },
    });

    // Boletos pagos
    const boletosPagos = await this.boletoRepository.find({
      where: {
        ContratoId: In(contratoIds),
        Ativo: true,
        Status: 'LIQUIDADO',
      },
    });

    // Calcular totais
    const totalAberto = boletosAbertos.reduce(
      (sum, b) => sum + Number(b.NominalValue),
      0,
    );
    const totalPago = boletosPagos.reduce(
      (sum, b) => sum + Number(b.NominalValue),
      0,
    );

    // Boletos vencidos (abertos com data passada)
    const boletosVencidos = boletosAbertos.filter(
      (b) => new Date(b.DueDate) < hoje,
    );
    const totalVencido = boletosVencidos.reduce(
      (sum, b) => sum + Number(b.NominalValue),
      0,
    );

    // Próximo vencimento
    const proximoBoleto = boletosAbertos
      .filter((b) => new Date(b.DueDate) >= hoje)
      .sort(
        (a, b) => new Date(a.DueDate).getTime() - new Date(b.DueDate).getTime(),
      )[0];

    return {
      totalAberto,
      totalPago,
      totalVencido,
      quantidadeAbertos: boletosAbertos.length,
      quantidadePagos: boletosPagos.length,
      quantidadeVencidos: boletosVencidos.length,
      proximoVencimento: proximoBoleto
        ? {
            id: proximoBoleto.Id,
            valor: proximoBoleto.NominalValue,
            dataVencimento: proximoBoleto.DueDate,
          }
        : null,
    };
  }

  private mapBoletoToDto(boleto: Boleto) {
    const hoje = new Date();
    const vencimento = new Date(boleto.DueDate);
    const diasParaVencer = Math.ceil(
      (vencimento.getTime() - hoje.getTime()) / (1000 * 60 * 60 * 24),
    );

    const foiPago = boleto.Status === 'LIQUIDADO';

    let statusDisplay = boleto.Status;
    if (foiPago) {
      statusDisplay = 'PAGO';
    } else if (boleto.Status === 'BAIXADO') {
      statusDisplay = 'EXPIRADO';
    } else if (
      diasParaVencer < 0 &&
      !['LIQUIDADO', 'BAIXADO', 'CANCELADO'].includes(boleto.Status)
    ) {
      statusDisplay = 'VENCIDO';
    }

    return {
      id: boleto.Id,
      contratoId: boleto.ContratoId,
      codigoBarras: boleto.BarCode,
      linhaDigitavel: boleto.DigitableLine,
      valor: boleto.NominalValue,
      dataVencimento: boleto.DueDate,
      dataCadastro: boleto.DataCadastro,
      status: boleto.Status,
      statusDisplay,
      numeroParcela: boleto.NumeroParcela,
      diasParaVencer,
      vencido:
        diasParaVencer < 0 &&
        !['LIQUIDADO', 'BAIXADO', 'CANCELADO'].includes(boleto.Status),
      foiPago,
      qrCodePix: boleto.QrCodePix,
      qrCodeUrl: boleto.QrCodeUrl,
    };
  }
}
