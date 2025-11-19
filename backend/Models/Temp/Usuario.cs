using System;
using System.Collections.Generic;

namespace CadastroPessoas.Models.Temp;

public partial class Usuario
{
    public int Id { get; set; }

    public string Login { get; set; } = null!;

    public string Email { get; set; } = null!;

    public string Senha { get; set; } = null!;

    public string TipoPessoa { get; set; } = null!;

    public int? PessoaFisicaId { get; set; }

    public int? PessoaJuridicaId { get; set; }

    public bool Ativo { get; set; }

    public DateTime DataCadastro { get; set; }

    public DateTime? DataAtualizacao { get; set; }

    public DateTime? UltimoAcesso { get; set; }

    public int? GrupoAcessoId { get; set; }

    public int? FilialId { get; set; }

    public int? ConsultorId { get; set; }

    public virtual Consultore? Consultor { get; set; }

    public virtual Filiai? Filial { get; set; }

    public virtual GruposAcesso? GrupoAcesso { get; set; }

    public virtual ICollection<HistoricoCliente> HistoricoClientes { get; set; } = new List<HistoricoCliente>();

    public virtual ICollection<LogsAtividade> LogsAtividades { get; set; } = new List<LogsAtividade>();

    public virtual ICollection<PasswordReset> PasswordResets { get; set; } = new List<PasswordReset>();

    public virtual PessoasFisica? PessoaFisica { get; set; }

    public virtual PessoasJuridica? PessoaJuridica { get; set; }

    public virtual ICollection<SessoesAtiva> SessoesAtivas { get; set; } = new List<SessoesAtiva>();
}
