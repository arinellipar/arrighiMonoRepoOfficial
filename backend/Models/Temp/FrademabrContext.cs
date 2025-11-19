using System;
using System.Collections.Generic;
using Microsoft.EntityFrameworkCore;

namespace CadastroPessoas.Models.Temp;

public partial class FrademabrContext : DbContext
{
    public FrademabrContext()
    {
    }

    public FrademabrContext(DbContextOptions<FrademabrContext> options)
        : base(options)
    {
    }

    public virtual DbSet<AspNetRole> AspNetRoles { get; set; }

    public virtual DbSet<AspNetRoleClaim> AspNetRoleClaims { get; set; }

    public virtual DbSet<AspNetUser> AspNetUsers { get; set; }

    public virtual DbSet<AspNetUserClaim> AspNetUserClaims { get; set; }

    public virtual DbSet<AspNetUserLogin> AspNetUserLogins { get; set; }

    public virtual DbSet<AspNetUserToken> AspNetUserTokens { get; set; }

    public virtual DbSet<Boleto> Boletos { get; set; }

    public virtual DbSet<Cliente> Clientes { get; set; }

    public virtual DbSet<Consultore> Consultores { get; set; }

    public virtual DbSet<Contract> Contracts { get; set; }

    public virtual DbSet<Contrato> Contratos { get; set; }

    public virtual DbSet<Endereco> Enderecos { get; set; }

    public virtual DbSet<Filiai> Filiais { get; set; }

    public virtual DbSet<GruposAcesso> GruposAcessos { get; set; }

    public virtual DbSet<HistoricoCliente> HistoricoClientes { get; set; }

    public virtual DbSet<HistoricoConsultore> HistoricoConsultores { get; set; }

    public virtual DbSet<HistoricoSituacaoContrato> HistoricoSituacaoContratos { get; set; }

    public virtual DbSet<LogsAtividade> LogsAtividades { get; set; }

    public virtual DbSet<MapeamentoFiliai> MapeamentoFiliais { get; set; }

    public virtual DbSet<Parceiro> Parceiros { get; set; }

    public virtual DbSet<PasswordReset> PasswordResets { get; set; }

    public virtual DbSet<Permisso> Permissoes { get; set; }

    public virtual DbSet<PermissoesGrupo> PermissoesGrupos { get; set; }

    public virtual DbSet<PessoasFisica> PessoasFisicas { get; set; }

    public virtual DbSet<PessoasJuridica> PessoasJuridicas { get; set; }

    public virtual DbSet<SessoesAtiva> SessoesAtivas { get; set; }

    public virtual DbSet<Usuario> Usuarios { get; set; }

    protected override void OnConfiguring(DbContextOptionsBuilder optionsBuilder)
        => optionsBuilder.UseSqlServer("Name=ConnectionStrings:DefaultConnection");

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.Entity<AspNetRole>(entity =>
        {
            entity.HasIndex(e => e.NormalizedName, "RoleNameIndex")
                .IsUnique()
                .HasFilter("([NormalizedName] IS NOT NULL)");

            entity.Property(e => e.Name).HasMaxLength(256);
            entity.Property(e => e.NormalizedName).HasMaxLength(256);
        });

        modelBuilder.Entity<AspNetRoleClaim>(entity =>
        {
            entity.HasIndex(e => e.RoleId, "IX_AspNetRoleClaims_RoleId");

            entity.HasOne(d => d.Role).WithMany(p => p.AspNetRoleClaims).HasForeignKey(d => d.RoleId);
        });

        modelBuilder.Entity<AspNetUser>(entity =>
        {
            entity.HasIndex(e => e.NormalizedEmail, "EmailIndex");

            entity.HasIndex(e => e.NormalizedUserName, "UserNameIndex")
                .IsUnique()
                .HasFilter("([NormalizedUserName] IS NOT NULL)");

            entity.Property(e => e.Email).HasMaxLength(256);
            entity.Property(e => e.NomeCompleto).HasMaxLength(100);
            entity.Property(e => e.NormalizedEmail).HasMaxLength(256);
            entity.Property(e => e.NormalizedUserName).HasMaxLength(256);
            entity.Property(e => e.UserName).HasMaxLength(256);

            entity.HasMany(d => d.Roles).WithMany(p => p.Users)
                .UsingEntity<Dictionary<string, object>>(
                    "AspNetUserRole",
                    r => r.HasOne<AspNetRole>().WithMany().HasForeignKey("RoleId"),
                    l => l.HasOne<AspNetUser>().WithMany().HasForeignKey("UserId"),
                    j =>
                    {
                        j.HasKey("UserId", "RoleId");
                        j.ToTable("AspNetUserRoles");
                        j.HasIndex(new[] { "RoleId" }, "IX_AspNetUserRoles_RoleId");
                    });
        });

