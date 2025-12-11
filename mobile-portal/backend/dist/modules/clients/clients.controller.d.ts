import { ClientsService } from './clients.service';
export declare class ClientsController {
    private readonly clientsService;
    constructor(clientsService: ClientsService);
    getProfile(req: any): Promise<any>;
    getContracts(req: any): Promise<{
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
