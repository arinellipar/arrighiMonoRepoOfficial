using System;
using System.Collections.Generic;

namespace CadastroPessoas.Models.Temp;

public partial class SessoesAtiva
{
    public int Id { get; set; }

    public int UsuarioId { get; set; }

    public string NomeUsuario { get; set; } = null!;

    public string Email { get; set; } = null!;

    public string Perfil { get; set; } = null!;

    public DateTime InicioSessao { get; set; }

    public DateTime UltimaAtividade { get; set; }

    public string EnderecoIp { get; set; } = null!;

    public string UserAgent { get; set; } = null!;

    public string TokenSessao { get; set; } = null!;

    public bool Ativa { get; set; }

    public string PaginaAtual { get; set; } = null!;

    public DateTime? DataHoraOffline { get; set; }

    public virtual Usuario Usuario { get; set; } = null!;
}
