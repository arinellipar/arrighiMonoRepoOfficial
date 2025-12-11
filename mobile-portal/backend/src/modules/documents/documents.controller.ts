import {
  Controller,
  Get,
  Post,
  Delete,
  Param,
  Body,
  UseGuards,
  Request,
  ParseIntPipe,
  UseInterceptors,
  UploadedFile,
  BadRequestException,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { DocumentsService } from './documents.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

// DTO para upload via Base64 (React Native)
class UploadBase64Dto {
  base64: string;
  fileName: string;
  mimeType: string;
  size: number;
  descricao?: string;
}

@Controller('documents')
@UseGuards(JwtAuthGuard)
export class DocumentsController {
  constructor(private readonly documentsService: DocumentsService) {}

  // Lista contratos do cliente
  @Get()
  async getAll(@Request() req) {
    return this.documentsService.getDocumentsByCliente(req.user.clienteId);
  }

  // Lista documentos anexados pelo cliente
  @Get('meus-arquivos')
  async getMeusArquivos(@Request() req) {
    return this.documentsService.getClienteDocumentos(req.user.clienteId);
  }

  // Download de contrato
  @Get('contrato/:id/download')
  async downloadContrato(
    @Request() req,
    @Param('id', ParseIntPipe) id: number,
  ) {
    return this.documentsService.downloadContrato(req.user.clienteId, id);
  }

  // Download de documento do cliente
  @Get('meus-arquivos/:id/download')
  async downloadMeuArquivo(
    @Request() req,
    @Param('id', ParseIntPipe) id: number,
  ) {
    return this.documentsService.downloadClienteDocumento(req.user.clienteId, id);
  }

  // Upload de documento via multipart/form-data
  @Post('upload')
  @UseInterceptors(FileInterceptor('file'))
  async uploadFile(
    @Request() req,
    @UploadedFile() file: Express.Multer.File,
    @Body('descricao') descricao?: string,
  ) {
    if (!file) {
      throw new BadRequestException('Nenhum arquivo enviado');
    }

    return this.documentsService.uploadDocumento(
      req.user.clienteId,
      {
        buffer: file.buffer,
        originalname: file.originalname,
        mimetype: file.mimetype,
        size: file.size,
      },
      descricao,
    );
  }

  // Upload de documento via Base64 (para React Native)
  @Post('upload-base64')
  async uploadBase64(
    @Request() req,
    @Body() data: UploadBase64Dto,
  ) {
    if (!data.base64 || !data.fileName || !data.mimeType) {
      throw new BadRequestException('Dados incompletos. Envie base64, fileName e mimeType.');
    }

    return this.documentsService.uploadDocumentoBase64(req.user.clienteId, data);
  }

  // Excluir documento do cliente
  @Delete('meus-arquivos/:id')
  async deleteDocumento(
    @Request() req,
    @Param('id', ParseIntPipe) id: number,
  ) {
    return this.documentsService.deleteDocumento(req.user.clienteId, id);
  }
}
