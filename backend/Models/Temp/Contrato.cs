using System;
using System.Collections.Generic;

namespace CadastroPessoas.Models.Temp;

public partial class Contrato
{
    public int Id { get; set; }

    public int ClienteId { get; set; }

    public int ConsultorId { get; set; }

    public string Situacao { get; set; } = null!;

    public string? NumeroPasta { get; set; }

    public DateTime? DataFechamentoContrato { get; set; }

    public string? TipoServico { get; set; }

    public string? ObjetoContrato { get; set; }

    public decimal? Comissao { get; set; }

    public decimal? ValorEntrada { get; set; }

    public decimal? ValorParcela { get; set; }

    public int? NumeroParcelas { get; set; }

    public DateTime? PrimeiroVencimento { get; set; }

    public string? AnexoDocumento { get; set; }

    public string? Pendencias { get; set; }

    public DateTime DataUltimoContato { get; set; }

    public DateTime? DataProximoContato { get; set; }

    public decimal ValorDevido { get; set; }

    public decimal? ValorNegociado { get; set; }

    public string? Observacoes { get; set; }

    public DateTime DataCadastro { get; set; }

    public DateTime? DataAtualizacao { get; set; }

    public bool Ativo { get; set; }

    public int? ParceiroId { get; set; }

    public virtual ICollection<Boleto> Boletos { get; set; } = new List<Boleto>();

    public virtual Cliente Cliente { get; set; } = null!;

    public virtual Consultore Consultor { get; set; } = null!;

    public virtual ICollection<HistoricoSituacaoContrato> HistoricoSituacaoContratos { get; set; } = new List<HistoricoSituacaoContrato>();
}
