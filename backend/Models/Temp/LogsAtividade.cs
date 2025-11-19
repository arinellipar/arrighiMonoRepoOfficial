using System;
using System.Collections.Generic;

namespace CadastroPessoas.Models.Temp;

public partial class LogsAtividade
{
    public int Id { get; set; }

    public int UsuarioId { get; set; }

    public string UsuarioNome { get; set; } = null!;

    public string Acao { get; set; } = null!;

    public string Tipo { get; set; } = null!;

    public string? Detalhes { get; set; }

    public string? ModuloOrigem { get; set; }

    public DateTime DataHora { get; set; }

    public bool Ativo { get; set; }

    public virtual Usuario Usuario { get; set; } = null!;
}
