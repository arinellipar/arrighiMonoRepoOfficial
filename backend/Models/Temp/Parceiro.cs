using System;
using System.Collections.Generic;

namespace CadastroPessoas.Models.Temp;

public partial class Parceiro
{
    public int Id { get; set; }

    public int PessoaFisicaId { get; set; }

    public int FilialId { get; set; }

    public string? Oab { get; set; }

    public DateTime DataCadastro { get; set; }

    public DateTime? DataAtualizacao { get; set; }

    public bool Ativo { get; set; }

    public string? Email { get; set; }

    public string? Telefone { get; set; }

    public virtual Filiai Filial { get; set; } = null!;

    public virtual PessoasFisica PessoaFisica { get; set; } = null!;
}
