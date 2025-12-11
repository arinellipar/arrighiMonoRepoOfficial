import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ConfigService } from '@nestjs/config';
import { BlobServiceClient, ContainerClient } from '@azure/storage-blob';
import { Contrato } from '../../entities/contrato.entity';
import { ClienteDocumento } from '../../entities/cliente-documento.entity';
import { v4 as uuidv4 } from 'uuid';

// Limite de 30MB
const MAX_FILE_SIZE = 30 * 1024 * 1024;

// Tipos de arquivo permitidos
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

@Injectable()
export class DocumentsService {
  private blobServiceClient: BlobServiceClient;
  private containerName: string;
  private clienteDocsContainer: string;

  constructor(
    @InjectRepository(Contrato)
    private contratoRepository: Repository<Contrato>,
    @InjectRepository(ClienteDocumento)
    private clienteDocumentoRepository: Repository<ClienteDocumento>,
    private configService: ConfigService,
  ) {
    const connectionString = this.configService.get<string>(
      'AZURE_STORAGE_CONNECTION_STRING',
    );
    if (connectionString) {
      this.blobServiceClient =
        BlobServiceClient.fromConnectionString(connectionString);
    }
    this.containerName = this.configService.get<string>(
      'AZURE_STORAGE_CONTAINER',
      'documents',
    );
    this.clienteDocsContainer = this.configService.get<string>(
      'AZURE_STORAGE_CLIENTE_DOCS_CONTAINER',
      'cliente-documentos',
    );
  }

  // Garante que o container de documentos do cliente existe
  private async ensureClienteDocsContainerExists(): Promise<ContainerClient> {
    const containerClient = this.blobServiceClient.getContainerClient(
      this.clienteDocsContainer,
    );
    await containerClient.createIfNotExists({
      access: 'blob', // Acesso público para leitura
    });
    return containerClient;
  }

  // Lista documentos de contratos do cliente
  async getDocumentsByCliente(clienteId: number) {
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

  // Lista documentos anexados pelo cliente
  async getClienteDocumentos(clienteId: number) {
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

  // Upload de documento do cliente para Azure Blob Storage
  async uploadDocumento(
    clienteId: number,
    file: {
      buffer: Buffer;
      originalname: string;
      mimetype: string;
      size: number;
    },
    descricao?: string,
  ) {
    // Validações
    if (!file || !file.buffer) {
      throw new BadRequestException('Nenhum arquivo enviado');
    }

    if (file.size > MAX_FILE_SIZE) {
      throw new BadRequestException(
        `Arquivo muito grande. Limite máximo: ${this.formatFileSize(MAX_FILE_SIZE)}`,
      );
    }

    if (!ALLOWED_MIME_TYPES.includes(file.mimetype)) {
      throw new BadRequestException(
        'Tipo de arquivo não permitido. Tipos aceitos: PDF, imagens, Word, Excel, texto.',
      );
    }

    // Gera nome único para o arquivo
    const extension = file.originalname.split('.').pop() || '';
    const uniqueId = uuidv4();
    const blobName = `cliente_${clienteId}/${uniqueId}.${extension}`;

    // Upload para Azure Blob Storage
    const containerClient = await this.ensureClienteDocsContainerExists();
    const blockBlobClient = containerClient.getBlockBlobClient(blobName);

    await blockBlobClient.uploadData(file.buffer, {
      blobHTTPHeaders: {
        blobContentType: file.mimetype,
        blobContentDisposition: `attachment; filename="${encodeURIComponent(file.originalname)}"`,
      },
    });

    // Salva registro no banco de dados
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

  // Upload via Base64 (para React Native)
  async uploadDocumentoBase64(
    clienteId: number,
    data: {
      base64: string;
      fileName: string;
      mimeType: string;
      size: number;
      descricao?: string;
    },
  ) {
    // Converte Base64 para Buffer
    const buffer = Buffer.from(data.base64, 'base64');

    return this.uploadDocumento(
      clienteId,
      {
        buffer,
        originalname: data.fileName,
        mimetype: data.mimeType,
        size: data.size,
      },
      data.descricao,
    );
  }

  // Remove documento do cliente
  async deleteDocumento(clienteId: number, documentoId: number) {
    const documento = await this.clienteDocumentoRepository.findOne({
      where: { Id: documentoId, ClienteId: clienteId, Ativo: true },
    });

    if (!documento) {
      throw new NotFoundException('Documento não encontrado');
    }

    // Remove do Azure Blob Storage
    try {
      const containerClient = this.blobServiceClient.getContainerClient(
        this.clienteDocsContainer,
      );
      const blobClient = containerClient.getBlobClient(documento.BlobName);
      await blobClient.deleteIfExists();
    } catch (error) {
      console.warn('Erro ao deletar blob:', error);
    }

    // Marca como inativo no banco (soft delete)
    documento.Ativo = false;
    await this.clienteDocumentoRepository.save(documento);

    return { success: true, message: 'Documento excluído com sucesso' };
  }

  // Download de contrato
  async downloadContrato(clienteId: number, contratoId: number) {
    const contrato = await this.contratoRepository.findOne({
      where: { Id: contratoId, ClienteId: clienteId },
    });

    if (!contrato) {
      throw new NotFoundException('Contrato não encontrado');
    }

    if (!contrato.AnexoDocumento) {
      throw new NotFoundException('Este contrato não possui documento anexado');
    }

    // Buscar arquivo no Azure Blob Storage
    const containerClient = this.blobServiceClient.getContainerClient(
      this.containerName,
    );
    const blobClient = containerClient.getBlobClient(contrato.AnexoDocumento);

    const exists = await blobClient.exists();
    if (!exists) {
      throw new NotFoundException('Arquivo não encontrado no armazenamento');
    }

    // Gerar URL com SAS token para download temporário (1 hora)
    const sasUrl = await this.generateSasUrl(contrato.AnexoDocumento);

    return {
      url: sasUrl,
      nomeArquivo: contrato.AnexoDocumento,
      contratoId: contrato.Id,
    };
  }

  // Download de documento do cliente
  async downloadClienteDocumento(clienteId: number, documentoId: number) {
    const documento = await this.clienteDocumentoRepository.findOne({
      where: { Id: documentoId, ClienteId: clienteId, Ativo: true },
    });

    if (!documento) {
      throw new NotFoundException('Documento não encontrado');
    }

    // Gera URL com SAS token
    const sasUrl = await this.generateClienteDocSasUrl(documento.BlobName);

    return {
      url: sasUrl,
      nomeOriginal: documento.NomeOriginal,
      tipoMime: documento.TipoMime,
      tamanho: documento.Tamanho,
    };
  }

  private async generateSasUrl(blobName: string): Promise<string> {
    const containerClient = this.blobServiceClient.getContainerClient(
      this.containerName,
    );
    const blobClient = containerClient.getBlobClient(blobName);

    const expiresOn = new Date();
    expiresOn.setHours(expiresOn.getHours() + 1);

    const sasUrl = await blobClient.generateSasUrl({
      permissions: { read: true } as any,
      expiresOn,
    });

    return sasUrl;
  }

  private async generateClienteDocSasUrl(blobName: string): Promise<string> {
    const containerClient = this.blobServiceClient.getContainerClient(
      this.clienteDocsContainer,
    );
    const blobClient = containerClient.getBlobClient(blobName);

    const expiresOn = new Date();
    expiresOn.setHours(expiresOn.getHours() + 1);

    const sasUrl = await blobClient.generateSasUrl({
      permissions: { read: true } as any,
      expiresOn,
    });

    return sasUrl;
  }

  private formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }
}
