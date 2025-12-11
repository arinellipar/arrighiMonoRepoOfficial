export declare class Cliente {
    Id: number;
    PessoaFisicaId: number;
    PessoaJuridicaId: number;
    Status: string;
    DataCadastro: Date;
    Observacoes: string;
}
export declare class PessoaFisica {
    Id: number;
    Nome: string;
    CPF: string;
    EmailEmpresarial: string;
    EmailPessoal: string;
    Telefone1: string;
    Telefone2: string;
    DataNascimento: Date;
}
export declare class PessoaJuridica {
    Id: number;
    RazaoSocial: string;
    NomeFantasia: string;
    CNPJ: string;
    Email: string;
    Telefone1: string;
    Telefone2: string;
}