        modelBuilder.Entity<AspNetUserClaim>(entity =>
        {
            entity.HasIndex(e => e.UserId, "IX_AspNetUserClaims_UserId");

            entity.HasOne(d => d.User).WithMany(p => p.AspNetUserClaims).HasForeignKey(d => d.UserId);
        });

        modelBuilder.Entity<AspNetUserLogin>(entity =>
        {
            entity.HasKey(e => new { e.LoginProvider, e.ProviderKey });

            entity.HasIndex(e => e.UserId, "IX_AspNetUserLogins_UserId");

            entity.HasOne(d => d.User).WithMany(p => p.AspNetUserLogins).HasForeignKey(d => d.UserId);
        });

        modelBuilder.Entity<AspNetUserToken>(entity =>
        {
            entity.HasKey(e => new { e.UserId, e.LoginProvider, e.Name });

            entity.HasOne(d => d.User).WithMany(p => p.AspNetUserTokens).HasForeignKey(d => d.UserId);
        });

        modelBuilder.Entity<Boleto>(entity =>
        {
            entity.HasIndex(e => e.ContratoId, "IX_Boletos_ContratoId");

            entity.HasIndex(e => new { e.NsuCode, e.NsuDate }, "IX_Boletos_NsuCode_NsuDate").IsUnique();

            entity.Property(e => e.BankNumber).HasMaxLength(13);
            entity.Property(e => e.BarCode).HasMaxLength(100);
            entity.Property(e => e.ClientNumber).HasMaxLength(15);
            entity.Property(e => e.CovenantCode).HasMaxLength(9);
            entity.Property(e => e.DeductionValue).HasColumnType("decimal(18, 2)");
            entity.Property(e => e.DigitableLine).HasMaxLength(100);
            entity.Property(e => e.DocumentKind).HasMaxLength(50);
            entity.Property(e => e.ErrorCode).HasMaxLength(10);
            entity.Property(e => e.ErrorMessage).HasMaxLength(500);
            entity.Property(e => e.FinePercentage).HasColumnType("decimal(5, 2)");
            entity.Property(e => e.InterestPercentage).HasColumnType("decimal(5, 2)");
            entity.Property(e => e.Messages).HasMaxLength(1000);
            entity.Property(e => e.NominalValue).HasColumnType("decimal(18, 2)");
            entity.Property(e => e.NsuCode).HasMaxLength(20);
            entity.Property(e => e.PayerAddress).HasMaxLength(40);
            entity.Property(e => e.PayerCity).HasMaxLength(20);
            entity.Property(e => e.PayerDocumentNumber).HasMaxLength(15);
            entity.Property(e => e.PayerDocumentType).HasMaxLength(4);
            entity.Property(e => e.PayerName).HasMaxLength(40);
            entity.Property(e => e.PayerNeighborhood).HasMaxLength(30);
            entity.Property(e => e.PayerState).HasMaxLength(2);
            entity.Property(e => e.PayerZipCode).HasMaxLength(9);
            entity.Property(e => e.QrCodePix).HasMaxLength(500);
            entity.Property(e => e.QrCodeUrl).HasMaxLength(500);
            entity.Property(e => e.Status).HasMaxLength(20);
            entity.Property(e => e.TraceId).HasMaxLength(50);

            entity.HasOne(d => d.Contrato).WithMany(p => p.Boletos)
                .HasForeignKey(d => d.ContratoId)
                .OnDelete(DeleteBehavior.ClientSetNull);
        });

        modelBuilder.Entity<Cliente>(entity =>
        {
            entity.HasIndex(e => e.FilialId, "IX_Clientes_FilialId");

            entity.HasIndex(e => e.PessoaFisicaId, "IX_Clientes_PessoaFisicaId");

            entity.HasIndex(e => e.PessoaJuridicaId, "IX_Clientes_PessoaJuridicaId");

            entity.Property(e => e.Observacoes).HasMaxLength(1000);
            entity.Property(e => e.Status).HasMaxLength(100);
            entity.Property(e => e.ValorContrato).HasColumnType("decimal(18, 2)");

            entity.HasOne(d => d.Filial).WithMany(p => p.Clientes).HasForeignKey(d => d.FilialId);

            entity.HasOne(d => d.PessoaFisica).WithMany(p => p.Clientes).HasForeignKey(d => d.PessoaFisicaId);

            entity.HasOne(d => d.PessoaJuridica).WithMany(p => p.Clientes).HasForeignKey(d => d.PessoaJuridicaId);
        });

