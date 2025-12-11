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
exports.PessoaJuridica = exports.PessoaFisica = exports.Cliente = void 0;
const typeorm_1 = require("typeorm");
let Cliente = class Cliente {
    Id;
    PessoaFisicaId;
    PessoaJuridicaId;
    Status;
    DataCadastro;
    Observacoes;
};
exports.Cliente = Cliente;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)(),
    __metadata("design:type", Number)
], Cliente.prototype, "Id", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", Number)
], Cliente.prototype, "PessoaFisicaId", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", Number)
], Cliente.prototype, "PessoaJuridicaId", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], Cliente.prototype, "Status", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'datetime', nullable: true }),
    __metadata("design:type", Date)
], Cliente.prototype, "DataCadastro", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], Cliente.prototype, "Observacoes", void 0);
exports.Cliente = Cliente = __decorate([
    (0, typeorm_1.Entity)('Clientes')
], Cliente);
let PessoaFisica = class PessoaFisica {
    Id;
    Nome;
    CPF;
    EmailEmpresarial;
    EmailPessoal;
    Telefone1;
    Telefone2;
    DataNascimento;
};
exports.PessoaFisica = PessoaFisica;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)(),
    __metadata("design:type", Number)
], PessoaFisica.prototype, "Id", void 0);
__decorate([
    (0, typeorm_1.Column)({ length: 200 }),
    __metadata("design:type", String)
], PessoaFisica.prototype, "Nome", void 0);
__decorate([
    (0, typeorm_1.Column)({ length: 14, name: 'Cpf' }),
    __metadata("design:type", String)
], PessoaFisica.prototype, "CPF", void 0);
__decorate([
    (0, typeorm_1.Column)({ length: 150, nullable: true }),
    __metadata("design:type", String)
], PessoaFisica.prototype, "EmailEmpresarial", void 0);
__decorate([
    (0, typeorm_1.Column)({ length: 150, nullable: true }),
    __metadata("design:type", String)
], PessoaFisica.prototype, "EmailPessoal", void 0);
__decorate([
    (0, typeorm_1.Column)({ length: 15, nullable: true }),
    __metadata("design:type", String)
], PessoaFisica.prototype, "Telefone1", void 0);
__decorate([
    (0, typeorm_1.Column)({ length: 15, nullable: true }),
    __metadata("design:type", String)
], PessoaFisica.prototype, "Telefone2", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'date', nullable: true }),
    __metadata("design:type", Date)
], PessoaFisica.prototype, "DataNascimento", void 0);
exports.PessoaFisica = PessoaFisica = __decorate([
    (0, typeorm_1.Entity)('PessoasFisicas')
], PessoaFisica);
let PessoaJuridica = class PessoaJuridica {
    Id;
    RazaoSocial;
    NomeFantasia;
    CNPJ;
    Email;
    Telefone1;
    Telefone2;
};
exports.PessoaJuridica = PessoaJuridica;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)(),
    __metadata("design:type", Number)
], PessoaJuridica.prototype, "Id", void 0);
__decorate([
    (0, typeorm_1.Column)({ length: 200 }),
    __metadata("design:type", String)
], PessoaJuridica.prototype, "RazaoSocial", void 0);
__decorate([
    (0, typeorm_1.Column)({ length: 200, nullable: true }),
    __metadata("design:type", String)
], PessoaJuridica.prototype, "NomeFantasia", void 0);
__decorate([
    (0, typeorm_1.Column)({ length: 18, name: 'Cnpj' }),
    __metadata("design:type", String)
], PessoaJuridica.prototype, "CNPJ", void 0);
__decorate([
    (0, typeorm_1.Column)({ length: 150, nullable: true }),
    __metadata("design:type", String)
], PessoaJuridica.prototype, "Email", void 0);
__decorate([
    (0, typeorm_1.Column)({ length: 15, nullable: true }),
    __metadata("design:type", String)
], PessoaJuridica.prototype, "Telefone1", void 0);
__decorate([
    (0, typeorm_1.Column)({ length: 15, nullable: true }),
    __metadata("design:type", String)
], PessoaJuridica.prototype, "Telefone2", void 0);
exports.PessoaJuridica = PessoaJuridica = __decorate([
    (0, typeorm_1.Entity)('PessoasJuridicas')
], PessoaJuridica);
//# sourceMappingURL=cliente.entity.js.map