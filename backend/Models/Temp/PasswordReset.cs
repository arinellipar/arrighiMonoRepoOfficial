using System;
using System.Collections.Generic;

namespace CadastroPessoas.Models.Temp;

public partial class PasswordReset
{
    public int Id { get; set; }

    public int UsuarioId { get; set; }

    public string Token { get; set; } = null!;

    public DateTime DataExpiracao { get; set; }

    public bool Utilizado { get; set; }

    public DateTime? DataUtilizacao { get; set; }

    public DateTime DataCriacao { get; set; }

    public virtual Usuario Usuario { get; set; } = null!;
}