        modelBuilder.Entity<Consultore>(entity =>
        {
            entity.HasIndex(e => e.PessoaFisicaId, "IX_Consultores_PessoaFisicaId").IsUnique();

            entity.Property(e => e.Oab)
                .HasMaxLength(20)
                .HasColumnName("OAB");

            entity.HasOne(d => d.Filial).WithMany(p => p.Consultores)
                .HasForeignKey(d => d.FilialId)
                .OnDelete(DeleteBehavior.ClientSetNull);

            entity.HasOne(d => d.PessoaFisica).WithOne(p => p.Consultore)
                .HasForeignKey<Consultore>(d => d.PessoaFisicaId)
                .OnDelete(DeleteBehavior.ClientSetNull);
        });

        modelBuilder.Entity<Contract>(entity =>
        {
            entity.HasIndex(e => e.CategoriaContrato, "IX_Contracts_CategoriaContrato");

            entity.HasIndex(e => e.Contratante, "IX_Contracts_Contratante");

            entity.HasIndex(e => e.DataContrato, "IX_Contracts_DataContrato");

            entity.HasIndex(e => e.Filial, "IX_Contracts_Filial");

            entity.HasIndex(e => e.UserId, "IX_Contracts_UserId");

            entity.Property(e => e.ArquivoPdfCaminho).HasMaxLength(500);
            entity.Property(e => e.ArquivoPdfNomeOriginal).HasMaxLength(255);
            entity.Property(e => e.CategoriaContrato).HasMaxLength(50);
            entity.Property(e => e.Contratada).HasMaxLength(500);
            entity.Property(e => e.Contratante).HasMaxLength(500);
            entity.Property(e => e.Contrato).HasMaxLength(2000);
            entity.Property(e => e.Filial).HasDefaultValue(1);
            entity.Property(e => e.Multa).HasColumnType("decimal(18, 2)");
            entity.Property(e => e.Objeto).HasMaxLength(1000);
            entity.Property(e => e.Observacoes).HasMaxLength(4000);
            entity.Property(e => e.SetorResponsavel)
                .HasMaxLength(200)
                .HasDefaultValue("");
            entity.Property(e => e.UsuarioCriador).HasDefaultValue("");
            entity.Property(e => e.ValorTotalContrato).HasColumnType("decimal(18, 2)");

            entity.HasOne(d => d.User).WithMany(p => p.Contracts).HasForeignKey(d => d.UserId);
        });

        modelBuilder.Entity<Contrato>(entity =>
        {
            entity.HasIndex(e => e.ClienteId, "IX_Contratos_ClienteId");

            entity.HasIndex(e => e.ConsultorId, "IX_Contratos_ConsultorId");

            entity.Property(e => e.AnexoDocumento).HasMaxLength(500);
            entity.Property(e => e.Comissao).HasColumnType("decimal(5, 2)");
            entity.Property(e => e.NumeroPasta).HasMaxLength(50);
            entity.Property(e => e.ObjetoContrato).HasMaxLength(1000);
            entity.Property(e => e.Observacoes).HasMaxLength(1000);
            entity.Property(e => e.Pendencias).HasMaxLength(1000);
            entity.Property(e => e.Situacao).HasMaxLength(50);
            entity.Property(e => e.TipoServico).HasMaxLength(100);
            entity.Property(e => e.ValorDevido).HasColumnType("decimal(18, 2)");
            entity.Property(e => e.ValorEntrada).HasColumnType("decimal(18, 2)");
            entity.Property(e => e.ValorNegociado).HasColumnType("decimal(18, 2)");
            entity.Property(e => e.ValorParcela).HasColumnType("decimal(18, 2)");

            entity.HasOne(d => d.Cliente).WithMany(p => p.Contratos)
                .HasForeignKey(d => d.ClienteId)
                .OnDelete(DeleteBehavior.ClientSetNull);

            entity.HasOne(d => d.Consultor).WithMany(p => p.Contratos)
                .HasForeignKey(d => d.ConsultorId)
                .OnDelete(DeleteBehavior.ClientSetNull);
        });

