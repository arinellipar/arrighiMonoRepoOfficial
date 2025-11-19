using System.ComponentModel.DataAnnotations;

namespace CrmArrighi.Models
{
    public class CreateBoletoDTO
    {
        [Required(ErrorMessage = "O contrato é obrigatório")]
        public int ContratoId { get; set; }

        [Required(ErrorMessage = "A data de vencimento é obrigatória")]
        public DateTime DueDate { get; set; }

        [Required(ErrorMessage = "O valor nominal é obrigatório")]
        [Range(0.01, 999999999.99, ErrorMessage = "Valor nominal deve ser maior que zero")]
        public decimal NominalValue { get; set; }

        [StringLength(15, ErrorMessage = "Seu número deve ter no máximo 15 caracteres")]
        public string? ClientNumber { get; set; }

        // Campos opcionais para desconto, multa e juros
        [Range(0, 99.99, ErrorMessage = "Percentual de multa deve estar entre 0 e 99.99")]
        public decimal? FinePercentage { get; set; }

        [Range(1, 99, ErrorMessage = "Quantidade de dias da multa deve estar entre 1 e 99")]
        public int? FineQuantityDays { get; set; }

        [Range(0, 99.99, ErrorMessage = "Percentual de juros deve estar entre 0 e 99.99")]
        public decimal? InterestPercentage { get; set; }

        [Range(0, 999999999.99, ErrorMessage = "Valor de abatimento deve ser positivo")]
        public decimal? DeductionValue { get; set; }

        [Range(1, 99, ErrorMessage = "Dias para baixa deve estar entre 1 e 99")]
        public int? WriteOffQuantityDays { get; set; }

        // Mensagens personalizadas
        public List<string>? Messages { get; set; }

        // Dados PIX (opcionais)
        public string? PixKeyType { get; set; } // EMAIL, CPF, CNPJ, TELEFONE, CHAVE_ALEATORIA
        public string? PixKey { get; set; }
        public string? TxId { get; set; }

        // Dados de desconto (opcionais)
        public DescontoDTO? Discount { get; set; }
    }

    public class DescontoDTO
    {
        [Required(ErrorMessage = "Tipo de desconto é obrigatório")]
        public string Type { get; set; } = string.Empty; // VALOR_DATA_FIXA, PERCENTUAL_DATA_FIXA

        public DescontoValorDTO? DiscountOne { get; set; }
        public DescontoValorDTO? DiscountTwo { get; set; }
        public DescontoValorDTO? DiscountThree { get; set; }
    }

    public class DescontoValorDTO
    {
        [Required(ErrorMessage = "Valor do desconto é obrigatório")]
        [Range(0.01, 999999999.99, ErrorMessage = "Valor do desconto deve ser maior que zero")]
        public decimal Value { get; set; }

        [Required(ErrorMessage = "Data limite do desconto é obrigatória")]
        public DateTime LimitDate { get; set; }
    }
}
