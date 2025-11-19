using System;
using System.Collections.Generic;

namespace CadastroPessoas.Models.Temp;

public partial class HistoricoCliente
{
    public int Id { get; set; }

    public int ClienteId { get; set; }

    public string TipoAcao { get; set; } = null!;

    public string Descricao { get; set; } = null!;

    public string? DadosAnteriores { get; set; }

    public string? DadosNovos { get; set; }

    public int UsuarioId { get; set; }

    public string? NomeUsuario { get; set; }

    public DateTime DataHora { get; set; }

    public string? EnderecoIp { get; set; }

    public virtual Cliente Cliente { get; set; } = null!;

    public virtual Usuario Usuario { get; set; } = null!;
}
