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
exports.NotificationsService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const boleto_entity_1 = require("../../entities/boleto.entity");
const contrato_entity_1 = require("../../entities/contrato.entity");
const cliente_credencial_entity_1 = require("../../entities/cliente-credencial.entity");
let NotificationsService = class NotificationsService {
    boletoRepository;
    contratoRepository;
    credencialRepository;
    constructor(boletoRepository, contratoRepository, credencialRepository) {
        this.boletoRepository = boletoRepository;
        this.contratoRepository = contratoRepository;
        this.credencialRepository = credencialRepository;
    }
    async getNotifications(clienteId) {
        const notifications = [];
        const hoje = new Date();
        const em7Dias = new Date();
        em7Dias.setDate(em7Dias.getDate() + 7);
        const contratos = await this.contratoRepository.find({
            where: { ClienteId: clienteId, Ativo: true },
            select: ['Id'],
        });
        if (contratos.length === 0) {
            return notifications;
        }
        const contratoIds = contratos.map((c) => c.Id);
        const boletosVencendo = await this.boletoRepository.find({
            where: {
                ContratoId: (0, typeorm_2.In)(contratoIds),
                Ativo: true,
                Status: (0, typeorm_2.In)(['REGISTRADO', 'ATIVO', 'PENDENTE']),
                DueDate: (0, typeorm_2.Between)(hoje, em7Dias),
            },
            order: { DueDate: 'ASC' },
        });
        for (const boleto of boletosVencendo) {
            const diasParaVencer = Math.ceil((new Date(boleto.DueDate).getTime() - hoje.getTime()) /
                (1000 * 60 * 60 * 24));
            notifications.push({
                id: `vencendo-${boleto.Id}`,
                tipo: 'boleto_vencendo',
                titulo: diasParaVencer === 0
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
        const boletosVencidos = await this.boletoRepository.find({
            where: {
                ContratoId: (0, typeorm_2.In)(contratoIds),
                Ativo: true,
                Status: (0, typeorm_2.In)(['REGISTRADO', 'ATIVO', 'PENDENTE']),
                DueDate: (0, typeorm_2.LessThan)(hoje),
            },
            order: { DueDate: 'DESC' },
            take: 5,
        });
        for (const boleto of boletosVencidos) {
            const diasVencido = Math.ceil((hoje.getTime() - new Date(boleto.DueDate).getTime()) /
                (1000 * 60 * 60 * 24));
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
        const umMesAtras = new Date();
        umMesAtras.setDate(umMesAtras.getDate() - 30);
        const boletosPagos = await this.boletoRepository.find({
            where: {
                ContratoId: (0, typeorm_2.In)(contratoIds),
                Ativo: true,
                Status: 'LIQUIDADO',
                DataAtualizacao: (0, typeorm_2.Between)(umMesAtras, hoje),
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
        notifications.sort((a, b) => b.data.getTime() - a.data.getTime());
        return notifications;
    }
    async registerPushToken(clienteId, token) {
        const credencial = await this.credencialRepository.findOne({
            where: { ClienteId: clienteId },
        });
        if (credencial) {
            credencial.DispositivoToken = token;
            await this.credencialRepository.save(credencial);
        }
        return { success: true };
    }
};
exports.NotificationsService = NotificationsService;
exports.NotificationsService = NotificationsService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(boleto_entity_1.Boleto)),
    __param(1, (0, typeorm_1.InjectRepository)(contrato_entity_1.Contrato)),
    __param(2, (0, typeorm_1.InjectRepository)(cliente_credencial_entity_1.ClienteCredencial)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository])
], NotificationsService);
//# sourceMappingURL=notifications.service.js.map