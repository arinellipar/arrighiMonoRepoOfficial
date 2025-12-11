import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import {
  Cliente,
  PessoaFisica,
  PessoaJuridica,
} from '../../entities/cliente.entity';
import { Contrato } from '../../entities/contrato.entity';

@Injectable()
export class ClientsService {
  constructor(
    @InjectRepository(Cliente)
    private clienteRepository: Repository<Cliente>,
    @InjectRepository(PessoaFisica)
    private pessoaFisicaRepository: Repository<PessoaFisica>,
    @InjectRepository(PessoaJuridica)
    private pessoaJuridicaRepository: Repository<PessoaJuridica>,
    @InjectRepository(Contrato)
    private contratoRepository: Repository<Contrato>,
  ) {}

  async getProfile(clienteId: number) {
    const cliente = await this.clienteRepository.findOne({
      where: { Id: clienteId },
    });

    if (!cliente) {
      throw new NotFoundException('Cliente não encontrado');
    }

    let dadosPessoais: any = null;
    let tipoPessoa: 'PF' | 'PJ' = 'PF';

    if (cliente.PessoaFisicaId) {
      const pf = await this.pessoaFisicaRepository.findOne({
        where: { Id: cliente.PessoaFisicaId },
      });
      if (pf) {
        dadosPessoais = {
          nome: pf.Nome,
          documento: pf.CPF,
          email: pf.EmailEmpresarial,
          telefone: pf.Telefone1,
          celular: pf.Telefone2,
          dataNascimento: pf.DataNascimento,
        };
        tipoPessoa = 'PF';
      }
    } else if (cliente.PessoaJuridicaId) {
      const pj = await this.pessoaJuridicaRepository.findOne({
        where: { Id: cliente.PessoaJuridicaId },
      });
      if (pj) {
        dadosPessoais = {
          nome: pj.RazaoSocial,
          nomeFantasia: pj.NomeFantasia,
          documento: pj.CNPJ,
          email: pj.Email,
          telefone: pj.Telefone1,
        };
        tipoPessoa = 'PJ';
      }
    }

    // Buscar contratos do cliente
    const contratos = await this.contratoRepository.find({
      where: { ClienteId: clienteId, Ativo: true },
      order: { DataCadastro: 'DESC' },
    });

    return {
      id: cliente.Id,
      tipoPessoa,
      status: cliente.Status,
      dataCadastro: cliente.DataCadastro,
      ...dadosPessoais,
      contratos: contratos.map((c) => ({
        id: c.Id,
        situacao: c.Situacao,
        valorNegociado: c.ValorNegociado,
        numeroParcelas: c.NumeroParcelas,
        dataFechamento: c.DataFechamentoContrato,
      })),
    };
  }

  async getContracts(clienteId: number) {
    const contratos = await this.contratoRepository.find({
      where: { ClienteId: clienteId, Ativo: true },
      order: { DataCadastro: 'DESC' },
    });

    return contratos.map((c) => ({
      id: c.Id,
      situacao: c.Situacao,
      valorNegociado: c.ValorNegociado,
      valorEntrada: c.ValorEntrada,
      valorParcela: c.ValorParcela,
      numeroParcelas: c.NumeroParcelas,
      primeiroVencimento: c.PrimeiroVencimento,
      dataCadastro: c.DataCadastro,
      dataFechamento: c.DataFechamentoContrato,
      temAnexo: !!c.AnexoDocumento,
    }));
  }
}
