using System;
using System.Collections.Generic;

namespace CadastroPessoas.Models.Temp;

public partial class GruposAcesso
{
    public int Id { get; set; }

    public string Nome { get; set; } = null!;

    public string? Descricao { get; set; }

    public bool Ativo { get; set; }

    public DateTime DataCadastro { get; set; }

    public DateTime? DataAtualizacao { get; set; }

    public virtual ICollection<PermissoesGrupo> PermissoesGrupos { get; set; } = new List<PermissoesGrupo>();

    public virtual ICollection<Usuario> Usuarios { get; set; } = new List<Usuario>();
}
