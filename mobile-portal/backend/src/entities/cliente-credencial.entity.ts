import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

// Nova tabela para credenciais de acesso do portal do cliente
@Entity('ClienteCredenciais')
export class ClienteCredencial {
  @PrimaryGeneratedColumn()
  Id: number;

  @Column()
  ClienteId: number;

  @Column({ length: 200, unique: true })
  Email: string;

  @Column({ length: 255 })
  SenhaHash: string;

  @Column({ default: true })
  Ativo: boolean;

  @Column({ default: false })
  EmailVerificado: boolean;

  @Column({ nullable: true })
  TokenVerificacao: string;

  @Column({ type: 'datetime', nullable: true })
  TokenExpiracao: Date;

  @Column({ type: 'datetime', nullable: true })
  UltimoAcesso: Date;

  @Column({ nullable: true })
  DispositivoToken: string;

  @CreateDateColumn()
  DataCriacao: Date;

  @UpdateDateColumn()
  DataAtualizacao: Date;
}
