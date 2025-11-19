using System;
using System.Collections.Generic;

namespace CadastroPessoas.Models.Temp;

public partial class Consultore
{
    public int Id { get; set; }

    public int PessoaFisicaId { get; set; }

    public DateTime DataCadastro { get; set; }

    public DateTime? DataAtualizacao { get; set; }

    public bool Ativo { get; set; }

    public string? Oab { get; set; }

    public int FilialId { get; set; }

    public virtual ICollection<Contrato> Contratos { get; set; } = new List<Contrato>();

    public virtual Filiai Filial { get; set; } = null!;

    public virtual PessoasFisica PessoaFisica { get; set; } = null!;

    public virtual ICollection<Usuario> Usuarios { get; set; } = new List<Usuario>();
}
