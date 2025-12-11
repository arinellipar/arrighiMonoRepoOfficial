export declare class Boleto {
    Id: number;
    ContratoId: number;
    BankSlipId: string;
    CovenantCode: string;
    OurNumber: string;
    BarCode: string;
    DigitableLine: string;
    NominalValue: number;
    DueDate: Date;
    PayerName: string;
    PayerDocumentNumber: string;
    Status: string;
    DataCadastro: Date;
    DataPagamento: Date;
    PaidValue: number;
    NumeroParcela: number;
    Ativo: boolean;
    FoiPago: boolean;
    QRCodePix: string;
    QRCodeUrl: string;
}
