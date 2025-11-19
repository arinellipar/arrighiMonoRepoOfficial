using System;
using System.Collections.Generic;

namespace CadastroPessoas.Models.Temp;

public partial class Endereco
{
    public int Id { get; set; }

    public string Cidade { get; set; } = null!;

    public string Bairro { get; set; } = null!;

    public string Logradouro { get; set; } = null!;

    public string Cep { get; set; } = null!;

    public string Numero { get; set; } = null!;

    public string? Complemento { get; set; }

    public string? Estado { get; set; }

    public virtual ICollection<PessoasFisica> PessoasFisicas { get; set; } = new List<PessoasFisica>();

    public virtual ICollection<PessoasJuridica> PessoasJuridicas { get; set; } = new List<PessoasJuridica>();
}
