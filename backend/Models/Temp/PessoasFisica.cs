using System;
using System.Collections.Generic;

namespace CadastroPessoas.Models.Temp;

public partial class PessoasFisica
{
    public int Id { get; set; }

    public string Nome { get; set; } = null!;

    public string EmailEmpresarial { get; set; } = null!;

    public string? Codinome { get; set; }

    public string? Sexo { get; set; }

    public DateTime? DataNascimento { get; set; }

    public string? EstadoCivil { get; set; }

    public string Cpf { get; set; } = null!;

    public string? Rg { get; set; }

    public string? Cnh { get; set; }

    public string? Telefone1 { get; set; }

    public string? Telefone2 { get; set; }

    public int? EnderecoId { get; set; }

    public DateTime DataCadastro { get; set; }

    public DateTime? DataAtualizacao { get; set; }

    public string? EmailPessoal { get; set; }

    public virtual ICollection<Cliente> Clientes { get; set; } = new List<Cliente>();

    public virtual Consultore? Consultore { get; set; }

    public virtual Endereco? Endereco { get; set; }

    public virtual Parceiro? Parceiro { get; set; }

    public virtual ICollection<PessoasJuridica> PessoasJuridicas { get; set; } = new List<PessoasJuridica>();

    public virtual ICollection<Usuario> Usuarios { get; set; } = new List<Usuario>();
}
