import { Repository } from 'typeorm';
import { ConfigService } from '@nestjs/config';
import { Contrato } from '../../entities/contrato.entity';
import { ClienteDocumento } from '../../entities/cliente-documento.entity';
export declare class DocumentsService {
    private contratoRepository;
    private clienteDocumentoRepository;
    private configService;
    private blobServiceClient;
    private containerName;
    private clienteDocsContainer;
    constructor(contratoRepository: Repository<Contrato>, clienteDocumentoRepository: Repository<ClienteDocumento>, configService: ConfigService);
    private ensureClienteDocsContainerExists;
    getDocumentsByCliente(clienteId: number): Promise<{
        id: number;
        tipo: string;
        nome: string;
        situacao: string;
        temAnexo: boolean;
        dataCadastro: Date;
        numeroParcelas: number;
    }[]>;
    getClienteDocumentos(clienteId: number): Promise<{
        id: number;
        nomeOriginal: string;
        nomeArquivo: string;
        tipoMime: string;
        tamanho: number;
        tamanhoFormatado: string;
        blobUrl: string;
        dataUpload: Date;
        descricao: string;
    }[]>;
    uploadDocumento(clienteId: number, file: {
        buffer: Buffer;
        originalname: string;
        mimetype: string;
        size: number;
    }, descricao?: string): Promise<{
        id: number;
        nomeOriginal: string;
        nomeArquivo: string;
        tipoMime: string;
        tamanho: number;
        tamanhoFormatado: string;
        blobUrl: string;
        dataUpload: Date;
        descricao: string;
    }>;
    uploadDocumentoBase64(clienteId: number, data: {
        base64: string;
        fileName: string;
        mimeType: string;
        size: number;
        descricao?: string;
    }): Promise<{
        id: number;
        nomeOriginal: string;
        nomeArquivo: string;
        tipoMime: string;
        tamanho: number;
        tamanhoFormatado: string;
        blobUrl: string;
        dataUpload: Date;
        descricao: string;
    }>;
    deleteDocumento(clienteId: number, documentoId: number): Promise<{
        success: boolean;
        message: string;
    }>;
    downloadContrato(clienteId: number, contratoId: number): Promise<{
        url: string;
        nomeArquivo: string;
        contratoId: number;
    }>;
    downloadClienteDocumento(clienteId: number, documentoId: number): Promise<{
        url: string;
        nomeOriginal: string;
        tipoMime: string;
        tamanho: number;
    }>;
    private generateSasUrl;
    private generateClienteDocSasUrl;
    private formatFileSize;
}