        modelBuilder.Entity<Endereco>(entity =>
        {
            entity.Property(e => e.Bairro).HasMaxLength(100);
            entity.Property(e => e.Cep).HasMaxLength(9);
            entity.Property(e => e.Cidade).HasMaxLength(100);
            entity.Property(e => e.Complemento).HasMaxLength(100);
            entity.Property(e => e.Estado).HasMaxLength(2);
            entity.Property(e => e.Logradouro).HasMaxLength(200);
            entity.Property(e => e.Numero).HasMaxLength(10);
        });

        modelBuilder.Entity<Filiai>(entity =>
        {
            entity.HasIndex(e => e.Nome, "IX_Filiais_Nome").IsUnique();

            entity.Property(e => e.Nome).HasMaxLength(100);
            entity.Property(e => e.UsuarioImportacao).HasMaxLength(100);
        });

        modelBuilder.Entity<GruposAcesso>(entity =>
        {
            entity.ToTable("GruposAcesso");

            entity.HasIndex(e => e.Nome, "IX_GruposAcesso_Nome").IsUnique();

            entity.Property(e => e.Ativo).HasDefaultValue(true);
            entity.Property(e => e.DataCadastro).HasDefaultValueSql("(getdate())");
            entity.Property(e => e.Descricao).HasMaxLength(500);
            entity.Property(e => e.Nome).HasMaxLength(100);
        });

        modelBuilder.Entity<HistoricoCliente>(entity =>
        {
            entity.HasIndex(e => e.ClienteId, "IX_HistoricoClientes_ClienteId");

            entity.HasIndex(e => e.DataHora, "IX_HistoricoClientes_DataHora").IsDescending();

            entity.HasIndex(e => e.TipoAcao, "IX_HistoricoClientes_TipoAcao");

            entity.HasIndex(e => e.UsuarioId, "IX_HistoricoClientes_UsuarioId");

            entity.Property(e => e.DadosAnteriores).HasMaxLength(2000);
            entity.Property(e => e.DadosNovos).HasMaxLength(2000);
            entity.Property(e => e.DataHora).HasDefaultValueSql("(getdate())");
            entity.Property(e => e.Descricao).HasMaxLength(500);
            entity.Property(e => e.EnderecoIp)
                .HasMaxLength(100)
                .HasColumnName("EnderecoIP");
            entity.Property(e => e.NomeUsuario).HasMaxLength(200);
            entity.Property(e => e.TipoAcao).HasMaxLength(50);

            entity.HasOne(d => d.Cliente).WithMany(p => p.HistoricoClientes).HasForeignKey(d => d.ClienteId);

            entity.HasOne(d => d.Usuario).WithMany(p => p.HistoricoClientes)
                .HasForeignKey(d => d.UsuarioId)
                .OnDelete(DeleteBehavior.ClientSetNull);
        });

        modelBuilder.Entity<HistoricoConsultore>(entity =>
        {
            entity.HasIndex(e => e.ClienteId, "IX_HistoricoConsultores_ClienteId");

            entity.Property(e => e.MotivoTransferencia).HasMaxLength(500);

            entity.HasOne(d => d.Cliente).WithMany(p => p.HistoricoConsultores).HasForeignKey(d => d.ClienteId);
        });

        modelBuilder.Entity<HistoricoSituacaoContrato>(entity =>
        {
            entity.HasIndex(e => e.ContratoId, "IX_HistoricoSituacaoContratos_ContratoId");

            entity.Property(e => e.MotivoMudanca).HasMaxLength(500);
            entity.Property(e => e.NovaSituacao).HasMaxLength(50);
            entity.Property(e => e.SituacaoAnterior).HasMaxLength(50);

            entity.HasOne(d => d.Contrato).WithMany(p => p.HistoricoSituacaoContratos).HasForeignKey(d => d.ContratoId);
        });

        modelBuilder.Entity<LogsAtividade>(entity =>
        {
            entity.HasIndex(e => e.Ativo, "IX_LogsAtividades_Ativo");

            entity.HasIndex(e => e.DataHora, "IX_LogsAtividades_DataHora").IsDescending();

            entity.HasIndex(e => e.UsuarioId, "IX_LogsAtividades_UsuarioId");

            entity.Property(e => e.Acao).HasMaxLength(500);
            entity.Property(e => e.Ativo).HasDefaultValue(true);
            entity.Property(e => e.DataHora).HasDefaultValueSql("(getdate())");
            entity.Property(e => e.Detalhes).HasMaxLength(1000);
            entity.Property(e => e.ModuloOrigem).HasMaxLength(100);
            entity.Property(e => e.Tipo)
                .HasMaxLength(50)
                .HasDefaultValue("info");
            entity.Property(e => e.UsuarioNome).HasMaxLength(200);

            entity.HasOne(d => d.Usuario).WithMany(p => p.LogsAtividades)
                .HasForeignKey(d => d.UsuarioId)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK_LogsAtividades_Usuarios");
        });

