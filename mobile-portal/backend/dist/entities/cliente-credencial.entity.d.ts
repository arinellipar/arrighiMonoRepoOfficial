export declare class ClienteCredencial {
    Id: number;
    ClienteId: number;
    Email: string;
    SenhaHash: string;
    Ativo: boolean;
    EmailVerificado: boolean;
    TokenVerificacao: string;
    TokenExpiracao: Date;
    UltimoAcesso: Date;
    DispositivoToken: string;
    DataCriacao: Date;
    DataAtualizacao: Date;
}
