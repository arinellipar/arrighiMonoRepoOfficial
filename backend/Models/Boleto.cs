using System.ComponentModel.DataAnnotations;

namespace CrmArrighi.Models
{
    public class Boleto
    {
        public int Id { get; set; }

        [Required(ErrorMessage = "O contrato é obrigatório")]
        public int ContratoId { get; set; }
        public Contrato Contrato { get; set; } = null!;

        [Required(ErrorMessage = "O NSU Code é obrigatório")]
        [StringLength(20, ErrorMessage = "NSU Code deve ter no máximo 20 caracteres")]
        public string NsuCode { get; set; } = string.Empty;

        [Required(ErrorMessage = "A data NSU é obrigatória")]
        public DateTime NsuDate { get; set; }

        [Required(ErrorMessage = "O código do convênio é obrigatório")]
        [StringLength(9, ErrorMessage = "Código do convênio deve ter no máximo 9 caracteres")]
        public string CovenantCode { get; set; } = string.Empty;

        [Required(ErrorMessage = "O nosso número é obrigatório")]
        [StringLength(13, ErrorMessage = "Nosso número deve ter no máximo 13 caracteres")]
        public string BankNumber { get; set; } = string.Empty;

        [StringLength(15, ErrorMessage = "Seu número deve ter no máximo 15 caracteres")]
        public string? ClientNumber { get; set; }

        [Required(ErrorMessage = "A data de vencimento é obrigatória")]
        public DateTime DueDate { get; set; }

        [Required(ErrorMessage = "A data de emissão é obrigatória")]
        public DateTime IssueDate { get; set; }

        [Required(ErrorMessage = "O valor nominal é obrigatório")]
        [Range(0.01, 999999999.99, ErrorMessage = "Valor nominal deve ser maior que zero")]
        public decimal NominalValue { get; set; }

        [Required(ErrorMessage = "O tipo de documento é obrigatório")]
        [StringLength(50, ErrorMessage = "Tipo de documento deve ter no máximo 50 caracteres")]
        public string DocumentKind { get; set; } = string.Empty;

        // Dados do Pagador
        [Required(ErrorMessage = "O nome do pagador é obrigatório")]
        [StringLength(40, ErrorMessage = "Nome do pagador deve ter no máximo 40 caracteres")]
        public string PayerName { get; set; } = string.Empty;

        [Required(ErrorMessage = "O tipo de documento do pagador é obrigatório")]
        [StringLength(4, ErrorMessage = "Tipo de documento deve ser CPF ou CNPJ")]
        public string PayerDocumentType { get; set; } = string.Empty;

        [Required(ErrorMessage = "O número do documento do pagador é obrigatório")]
        [StringLength(15, ErrorMessage = "Número do documento deve ter no máximo 15 caracteres")]
        public string PayerDocumentNumber { get; set; } = string.Empty;

        [Required(ErrorMessage = "O endereço do pagador é obrigatório")]
        [StringLength(40, ErrorMessage = "Endereço deve ter no máximo 40 caracteres")]
        public string PayerAddress { get; set; } = string.Empty;

        [Required(ErrorMessage = "O bairro do pagador é obrigatório")]
        [StringLength(30, ErrorMessage = "Bairro deve ter no máximo 30 caracteres")]
        public string PayerNeighborhood { get; set; } = string.Empty;

        [Required(ErrorMessage = "A cidade do pagador é obrigatória")]
        [StringLength(20, ErrorMessage = "Cidade deve ter no máximo 20 caracteres")]
        public string PayerCity { get; set; } = string.Empty;

        [Required(ErrorMessage = "O estado do pagador é obrigatório")]
        [StringLength(2, ErrorMessage = "Estado deve ter 2 caracteres")]
        public string PayerState { get; set; } = string.Empty;

        [Required(ErrorMessage = "O CEP do pagador é obrigatório")]
        [StringLength(9, ErrorMessage = "CEP deve ter formato 00000-000")]
        public string PayerZipCode { get; set; } = string.Empty;

        // Campos opcionais para desconto, multa e juros
        public decimal? FinePercentage { get; set; }
        public int? FineQuantityDays { get; set; }
        public decimal? InterestPercentage { get; set; }
        public decimal? DeductionValue { get; set; }
        public int? WriteOffQuantityDays { get; set; }

        // Campos de resposta da API Santander
        [StringLength(100, ErrorMessage = "Código de barras deve ter no máximo 100 caracteres")]
        public string? BarCode { get; set; }

        [StringLength(100, ErrorMessage = "Linha digitável deve ter no máximo 100 caracteres")]
        public string? DigitableLine { get; set; }

        public DateTime? EntryDate { get; set; }

        [StringLength(500, ErrorMessage = "QR Code PIX deve ter no máximo 500 caracteres")]
        public string? QrCodePix { get; set; }

        [StringLength(500, ErrorMessage = "URL QR Code deve ter no máximo 500 caracteres")]
        public string? QrCodeUrl { get; set; }

        // Status do boleto
        [Required(ErrorMessage = "O status é obrigatório")]
        [StringLength(20, ErrorMessage = "Status deve ter no máximo 20 caracteres")]
        public string Status { get; set; } = "PENDENTE"; // PENDENTE, REGISTRADO, LIQUIDADO, VENCIDO, CANCELADO

        // Mensagens do boleto (JSON)
        [StringLength(1000, ErrorMessage = "Mensagens devem ter no máximo 1000 caracteres")]
        public string? Messages { get; set; }

        // Campos de controle
        public DateTime DataCadastro { get; set; } = DateTime.Now;
        public DateTime? DataAtualizacao { get; set; }
        public bool Ativo { get; set; } = true;

        // Campos para rastreamento de erros
        [StringLength(10, ErrorMessage = "Código de erro deve ter no máximo 10 caracteres")]
        public string? ErrorCode { get; set; }

        [StringLength(500, ErrorMessage = "Mensagem de erro deve ter no máximo 500 caracteres")]
        public string? ErrorMessage { get; set; }

        [StringLength(50, ErrorMessage = "Trace ID deve ter no máximo 50 caracteres")]
        public string? TraceId { get; set; }
    }
}
