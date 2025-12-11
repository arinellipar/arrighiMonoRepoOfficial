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
exports.DocumentsService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const config_1 = require("@nestjs/config");
const storage_blob_1 = require("@azure/storage-blob");
const contrato_entity_1 = require("../../entities/contrato.entity");
const cliente_documento_entity_1 = require("../../entities/cliente-documento.entity");
const uuid_1 = require("uuid");
const MAX_FILE_SIZE = 30 * 1024 * 1024;
const ALLOWED_MIME_TYPES = [
    'application/pdf',
    'image/jpeg',
    'image/jpg',
    'image/png',
    'image/gif',
    'image/webp',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'text/plain',
];
let DocumentsService = class DocumentsService {
    contratoRepository;
    clienteDocumentoRepository;
    configService;
    blobServiceClient;
    containerName;
    clienteDocsContainer;
    constructor(contratoRepository, clienteDocumentoRepository, configService) {
        this.contratoRepository = contratoRepository;
        this.clienteDocumentoRepository = clienteDocumentoRepository;
        this.configService = configService;
        const connectionString = this.configService.get('AZURE_STORAGE_CONNECTION_STRING');
        if (connectionString) {
            this.blobServiceClient =
                storage_blob_1.BlobServiceClient.fromConnectionString(connectionString);
        }
        this.containerName = this.configService.get('AZURE_STORAGE_CONTAINER', 'documents');
        this.clienteDocsContainer = this.configService.get('AZURE_STORAGE_CLIENTE_DOCS_CONTAINER', 'cliente-documentos');
    }
    async ensureClienteDocsContainerExists() {
        const containerClient = this.blobServiceClient.getContainerClient(this.clienteDocsContainer);
        await containerClient.createIfNotExists({
            access: 'blob',
        });
        return containerClient;
    }
    async getDocumentsByCliente(clienteId) {
        const contratos = await this.contratoRepository.find({
            where: { ClienteId: clienteId },
        });
        return contratos.map((c) => ({
            id: c.Id,
            tipo: 'contrato',
            nome: `Contrato #${c.Id}`,
            situacao: c.Situacao,
            temAnexo: !!c.AnexoDocumento,
            dataCadastro: c.DataCadastro,
            numeroParcelas: c.NumeroParcelas,
        }));
    }
    async getClienteDocumentos(clienteId) {
        const documentos = await this.clienteDocumentoRepository.find({
            where: { ClienteId: clienteId, Ativo: true },
            order: { DataUpload: 'DESC' },
        });
        return documentos.map((d) => ({
            id: d.Id,
            nomeOriginal: d.NomeOriginal,
            nomeArquivo: d.NomeArquivo,
            tipoMime: d.TipoMime,
            tamanho: d.Tamanho,
            tamanhoFormatado: this.formatFileSize(d.Tamanho),
            blobUrl: d.BlobUrl,
            dataUpload: d.DataUpload,
            descricao: d.Descricao,
        }));
    }
    async uploadDocumento(clienteId, file, descricao) {
        if (!file || !file.buffer) {
            throw new common_1.BadRequestException('Nenhum arquivo enviado');
        }
        if (file.size > MAX_FILE_SIZE) {
            throw new common_1.BadRequestException(`Arquivo muito grande. Limite máximo: ${this.formatFileSize(MAX_FILE_SIZE)}`);
        }
        if (!ALLOWED_MIME_TYPES.includes(file.mimetype)) {
            throw new common_1.BadRequestException('Tipo de arquivo não permitido. Tipos aceitos: PDF, imagens, Word, Excel, texto.');
        }
        const extension = file.originalname.split('.').pop() || '';
        const uniqueId = (0, uuid_1.v4)();
        const blobName = `cliente_${clienteId}/${uniqueId}.${extension}`;
        const containerClient = await this.ensureClienteDocsContainerExists();
        const blockBlobClient = containerClient.getBlockBlobClient(blobName);
        await blockBlobClient.uploadData(file.buffer, {
            blobHTTPHeaders: {
                blobContentType: file.mimetype,
                blobContentDisposition: `attachment; filename="${encodeURIComponent(file.originalname)}"`,
            },
        });
        const documento = this.clienteDocumentoRepository.create({
            ClienteId: clienteId,
            NomeOriginal: file.originalname,
            NomeArquivo: blobName,
            TipoMime: file.mimetype,
            Tamanho: file.size,
            BlobUrl: blockBlobClient.url,
            BlobName: blobName,
            Descricao: descricao,
            Ativo: true,
        });
        const saved = await this.clienteDocumentoRepository.save(documento);
        return {
            id: saved.Id,
            nomeOriginal: saved.NomeOriginal,
            nomeArquivo: saved.NomeArquivo,
            tipoMime: saved.TipoMime,
            tamanho: saved.Tamanho,
            tamanhoFormatado: this.formatFileSize(saved.Tamanho),
            blobUrl: saved.BlobUrl,
            dataUpload: saved.DataUpload,
            descricao: saved.Descricao,
        };
    }
    async uploadDocumentoBase64(clienteId, data) {
        const buffer = Buffer.from(data.base64, 'base64');
        return this.uploadDocumento(clienteId, {
            buffer,
            originalname: data.fileName,
            mimetype: data.mimeType,
            size: data.size,
        }, data.descricao);
    }
    async deleteDocumento(clienteId, documentoId) {
        const documento = await this.clienteDocumentoRepository.findOne({
            where: { Id: documentoId, ClienteId: clienteId, Ativo: true },
        });
        if (!documento) {
            throw new common_1.NotFoundException('Documento não encontrado');
        }
        try {
            const containerClient = this.blobServiceClient.getContainerClient(this.clienteDocsContainer);
            const blobClient = containerClient.getBlobClient(documento.BlobName);
            await blobClient.deleteIfExists();
        }
        catch (error) {
            console.warn('Erro ao deletar blob:', error);
        }
        documento.Ativo = false;
        await this.clienteDocumentoRepository.save(documento);
        return { success: true, message: 'Documento excluído com sucesso' };
    }
    async downloadContrato(clienteId, contratoId) {
        const contrato = await this.contratoRepository.findOne({
            where: { Id: contratoId, ClienteId: clienteId },
        });
        if (!contrato) {
            throw new common_1.NotFoundException('Contrato não encontrado');
        }
        if (!contrato.AnexoDocumento) {
            throw new common_1.NotFoundException('Este contrato não possui documento anexado');
        }
        const containerClient = this.blobServiceClient.getContainerClient(this.containerName);
        const blobClient = containerClient.getBlobClient(contrato.AnexoDocumento);
        const exists = await blobClient.exists();
        if (!exists) {
            throw new common_1.NotFoundException('Arquivo não encontrado no armazenamento');
        }
        const sasUrl = await this.generateSasUrl(contrato.AnexoDocumento);
        return {
            url: sasUrl,
            nomeArquivo: contrato.AnexoDocumento,
            contratoId: contrato.Id,
        };
    }
    async downloadClienteDocumento(clienteId, documentoId) {
        const documento = await this.clienteDocumentoRepository.findOne({
            where: { Id: documentoId, ClienteId: clienteId, Ativo: true },
        });
        if (!documento) {
            throw new common_1.NotFoundException('Documento não encontrado');
        }
        const sasUrl = await this.generateClienteDocSasUrl(documento.BlobName);
        return {
            url: sasUrl,
            nomeOriginal: documento.NomeOriginal,
            tipoMime: documento.TipoMime,
            tamanho: documento.Tamanho,
        };
    }
    async generateSasUrl(blobName) {
        const containerClient = this.blobServiceClient.getContainerClient(this.containerName);
        const blobClient = containerClient.getBlobClient(blobName);
        const expiresOn = new Date();
        expiresOn.setHours(expiresOn.getHours() + 1);
        const sasUrl = await blobClient.generateSasUrl({
            permissions: { read: true },
            expiresOn,
        });
        return sasUrl;
    }
    async generateClienteDocSasUrl(blobName) {
        const containerClient = this.blobServiceClient.getContainerClient(this.clienteDocsContainer);
        const blobClient = containerClient.getBlobClient(blobName);
        const expiresOn = new Date();
        expiresOn.setHours(expiresOn.getHours() + 1);
        const sasUrl = await blobClient.generateSasUrl({
            permissions: { read: true },
            expiresOn,
        });
        return sasUrl;
    }
    formatFileSize(bytes) {
        if (bytes === 0)
            return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    }
};
exports.DocumentsService = DocumentsService;
exports.DocumentsService = DocumentsService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(contrato_entity_1.Contrato)),
    __param(1, (0, typeorm_1.InjectRepository)(cliente_documento_entity_1.ClienteDocumento)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository,
        config_1.ConfigService])
], DocumentsService);
//# sourceMappingURL=documents.service.js.map