using System;
using System.Collections.Generic;

namespace CadastroPessoas.Models.Temp;

public partial class PermissoesGrupo
{
    public int Id { get; set; }

    public int GrupoAcessoId { get; set; }

    public int PermissaoId { get; set; }

    public bool ApenasProprios { get; set; }

    public bool ApenasFilial { get; set; }

    public bool ApenasLeitura { get; set; }

    public bool IncluirSituacoesEspecificas { get; set; }

    public string? SituacoesEspecificas { get; set; }

    public DateTime DataCadastro { get; set; }

    public virtual GruposAcesso GrupoAcesso { get; set; } = null!;

    public virtual Permisso Permissao { get; set; } = null!;
}