        modelBuilder.Entity<MapeamentoFiliai>(entity =>
        {
            entity.HasNoKey();

            entity.Property(e => e.CpfCnpj)
                .HasMaxLength(20)
                .IsUnicode(false);
        });

        modelBuilder.Entity<Parceiro>(entity =>
        {
            entity.HasIndex(e => e.FilialId, "IX_Parceiros_FilialId");

            entity.HasIndex(e => e.PessoaFisicaId, "IX_Parceiros_PessoaFisicaId").IsUnique();

            entity.Property(e => e.Email).HasMaxLength(100);
            entity.Property(e => e.Oab)
                .HasMaxLength(20)
                .HasColumnName("OAB");
            entity.Property(e => e.Telefone).HasMaxLength(20);

            entity.HasOne(d => d.Filial).WithMany(p => p.Parceiros)
                .HasForeignKey(d => d.FilialId)
                .OnDelete(DeleteBehavior.ClientSetNull);

            entity.HasOne(d => d.PessoaFisica).WithOne(p => p.Parceiro)
                .HasForeignKey<Parceiro>(d => d.PessoaFisicaId)
                .OnDelete(DeleteBehavior.ClientSetNull);
        });

        modelBuilder.Entity<PasswordReset>(entity =>
        {
            entity.HasIndex(e => e.Token, "IX_PasswordResets_Token").IsUnique();

            entity.HasIndex(e => e.UsuarioId, "IX_PasswordResets_UsuarioId");

            entity.Property(e => e.Token).HasMaxLength(256);

            entity.HasOne(d => d.Usuario).WithMany(p => p.PasswordResets).HasForeignKey(d => d.UsuarioId);
        });

        modelBuilder.Entity<Permisso>(entity =>
        {
            entity.HasIndex(e => new { e.Modulo, e.Acao }, "IX_Permissoes_Modulo_Acao").IsUnique();

            entity.Property(e => e.Acao).HasMaxLength(100);
            entity.Property(e => e.Ativo).HasDefaultValue(true);
            entity.Property(e => e.DataCadastro).HasDefaultValueSql("(getdate())");
            entity.Property(e => e.Descricao).HasMaxLength(500);
            entity.Property(e => e.Modulo).HasMaxLength(100);
            entity.Property(e => e.Nome).HasMaxLength(100);
        });

        modelBuilder.Entity<PermissoesGrupo>(entity =>
        {
            entity.HasIndex(e => new { e.GrupoAcessoId, e.PermissaoId }, "IX_PermissoesGrupos_GrupoAcessoId_PermissaoId").IsUnique();

            entity.Property(e => e.DataCadastro).HasDefaultValueSql("(getdate())");
            entity.Property(e => e.SituacoesEspecificas).HasMaxLength(500);

            entity.HasOne(d => d.GrupoAcesso).WithMany(p => p.PermissoesGrupos).HasForeignKey(d => d.GrupoAcessoId);

            entity.HasOne(d => d.Permissao).WithMany(p => p.PermissoesGrupos).HasForeignKey(d => d.PermissaoId);
        });

        modelBuilder.Entity<PessoasFisica>(entity =>
        {
            entity.HasIndex(e => e.Cpf, "IX_PessoasFisicas_Cpf").IsUnique();

            entity.HasIndex(e => e.EmailEmpresarial, "IX_PessoasFisicas_Email").IsUnique();

            entity.HasIndex(e => e.EmailEmpresarial, "IX_PessoasFisicas_EmailEmpresarial").IsUnique();

            entity.HasIndex(e => e.EnderecoId, "IX_PessoasFisicas_EnderecoId");

            entity.Property(e => e.Cnh).HasMaxLength(20);
            entity.Property(e => e.Codinome).HasMaxLength(100);
            entity.Property(e => e.Cpf).HasMaxLength(14);
            entity.Property(e => e.EmailEmpresarial).HasMaxLength(150);
            entity.Property(e => e.EmailPessoal).HasMaxLength(150);
            entity.Property(e => e.Nome).HasMaxLength(200);
            entity.Property(e => e.Rg).HasMaxLength(20);
            entity.Property(e => e.Telefone1).HasMaxLength(15);
            entity.Property(e => e.Telefone2).HasMaxLength(15);

            entity.HasOne(d => d.Endereco).WithMany(p => p.PessoasFisicas)
                .HasForeignKey(d => d.EnderecoId)
                .OnDelete(DeleteBehavior.Cascade);
        });

