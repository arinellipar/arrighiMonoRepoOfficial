export declare class Contrato {
    Id: number;
    ClienteId: number;
    ConsultorId: number;
    ParceiroId: number;
    Situacao: string;
    ValorDevido: number;
    ValorNegociado: number;
    ValorEntrada: number;
    ValorParcela: number;
    NumeroParcelas: number;
    PrimeiroVencimento: Date;
    DataCadastro: Date;
    DataFechamentoContrato: Date;
    Observacoes: string;
    AnexoDocumento: string;
    Ativo: boolean;
    Comissao: number;
    NumeroPasta: string;
    TipoServico: string;
    ObjetoContrato: string;
    Pendencias: string;
    DataUltimoContato: Date;
    DataProximoContato: Date;
    DataAtualizacao: Date;
}
