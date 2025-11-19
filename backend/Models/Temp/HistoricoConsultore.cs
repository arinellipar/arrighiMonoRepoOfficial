using System;
using System.Collections.Generic;

namespace CadastroPessoas.Models.Temp;

public partial class HistoricoConsultore
{
    public int Id { get; set; }

    public int ClienteId { get; set; }

    public int ConsultorId { get; set; }

    public DateTime DataInicio { get; set; }

    public DateTime? DataFim { get; set; }

    public string? MotivoTransferencia { get; set; }

    public DateTime DataCadastro { get; set; }

    public virtual Cliente Cliente { get; set; } = null!;
}
