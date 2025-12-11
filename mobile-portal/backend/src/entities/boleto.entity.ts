import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
} from 'typeorm';

@Entity('Boletos')
export class Boleto {
  @PrimaryGeneratedColumn()
  Id: number;

  @Column()
  ContratoId: number;

  @Column({ length: 100, nullable: true })
  NsuCode: string;

  @Column({ type: 'datetime', nullable: true })
  NsuDate: Date;

  @Column({ length: 50, nullable: true })
  CovenantCode: string;

  @Column({ length: 100, nullable: true })
  BankNumber: string;

  @Column({ length: 100, nullable: true })
  ClientNumber: string;

  @Column({ type: 'datetime' })
  DueDate: Date;

  @Column({ type: 'datetime', nullable: true })
  IssueDate: Date;

  @Column({ type: 'decimal', precision: 18, scale: 2 })
  NominalValue: number;

  @Column({ length: 100, nullable: true })
  DocumentKind: string;

  @Column({ length: 200, nullable: true })
  PayerName: string;

  @Column({ length: 20, nullable: true })
  PayerDocumentType: string;

  @Column({ length: 20, nullable: true })
  PayerDocumentNumber: string;

  @Column({ length: 200, nullable: true })
  PayerAddress: string;

  @Column({ length: 100, nullable: true })
  PayerNeighborhood: string;

  @Column({ length: 100, nullable: true })
  PayerCity: string;

  @Column({ length: 10, nullable: true })
  PayerState: string;

  @Column({ length: 20, nullable: true })
  PayerZipCode: string;

  @Column({ type: 'decimal', precision: 18, scale: 2, nullable: true })
  FinePercentage: number;

  @Column({ nullable: true })
  FineQuantityDays: number;

  @Column({ type: 'decimal', precision: 18, scale: 2, nullable: true })
  InterestPercentage: number;

  @Column({ type: 'decimal', precision: 18, scale: 2, nullable: true })
  DeductionValue: number;

  @Column({ nullable: true })
  WriteOffQuantityDays: number;

  @Column({ length: 100, nullable: true })
  BarCode: string;

  @Column({ length: 100, nullable: true })
  DigitableLine: string;

  @Column({ type: 'datetime', nullable: true })
  EntryDate: Date;

  @Column({ type: 'text', nullable: true })
  QrCodePix: string;

  @Column({ type: 'text', nullable: true })
  QrCodeUrl: string;

  @Column({ length: 50 })
  Status: string;

  @Column({ type: 'text', nullable: true })
  Messages: string;

  @Column({ type: 'datetime' })
  DataCadastro: Date;

  @Column({ type: 'datetime', nullable: true })
  DataAtualizacao: Date;

  @Column({ default: true })
  Ativo: boolean;

  @Column({ length: 100, nullable: true })
  ErrorCode: string;

  @Column({ type: 'text', nullable: true })
  ErrorMessage: string;

  @Column({ length: 100, nullable: true })
  TraceId: string;

  @Column({ nullable: true })
  NumeroParcela: number;
}
