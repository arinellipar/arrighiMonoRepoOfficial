import { DocumentsService } from './documents.service';
declare class UploadBase64Dto {
    base64: string;
    fileName: string;
    mimeType: string;
    size: number;
    descricao?: string;
}
export declare class DocumentsController {
    private readonly documentsService;
    constructor(documentsService: DocumentsService);
    getAll(req: any): Promise<{
        id: number;
        tipo: string;
        nome: string;
        situacao: string;
        temAnexo: boolean;
        dataCadastro: Date;
        numeroParcelas: number;
    }[]>;
    getMeusArquivos(req: any): Promise<{
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
    downloadContrato(req: any, id: number): Promise<{
        url: string;
        nomeArquivo: string;
        contratoId: number;
    }>;
    downloadMeuArquivo(req: any, id: number): Promise<{
        url: string;
        nomeOriginal: string;
        tipoMime: string;
        tamanho: number;
    }>;
    uploadFile(req: any, file: Express.Multer.File, descricao?: string): Promise<{
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
    uploadBase64(req: any, data: UploadBase64Dto): Promise<{
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
    deleteDocumento(req: any, id: number): Promise<{
        success: boolean;
        message: string;
    }>;
}
export {};
