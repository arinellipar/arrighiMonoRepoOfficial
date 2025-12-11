"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.BoletosService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const boleto_entity_1 = require("../../entities/boleto.entity");
const contrato_entity_1 = require("../../entities/contrato.entity");
let BoletosService = class BoletosService {
    boletoRepository;
    contratoRepository;
    constructor(boletoRepository, contratoRepository) {
        this.boletoRepository = boletoRepository;
        this.contratoRepository = contratoRepository;
    }
    async getBoletosByCliente(clienteId) {
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
                ContratoId: (0, typeorm_2.In)(contratoIds),
                Ativo: true,
            },
            order: { DueDate: 'ASC' },
        });
        return boletos.map((b) => this.mapBoletoToDto(b));
    }
    async getBoletoById(clienteId, boletoId) {
        const contratos = await this.contratoRepository.find({
            where: { ClienteId: clienteId, Ativo: true },
            select: ['Id'],
        });
        const contratoIds = contratos.map((c) => c.Id);
        const boleto = await this.boletoRepository.findOne({
            where: {
                Id: boletoId,
                ContratoId: (0, typeorm_2.In)(contratoIds),
                Ativo: true,
            },
        });
        if (!boleto) {
            throw new common_1.NotFoundException('Boleto não encontrado');
        }
        return this.mapBoletoToDto(boleto);
    }
    async getBoletosAbertos(clienteId) {
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
                ContratoId: (0, typeorm_2.In)(contratoIds),
                Ativo: true,
                Status: (0, typeorm_2.In)(['REGISTRADO', 'ATIVO', 'PENDENTE']),
            },
            order: { DueDate: 'ASC' },
        });
        return boletos.map((b) => this.mapBoletoToDto(b));
    }
    async getBoletosPagos(clienteId) {
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
                ContratoId: (0, typeorm_2.In)(contratoIds),
                Ativo: true,
                Status: 'LIQUIDADO',
            },
            order: { DataPagamento: 'DESC' },
        });
        return boletos.map((b) => this.mapBoletoToDto(b));
    }
    async getResumo(clienteId) {
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
        const boletosAbertos = await this.boletoRepository.find({
            where: {
                ContratoId: (0, typeorm_2.In)(contratoIds),
                Ativo: true,
                Status: (0, typeorm_2.In)(['REGISTRADO', 'ATIVO', 'PENDENTE']),
            },
        });
        const boletosPagos = await this.boletoRepository.find({
            where: {
                ContratoId: (0, typeorm_2.In)(contratoIds),
                Ativo: true,
                Status: 'LIQUIDADO',
            },
        });
        const totalAberto = boletosAbertos.reduce((sum, b) => sum + Number(b.NominalValue), 0);
        const totalPago = boletosPagos.reduce((sum, b) => sum + Number(b.PaidValue || b.NominalValue), 0);
        const boletosVencidos = boletosAbertos.filter((b) => new Date(b.DueDate) < hoje);
        const totalVencido = boletosVencidos.reduce((sum, b) => sum + Number(b.NominalValue), 0);
        const proximoBoleto = boletosAbertos
            .filter((b) => new Date(b.DueDate) >= hoje)
            .sort((a, b) => new Date(a.DueDate).getTime() - new Date(b.DueDate).getTime())[0];
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
    mapBoletoToDto(boleto) {
        const hoje = new Date();
        const vencimento = new Date(boleto.DueDate);
        const diasParaVencer = Math.ceil((vencimento.getTime() - hoje.getTime()) / (1000 * 60 * 60 * 24));
        let statusDisplay = boleto.Status;
        if (boleto.FoiPago || boleto.Status === 'LIQUIDADO') {
            statusDisplay = 'PAGO';
        }
        else if (boleto.Status === 'BAIXADO' && !boleto.FoiPago) {
            statusDisplay = 'EXPIRADO';
        }
        else if (diasParaVencer < 0 &&
            !['LIQUIDADO', 'BAIXADO', 'CANCELADO'].includes(boleto.Status)) {
            statusDisplay = 'VENCIDO';
        }
        return {
            id: boleto.Id,
            contratoId: boleto.ContratoId,
            codigoBarras: boleto.BarCode,
            linhaDigitavel: boleto.DigitableLine,
            valor: boleto.NominalValue,
            dataVencimento: boleto.DueDate,
            dataPagamento: boleto.DataPagamento,
            valorPago: boleto.PaidValue,
            status: boleto.Status,
            statusDisplay,
            numeroParcela: boleto.NumeroParcela,
            diasParaVencer,
            vencido: diasParaVencer < 0 &&
                !['LIQUIDADO', 'BAIXADO', 'CANCELADO'].includes(boleto.Status),
            qrCodePix: boleto.QRCodePix,
            qrCodeUrl: boleto.QRCodeUrl,
        };
    }
};
exports.BoletosService = BoletosService;
exports.BoletosService = BoletosService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(boleto_entity_1.Boleto)),
    __param(1, (0, typeorm_1.InjectRepository)(contrato_entity_1.Contrato)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository])
], BoletosService);
//# sourceMappingURL=boletos.service.js.map