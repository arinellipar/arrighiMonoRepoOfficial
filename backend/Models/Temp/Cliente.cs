using System;
using System.Collections.Generic;

namespace CadastroPessoas.Models.Temp;

public partial class Cliente
{
    public int Id { get; set; }

    public string TipoPessoa { get; set; } = null!;

    public int? PessoaFisicaId { get; set; }

    public int? PessoaJuridicaId { get; set; }

    public int? ConsultorAtualId { get; set; }

    public string? Observacoes { get; set; }

    public DateTime DataCadastro { get; set; }

    public DateTime? DataAtualizacao { get; set; }

    public bool Ativo { get; set; }

    public string? Status { get; set; }

    public decimal ValorContrato { get; set; }

    public int? FilialId { get; set; }

    public virtual ICollection<Contrato> Contratos { get; set; } = new List<Contrato>();

    public virtual Filiai? Filial { get; set; }

    public virtual ICollection<HistoricoCliente> HistoricoClientes { get; set; } = new List<HistoricoCliente>();

    public virtual ICollection<HistoricoConsultore> HistoricoConsultores { get; set; } = new List<HistoricoConsultore>();

    public virtual PessoasFisica? PessoaFisica { get; set; }

    public virtual PessoasJuridica? PessoaJuridica { get; set; }
}
