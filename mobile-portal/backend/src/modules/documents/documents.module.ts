import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MulterModule } from '@nestjs/platform-express';
import { DocumentsService } from './documents.service';
import { DocumentsController } from './documents.controller';
import { Contrato } from '../../entities/contrato.entity';
import { ClienteDocumento } from '../../entities/cliente-documento.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Contrato, ClienteDocumento]),
    MulterModule.register({
      limits: {
        fileSize: 30 * 1024 * 1024, // 30MB
      },
    }),
  ],
  controllers: [DocumentsController],
  providers: [DocumentsService],
  exports: [DocumentsService],
})
export class DocumentsModule {}
