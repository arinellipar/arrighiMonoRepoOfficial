using System;
using System.Collections.Generic;

namespace CadastroPessoas.Models.Temp;

public partial class Filiai
{
    public int Id { get; set; }

    public string Nome { get; set; } = null!;

    public DateTime DataInclusao { get; set; }

    public string? UsuarioImportacao { get; set; }

    public virtual ICollection<Cliente> Clientes { get; set; } = new List<Cliente>();

    public virtual ICollection<Consultore> Consultores { get; set; } = new List<Consultore>();

    public virtual ICollection<Parceiro> Parceiros { get; set; } = new List<Parceiro>();

    public virtual ICollection<Usuario> Usuarios { get; set; } = new List<Usuario>();
}
