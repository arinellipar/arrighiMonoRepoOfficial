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
exports.ClienteDocumento = void 0;
const typeorm_1 = require("typeorm");
let ClienteDocumento = class ClienteDocumento {
    Id;
    ClienteId;
    NomeOriginal;
    NomeArquivo;
    TipoMime;
    Tamanho;
    BlobUrl;
    BlobName;
    DataUpload;
    Ativo;
    Descricao;
};
exports.ClienteDocumento = ClienteDocumento;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)(),
    __metadata("design:type", Number)
], ClienteDocumento.prototype, "Id", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", Number)
], ClienteDocumento.prototype, "ClienteId", void 0);
__decorate([
    (0, typeorm_1.Column)({ length: 255 }),
    __metadata("design:type", String)
], ClienteDocumento.prototype, "NomeOriginal", void 0);
__decorate([
    (0, typeorm_1.Column)({ length: 255 }),
    __metadata("design:type", String)
], ClienteDocumento.prototype, "NomeArquivo", void 0);
__decorate([
    (0, typeorm_1.Column)({ length: 100, nullable: true }),
    __metadata("design:type", String)
], ClienteDocumento.prototype, "TipoMime", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'bigint' }),
    __metadata("design:type", Number)
], ClienteDocumento.prototype, "Tamanho", void 0);
__decorate([
    (0, typeorm_1.Column)({ length: 500 }),
    __metadata("design:type", String)
], ClienteDocumento.prototype, "BlobUrl", void 0);
__decorate([
    (0, typeorm_1.Column)({ length: 255 }),
    __metadata("design:type", String)
], ClienteDocumento.prototype, "BlobName", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'datetime', default: () => 'GETDATE()' }),
    __metadata("design:type", Date)
], ClienteDocumento.prototype, "DataUpload", void 0);
__decorate([
    (0, typeorm_1.Column)({ default: true }),
    __metadata("design:type", Boolean)
], ClienteDocumento.prototype, "Ativo", void 0);
__decorate([
    (0, typeorm_1.Column)({ length: 500, nullable: true }),
    __metadata("design:type", String)
], ClienteDocumento.prototype, "Descricao", void 0);
exports.ClienteDocumento = ClienteDocumento = __decorate([
    (0, typeorm_1.Entity)('ClienteDocumentos')
], ClienteDocumento);
//# sourceMappingURL=cliente-documento.entity.js.map