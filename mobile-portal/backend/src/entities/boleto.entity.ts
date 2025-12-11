import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
} from 'typeorm';

@Entity('Boletos')
export class Boleto {
  @PrimaryGeneratedColumn()
  Id: number;

  @Column()
  ContratoId: number;

  @Column({ length: 100, nullable: true })
  BankSlipId: string;

  @Column({ length: 50, nullable: true })
  CovenantCode: string;

  @Column({ length: 100, nullable: true })
  OurNumber: string;

  @Column({ length: 100, nullable: true })
  BarCode: string;

  @Column({ length: 100, nullable: true })
  DigitableLine: string;

  @Column({ type: 'decimal', precision: 18, scale: 2 })
  NominalValue: number;

  @Column({ type: 'date' })
  DueDate: Date;

  @Column({ length: 200, nullable: true })
  PayerName: string;

  @Column({ length: 20, nullable: true })
  PayerDocumentNumber: string;

  @Column({ length: 50 })
  Status: string;

  @Column({ type: 'datetime', nullable: true })
  DataCadastro: Date;

  @Column({ type: 'datetime', nullable: true })
  DataPagamento: Date;

  @Column({ type: 'decimal', precision: 18, scale: 2, nullable: true })
  PaidValue: number;

  @Column({ nullable: true })
  NumeroParcela: number;

  @Column({ default: true })
  Ativo: boolean;

  @Column({ nullable: true })
  FoiPago: boolean;

  @Column({ type: 'text', nullable: true })
  QRCodePix: string;

  @Column({ type: 'text', nullable: true })
  QRCodeUrl: string;
}
