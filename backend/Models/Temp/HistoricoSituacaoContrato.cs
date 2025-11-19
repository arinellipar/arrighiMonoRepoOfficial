using System;
using System.Collections.Generic;

namespace CadastroPessoas.Models.Temp;

public partial class HistoricoSituacaoContrato
{
    public int Id { get; set; }

    public int ContratoId { get; set; }

    public string SituacaoAnterior { get; set; } = null!;

    public string NovaSituacao { get; set; } = null!;

    public string MotivoMudanca { get; set; } = null!;

    public DateTime DataMudanca { get; set; }

    public DateTime DataCadastro { get; set; }

    public virtual Contrato Contrato { get; set; } = null!;
}
