import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';

@Entity('ClienteDocumentos')
export class ClienteDocumento {
  @PrimaryGeneratedColumn()
  Id: number;

  @Column()
  ClienteId: number;

  @Column({ length: 255 })
  NomeOriginal: string;

  @Column({ length: 255 })
  NomeArquivo: string;

  @Column({ length: 100, nullable: true })
  TipoMime: string;

  @Column({ type: 'bigint' })
  Tamanho: number;

  @Column({ length: 500 })
  BlobUrl: string;

  @Column({ length: 255 })
  BlobName: string;

  @Column({ type: 'datetime', default: () => 'GETDATE()' })
  DataUpload: Date;

  @Column({ default: true })
  Ativo: boolean;

  @Column({ length: 500, nullable: true })
  Descricao: string;
}

