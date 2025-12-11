import { Repository } from 'typeorm';
import { Cliente, PessoaFisica, PessoaJuridica } from '../../entities/cliente.entity';
import { Contrato } from '../../entities/contrato.entity';
export declare class ClientsService {
    private clienteRepository;
    private pessoaFisicaRepository;
    private pessoaJuridicaRepository;
    private contratoRepository;
    constructor(clienteRepository: Repository<Cliente>, pessoaFisicaRepository: Repository<PessoaFisica>, pessoaJuridicaRepository: Repository<PessoaJuridica>, contratoRepository: Repository<Contrato>);
    getProfile(clienteId: number): Promise<any>;
    getContracts(clienteId: number): Promise<{
        id: number;
        situacao: string;
        valorNegociado: number;
        valorEntrada: number;
        valorParcela: number;
        numeroParcelas: number;
        primeiroVencimento: Date;
        dataCadastro: Date;
        dataFechamento: Date;
        temAnexo: boolean;
    }[]>;
}
