using System;
using System.Collections.Generic;

namespace CadastroPessoas.Models.Temp;

public partial class Boleto
{
    public int Id { get; set; }

    public int ContratoId { get; set; }

    public string NsuCode { get; set; } = null!;

    public DateTime NsuDate { get; set; }

    public string CovenantCode { get; set; } = null!;

    public string BankNumber { get; set; } = null!;

    public string? ClientNumber { get; set; }

    public DateTime DueDate { get; set; }

    public DateTime IssueDate { get; set; }

    public decimal NominalValue { get; set; }

    public string DocumentKind { get; set; } = null!;

    public string PayerName { get; set; } = null!;

    public string PayerDocumentType { get; set; } = null!;

    public string PayerDocumentNumber { get; set; } = null!;

    public string PayerAddress { get; set; } = null!;

    public string PayerNeighborhood { get; set; } = null!;

    public string PayerCity { get; set; } = null!;

    public string PayerState { get; set; } = null!;

    public string PayerZipCode { get; set; } = null!;

    public decimal? FinePercentage { get; set; }

    public int? FineQuantityDays { get; set; }

    public decimal? InterestPercentage { get; set; }

    public decimal? DeductionValue { get; set; }

    public int? WriteOffQuantityDays { get; set; }

    public string? BarCode { get; set; }

    public string? DigitableLine { get; set; }

    public DateTime? EntryDate { get; set; }

    public string? QrCodePix { get; set; }

    public string? QrCodeUrl { get; set; }

    public string Status { get; set; } = null!;

    public string? Messages { get; set; }

    public DateTime DataCadastro { get; set; }

    public DateTime? DataAtualizacao { get; set; }

    public bool Ativo { get; set; }

    public string? ErrorCode { get; set; }

    public string? ErrorMessage { get; set; }

    public string? TraceId { get; set; }

    public virtual Contrato Contrato { get; set; } = null!;
}
