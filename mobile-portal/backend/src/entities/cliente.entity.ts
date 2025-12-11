import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
} from 'typeorm';

@Entity('Clientes')
export class Cliente {
  @PrimaryGeneratedColumn()
  Id: number;

  @Column({ nullable: true })
  PessoaFisicaId: number;

  @Column({ nullable: true })
  PessoaJuridicaId: number;

  @Column({ nullable: true })
  Status: string;

  @Column({ type: 'datetime', nullable: true })
  DataCadastro: Date;

  @Column({ nullable: true })
  Observacoes: string;
}

@Entity('PessoasFisicas')
export class PessoaFisica {
  @PrimaryGeneratedColumn()
  Id: number;

  @Column({ length: 200 })
  Nome: string;

  @Column({ length: 14, name: 'Cpf' })
  CPF: string;

  @Column({ length: 150, nullable: true })
  EmailEmpresarial: string;

  @Column({ length: 150, nullable: true })
  EmailPessoal: string;

  @Column({ length: 15, nullable: true })
  Telefone1: string;

  @Column({ length: 15, nullable: true })
  Telefone2: string;

  @Column({ type: 'date', nullable: true })
  DataNascimento: Date;
}

@Entity('PessoasJuridicas')
export class PessoaJuridica {
  @PrimaryGeneratedColumn()
  Id: number;

  @Column({ length: 200 })
  RazaoSocial: string;

  @Column({ length: 200, nullable: true })
  NomeFantasia: string;

  @Column({ length: 18, name: 'Cnpj' })
  CNPJ: string;

  @Column({ length: 150, nullable: true })
  Email: string;

  @Column({ length: 15, nullable: true })
  Telefone1: string;

  @Column({ length: 15, nullable: true })
  Telefone2: string;
}
