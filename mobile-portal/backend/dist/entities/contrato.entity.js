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
Object.defineProperty(exports, "__esModule", { value: true });
exports.Contrato = void 0;
const typeorm_1 = require("typeorm");
let Contrato = class Contrato {
    Id;
    ClienteId;
    ConsultorId;
    ParceiroId;
    Situacao;
    ValorDevido;
    ValorNegociado;
    ValorEntrada;
    ValorParcela;
    NumeroParcelas;
    PrimeiroVencimento;
    DataCadastro;
    DataFechamentoContrato;
    Observacoes;
    AnexoDocumento;
    Ativo;
    Comissao;
    NumeroPasta;
    TipoServico;
    ObjetoContrato;
    Pendencias;
    DataUltimoContato;
    DataProximoContato;
    DataAtualizacao;
};
exports.Contrato = Contrato;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)(),
    __metadata("design:type", Number)
], Contrato.prototype, "Id", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", Number)
], Contrato.prototype, "ClienteId", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", Number)
], Contrato.prototype, "ConsultorId", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", Number)
], Contrato.prototype, "ParceiroId", void 0);
__decorate([
    (0, typeorm_1.Column)({ length: 100, nullable: true }),
    __metadata("design:type", String)
], Contrato.prototype, "Situacao", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'decimal', precision: 18, scale: 2, nullable: true }),
    __metadata("design:type", Number)
], Contrato.prototype, "ValorDevido", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'decimal', precision: 18, scale: 2, nullable: true }),
    __metadata("design:type", Number)
], Contrato.prototype, "ValorNegociado", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'decimal', precision: 18, scale: 2, nullable: true }),
    __metadata("design:type", Number)
], Contrato.prototype, "ValorEntrada", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'decimal', precision: 18, scale: 2, nullable: true }),
    __metadata("design:type", Number)
], Contrato.prototype, "ValorParcela", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", Number)
], Contrato.prototype, "NumeroParcelas", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'datetime', nullable: true }),
    __metadata("design:type", Date)
], Contrato.prototype, "PrimeiroVencimento", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'datetime', nullable: true }),
    __metadata("design:type", Date)
], Contrato.prototype, "DataCadastro", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'datetime', nullable: true }),
    __metadata("design:type", Date)
], Contrato.prototype, "DataFechamentoContrato", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'text', nullable: true }),
    __metadata("design:type", String)
], Contrato.prototype, "Observacoes", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], Contrato.prototype, "AnexoDocumento", void 0);
__decorate([
    (0, typeorm_1.Column)({ default: true }),
    __metadata("design:type", Boolean)
], Contrato.prototype, "Ativo", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'decimal', precision: 18, scale: 2, nullable: true }),
    __metadata("design:type", Number)
], Contrato.prototype, "Comissao", void 0);
__decorate([
    (0, typeorm_1.Column)({ length: 100, nullable: true }),
    __metadata("design:type", String)
], Contrato.prototype, "NumeroPasta", void 0);
__decorate([
    (0, typeorm_1.Column)({ length: 200, nullable: true }),
    __metadata("design:type", String)
], Contrato.prototype, "TipoServico", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'text', nullable: true }),
    __metadata("design:type", String)
], Contrato.prototype, "ObjetoContrato", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'text', nullable: true }),
    __metadata("design:type", String)
], Contrato.prototype, "Pendencias", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'datetime', nullable: true }),
    __metadata("design:type", Date)
], Contrato.prototype, "DataUltimoContato", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'datetime', nullable: true }),
    __metadata("design:type", Date)
], Contrato.prototype, "DataProximoContato", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'datetime', nullable: true }),
    __metadata("design:type", Date)
], Contrato.prototype, "DataAtualizacao", void 0);
exports.Contrato = Contrato = __decorate([
    (0, typeorm_1.Entity)('Contratos')
], Contrato);
//# sourceMappingURL=contrato.entity.js.map