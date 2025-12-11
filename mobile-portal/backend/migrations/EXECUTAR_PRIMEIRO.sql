-- =====================================================
-- EXECUTAR ESTE SCRIPT NO AZURE SQL SERVER
-- Banco: frademabr
-- =====================================================

-- 1. Criar tabela ClienteCredenciais
IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'ClienteCredenciais')
BEGIN
    CREATE TABLE ClienteCredenciais (
        Id INT IDENTITY(1,1) PRIMARY KEY,
        ClienteId INT NOT NULL,
        Email NVARCHAR(200) NOT NULL,
        SenhaHash NVARCHAR(255) NOT NULL,
        Ativo BIT DEFAULT 1,
        EmailVerificado BIT DEFAULT 0,
        TokenVerificacao NVARCHAR(255) NULL,
        TokenExpiracao DATETIME NULL,
        UltimoAcesso DATETIME NULL,
        DispositivoToken NVARCHAR(500) NULL,
        DataCriacao DATETIME DEFAULT GETDATE(),
        DataAtualizacao DATETIME DEFAULT GETDATE(),

        -- Foreign Key para Clientes
        CONSTRAINT FK_ClienteCredenciais_Cliente
            FOREIGN KEY (ClienteId) REFERENCES Clientes(Id)
    );

    -- Índices
    CREATE INDEX IX_ClienteCredenciais_Email ON ClienteCredenciais(Email);
    CREATE INDEX IX_ClienteCredenciais_ClienteId ON ClienteCredenciais(ClienteId);

    PRINT '✅ Tabela ClienteCredenciais criada com sucesso!';
END
ELSE
BEGIN
    PRINT '⚠️ Tabela ClienteCredenciais já existe.';
END
GO

-- 2. Verificar se foi criada
SELECT
    'ClienteCredenciais' as Tabela,
    COUNT(*) as TotalRegistros
FROM ClienteCredenciais;
GO

