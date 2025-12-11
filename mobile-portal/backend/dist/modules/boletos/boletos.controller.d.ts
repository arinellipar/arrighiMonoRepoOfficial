import { BoletosService } from './boletos.service';
export declare class BoletosController {
    private readonly boletosService;
    constructor(boletosService: BoletosService);
    getAll(req: any): Promise<{
        id: number;
        contratoId: number;
        codigoBarras: string;
        linhaDigitavel: string;
        valor: number;
        dataVencimento: Date;
        dataPagamento: Date;
        valorPago: number;
        status: string;
        statusDisplay: string;
        numeroParcela: number;
        diasParaVencer: number;
        vencido: boolean;
        qrCodePix: string;
        qrCodeUrl: string;
    }[]>;
    getResumo(req: any): Promise<{
        totalAberto: number;
        totalPago: number;
        totalVencido: number;
        quantidadeAbertos: number;
        quantidadePagos: number;
        quantidadeVencidos: number;
        proximoVencimento: {
            id: number;
            valor: number;
            dataVencimento: Date;
        } | null;
    }>;
    getAbertos(req: any): Promise<{
        id: number;
        contratoId: number;
        codigoBarras: string;
        linhaDigitavel: string;
        valor: number;
        dataVencimento: Date;
        dataPagamento: Date;
        valorPago: number;
        status: string;
        statusDisplay: string;
        numeroParcela: number;
        diasParaVencer: number;
        vencido: boolean;
        qrCodePix: string;
        qrCodeUrl: string;
    }[]>;
    getPagos(req: any): Promise<{
        id: number;
        contratoId: number;
        codigoBarras: string;
        linhaDigitavel: string;
        valor: number;
        dataVencimento: Date;
        dataPagamento: Date;
        valorPago: number;
        status: string;
        statusDisplay: string;
        numeroParcela: number;
        diasParaVencer: number;
        vencido: boolean;
        qrCodePix: string;
        qrCodeUrl: string;
    }[]>;
    getById(req: any, id: number): Promise<{
        id: number;
        contratoId: number;
        codigoBarras: string;
        linhaDigitavel: string;
        valor: number;
        dataVencimento: Date;
        dataPagamento: Date;
        valorPago: number;
        status: string;
        statusDisplay: string;
        numeroParcela: number;
        diasParaVencer: number;
        vencido: boolean;
        qrCodePix: string;
        qrCodeUrl: string;
    }>;
}
