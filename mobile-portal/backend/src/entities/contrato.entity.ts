import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity('Contratos')
export class Contrato {
  @PrimaryGeneratedColumn()
  Id: number;

  @Column()
  ClienteId: number;

  @Column({ nullable: true })
  ConsultorId: number;

  @Column({ nullable: true })
  ParceiroId: number;

  @Column({ length: 100, nullable: true })
  Situacao: string;

  @Column({ type: 'decimal', precision: 18, scale: 2, nullable: true })
  ValorDevido: number;

  @Column({ type: 'decimal', precision: 18, scale: 2, nullable: true })
  ValorNegociado: number;

  @Column({ type: 'decimal', precision: 18, scale: 2, nullable: true })
  ValorEntrada: number;

  @Column({ type: 'decimal', precision: 18, scale: 2, nullable: true })
  ValorParcela: number;

  @Column({ nullable: true })
  NumeroParcelas: number;

  @Column({ type: 'datetime', nullable: true })
  PrimeiroVencimento: Date;

  @Column({ type: 'datetime', nullable: true })
  DataCadastro: Date;

  @Column({ type: 'datetime', nullable: true })
  DataFechamentoContrato: Date;

  @Column({ type: 'text', nullable: true })
  Observacoes: string;

  @Column({ nullable: true })
  AnexoDocumento: string;

  @Column({ default: true })
  Ativo: boolean;

  @Column({ type: 'decimal', precision: 18, scale: 2, nullable: true })
  Comissao: number;

  @Column({ length: 100, nullable: true })
  NumeroPasta: string;

  @Column({ length: 200, nullable: true })
  TipoServico: string;

  @Column({ type: 'text', nullable: true })
  ObjetoContrato: string;

  @Column({ type: 'text', nullable: true })
  Pendencias: string;

  @Column({ type: 'datetime', nullable: true })
  DataUltimoContato: Date;

  @Column({ type: 'datetime', nullable: true })
  DataProximoContato: Date;

  @Column({ type: 'datetime', nullable: true })
  DataAtualizacao: Date;
}
