using System;
using System.Collections.Generic;

namespace CadastroPessoas.Models.Temp;

public partial class PessoasJuridica
{
    public int Id { get; set; }

    public string RazaoSocial { get; set; } = null!;

    public string? NomeFantasia { get; set; }

    public string Cnpj { get; set; } = null!;

    public int ResponsavelTecnicoId { get; set; }

    public string Email { get; set; } = null!;

    public string Telefone1 { get; set; } = null!;

    public string? Telefone2 { get; set; }

    public int EnderecoId { get; set; }

    public DateTime DataCadastro { get; set; }

    public DateTime? DataAtualizacao { get; set; }

    public string? Telefone3 { get; set; }

    public string? Telefone4 { get; set; }

    public virtual ICollection<Cliente> Clientes { get; set; } = new List<Cliente>();

    public virtual Endereco Endereco { get; set; } = null!;

    public virtual PessoasFisica ResponsavelTecnico { get; set; } = null!;

    public virtual ICollection<Usuario> Usuarios { get; set; } = new List<Usuario>();
}
