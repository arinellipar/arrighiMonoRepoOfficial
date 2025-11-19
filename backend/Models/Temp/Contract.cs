using System;
using System.Collections.Generic;

namespace CadastroPessoas.Models.Temp;

public partial class Contract
{
    public int Id { get; set; }

    public string Contrato { get; set; } = null!;

    public string Contratante { get; set; } = null!;

    public string Contratada { get; set; } = null!;

    public string Objeto { get; set; } = null!;

    public DateTime DataContrato { get; set; }

    public int Prazo { get; set; }

    public int? Rescisao { get; set; }

    public decimal? Multa { get; set; }

    public int? AvisoPrevia { get; set; }

    public string? Observacoes { get; set; }

    public string CategoriaContrato { get; set; } = null!;

    public DateTime DataCriacao { get; set; }

    public DateTime? DataAtualizacao { get; set; }

    public string UserId { get; set; } = null!;

    public string? ArquivoPdfCaminho { get; set; }

    public string? ArquivoPdfNomeOriginal { get; set; }

    public long? ArquivoPdfTamanho { get; set; }

    public int Status { get; set; }

    public string? UsuarioCancelamento { get; set; }

    public string UsuarioCriador { get; set; } = null!;

    public string? UsuarioUltimaEdicao { get; set; }

    public DateTime DataFinal { get; set; }

    public int FormaPagamento { get; set; }

    public int? QuantidadeParcelas { get; set; }

    public string SetorResponsavel { get; set; } = null!;

    public int TipoPagamento { get; set; }

    public decimal ValorTotalContrato { get; set; }

    public int Filial { get; set; }

    public virtual AspNetUser User { get; set; } = null!;
}