        modelBuilder.Entity<PessoasJuridica>(entity =>
        {
            entity.HasIndex(e => e.Cnpj, "IX_PessoasJuridicas_Cnpj").IsUnique();

            entity.HasIndex(e => e.Email, "IX_PessoasJuridicas_Email").IsUnique();

            entity.HasIndex(e => e.EnderecoId, "IX_PessoasJuridicas_EnderecoId");

            entity.HasIndex(e => e.ResponsavelTecnicoId, "IX_PessoasJuridicas_ResponsavelTecnicoId");

            entity.Property(e => e.Cnpj).HasMaxLength(18);
            entity.Property(e => e.Email).HasMaxLength(150);
            entity.Property(e => e.NomeFantasia).HasMaxLength(200);
            entity.Property(e => e.RazaoSocial).HasMaxLength(200);
            entity.Property(e => e.Telefone1).HasMaxLength(15);
            entity.Property(e => e.Telefone2).HasMaxLength(15);
            entity.Property(e => e.Telefone3).HasMaxLength(15);
            entity.Property(e => e.Telefone4).HasMaxLength(15);

            entity.HasOne(d => d.Endereco).WithMany(p => p.PessoasJuridicas).HasForeignKey(d => d.EnderecoId);

            entity.HasOne(d => d.ResponsavelTecnico).WithMany(p => p.PessoasJuridicas)
                .HasForeignKey(d => d.ResponsavelTecnicoId)
                .OnDelete(DeleteBehavior.ClientSetNull);
        });

        modelBuilder.Entity<SessoesAtiva>(entity =>
        {
            entity.HasIndex(e => e.UsuarioId, "IX_SessoesAtivas_UsuarioId");

            entity.Property(e => e.Ativa).HasDefaultValue(true);
            entity.Property(e => e.Email).HasMaxLength(100);
            entity.Property(e => e.EnderecoIp)
                .HasMaxLength(45)
                .HasColumnName("EnderecoIP");
            entity.Property(e => e.NomeUsuario).HasMaxLength(100);
            entity.Property(e => e.PaginaAtual)
                .HasMaxLength(200)
                .HasDefaultValue("");
            entity.Property(e => e.Perfil).HasMaxLength(50);
            entity.Property(e => e.TokenSessao).HasMaxLength(255);
            entity.Property(e => e.UserAgent).HasMaxLength(500);

            entity.HasOne(d => d.Usuario).WithMany(p => p.SessoesAtivas).HasForeignKey(d => d.UsuarioId);
        });

        modelBuilder.Entity<Usuario>(entity =>
        {
            entity.HasIndex(e => e.Email, "IX_Usuarios_Email").IsUnique();

            entity.HasIndex(e => e.Login, "IX_Usuarios_Login").IsUnique();

            entity.HasIndex(e => e.PessoaFisicaId, "IX_Usuarios_PessoaFisicaId");

            entity.HasIndex(e => e.PessoaJuridicaId, "IX_Usuarios_PessoaJuridicaId");

            entity.Property(e => e.Email).HasMaxLength(150);
            entity.Property(e => e.Login).HasMaxLength(50);
            entity.Property(e => e.Senha).HasMaxLength(100);

            entity.HasOne(d => d.Consultor).WithMany(p => p.Usuarios).HasForeignKey(d => d.ConsultorId);

            entity.HasOne(d => d.Filial).WithMany(p => p.Usuarios).HasForeignKey(d => d.FilialId);

            entity.HasOne(d => d.GrupoAcesso).WithMany(p => p.Usuarios).HasForeignKey(d => d.GrupoAcessoId);

            entity.HasOne(d => d.PessoaFisica).WithMany(p => p.Usuarios).HasForeignKey(d => d.PessoaFisicaId);

            entity.HasOne(d => d.PessoaJuridica).WithMany(p => p.Usuarios).HasForeignKey(d => d.PessoaJuridicaId);
        });

        OnModelCreatingPartial(modelBuilder);
    }

    partial void OnModelCreatingPartial(ModelBuilder modelBuilder);
}
