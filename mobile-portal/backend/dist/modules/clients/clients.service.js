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
exports.ClientsService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const cliente_entity_1 = require("../../entities/cliente.entity");
const contrato_entity_1 = require("../../entities/contrato.entity");
let ClientsService = class ClientsService {
    clienteRepository;
    pessoaFisicaRepository;
    pessoaJuridicaRepository;
    contratoRepository;
    constructor(clienteRepository, pessoaFisicaRepository, pessoaJuridicaRepository, contratoRepository) {
        this.clienteRepository = clienteRepository;
        this.pessoaFisicaRepository = pessoaFisicaRepository;
        this.pessoaJuridicaRepository = pessoaJuridicaRepository;
        this.contratoRepository = contratoRepository;
    }
    async getProfile(clienteId) {
        const cliente = await this.clienteRepository.findOne({
            where: { Id: clienteId },
        });
        if (!cliente) {
            throw new common_1.NotFoundException('Cliente não encontrado');
        }
        let dadosPessoais = null;
        let tipoPessoa = 'PF';
        if (cliente.PessoaFisicaId) {
            const pf = await this.pessoaFisicaRepository.findOne({
                where: { Id: cliente.PessoaFisicaId },
            });
            if (pf) {
                dadosPessoais = {
                    nome: pf.Nome,
                    documento: pf.CPF,
                    email: pf.EmailEmpresarial,
                    telefone: pf.Telefone1,
                    celular: pf.Telefone2,
                    dataNascimento: pf.DataNascimento,
                };
                tipoPessoa = 'PF';
            }
        }
        else if (cliente.PessoaJuridicaId) {
            const pj = await this.pessoaJuridicaRepository.findOne({
                where: { Id: cliente.PessoaJuridicaId },
            });
            if (pj) {
                dadosPessoais = {
                    nome: pj.RazaoSocial,
                    nomeFantasia: pj.NomeFantasia,
                    documento: pj.CNPJ,
                    email: pj.Email,
                    telefone: pj.Telefone1,
                };
                tipoPessoa = 'PJ';
            }
        }
        const contratos = await this.contratoRepository.find({
            where: { ClienteId: clienteId, Ativo: true },
            order: { DataCadastro: 'DESC' },
        });
        return {
            id: cliente.Id,
            tipoPessoa,
            status: cliente.Status,
            dataCadastro: cliente.DataCadastro,
            ...dadosPessoais,
            contratos: contratos.map((c) => ({
                id: c.Id,
                situacao: c.Situacao,
                valorNegociado: c.ValorNegociado,
                numeroParcelas: c.NumeroParcelas,
                dataFechamento: c.DataFechamentoContrato,
            })),
        };
    }
    async getContracts(clienteId) {
        const contratos = await this.contratoRepository.find({
            where: { ClienteId: clienteId, Ativo: true },
            order: { DataCadastro: 'DESC' },
        });
        return contratos.map((c) => ({
            id: c.Id,
            situacao: c.Situacao,
            valorNegociado: c.ValorNegociado,
            valorEntrada: c.ValorEntrada,
            valorParcela: c.ValorParcela,
            numeroParcelas: c.NumeroParcelas,
            primeiroVencimento: c.PrimeiroVencimento,
            dataCadastro: c.DataCadastro,
            dataFechamento: c.DataFechamentoContrato,
            temAnexo: !!c.AnexoDocumento,
        }));
    }
};
exports.ClientsService = ClientsService;
exports.ClientsService = ClientsService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(cliente_entity_1.Cliente)),
    __param(1, (0, typeorm_1.InjectRepository)(cliente_entity_1.PessoaFisica)),
    __param(2, (0, typeorm_1.InjectRepository)(cliente_entity_1.PessoaJuridica)),
    __param(3, (0, typeorm_1.InjectRepository)(contrato_entity_1.Contrato)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository])
], ClientsService);
//# sourceMappingURL=clients.service.js.map