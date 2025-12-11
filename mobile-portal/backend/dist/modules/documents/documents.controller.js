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
exports.DocumentsController = void 0;
const common_1 = require("@nestjs/common");
const platform_express_1 = require("@nestjs/platform-express");
const documents_service_1 = require("./documents.service");
const jwt_auth_guard_1 = require("../auth/guards/jwt-auth.guard");
class UploadBase64Dto {
    base64;
    fileName;
    mimeType;
    size;
    descricao;
}
let DocumentsController = class DocumentsController {
    documentsService;
    constructor(documentsService) {
        this.documentsService = documentsService;
    }
    async getAll(req) {
        return this.documentsService.getDocumentsByCliente(req.user.clienteId);
    }
    async getMeusArquivos(req) {
        return this.documentsService.getClienteDocumentos(req.user.clienteId);
    }
    async downloadContrato(req, id) {
        return this.documentsService.downloadContrato(req.user.clienteId, id);
    }
    async downloadMeuArquivo(req, id) {
        return this.documentsService.downloadClienteDocumento(req.user.clienteId, id);
    }
    async uploadFile(req, file, descricao) {
        if (!file) {
            throw new common_1.BadRequestException('Nenhum arquivo enviado');
        }
        return this.documentsService.uploadDocumento(req.user.clienteId, {
            buffer: file.buffer,
            originalname: file.originalname,
            mimetype: file.mimetype,
            size: file.size,
        }, descricao);
    }
    async uploadBase64(req, data) {
        if (!data.base64 || !data.fileName || !data.mimeType) {
            throw new common_1.BadRequestException('Dados incompletos. Envie base64, fileName e mimeType.');
        }
        return this.documentsService.uploadDocumentoBase64(req.user.clienteId, data);
    }
    async deleteDocumento(req, id) {
        return this.documentsService.deleteDocumento(req.user.clienteId, id);
    }
};
exports.DocumentsController = DocumentsController;
__decorate([
    (0, common_1.Get)(),
    __param(0, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], DocumentsController.prototype, "getAll", null);
__decorate([
    (0, common_1.Get)('meus-arquivos'),
    __param(0, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], DocumentsController.prototype, "getMeusArquivos", null);
__decorate([
    (0, common_1.Get)('contrato/:id/download'),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Number]),
    __metadata("design:returntype", Promise)
], DocumentsController.prototype, "downloadContrato", null);
__decorate([
    (0, common_1.Get)('meus-arquivos/:id/download'),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Number]),
    __metadata("design:returntype", Promise)
], DocumentsController.prototype, "downloadMeuArquivo", null);
__decorate([
    (0, common_1.Post)('upload'),
    (0, common_1.UseInterceptors)((0, platform_express_1.FileInterceptor)('file')),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.UploadedFile)()),
    __param(2, (0, common_1.Body)('descricao')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object, String]),
    __metadata("design:returntype", Promise)
], DocumentsController.prototype, "uploadFile", null);
__decorate([
    (0, common_1.Post)('upload-base64'),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, UploadBase64Dto]),
    __metadata("design:returntype", Promise)
], DocumentsController.prototype, "uploadBase64", null);
__decorate([
    (0, common_1.Delete)('meus-arquivos/:id'),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Number]),
    __metadata("design:returntype", Promise)
], DocumentsController.prototype, "deleteDocumento", null);
exports.DocumentsController = DocumentsController = __decorate([
    (0, common_1.Controller)('documents'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __metadata("design:paramtypes", [documents_service_1.DocumentsService])
], DocumentsController);
//# sourceMappingURL=documents.controller.js.map