-- Migration: Criar tabela ClienteCredenciais para o Portal do Cliente Mobile
-- Data: 2025-12-11
-- Descrição: Tabela para armazenar credenciais de acesso dos clientes ao portal mobile

-- Verificar se a tabela já existe
IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'ClienteCredenciais')
BEGIN
    CREATE TABLE ClienteCredenciais (
        Id INT IDENTITY(1,1) PRIMARY KEY,
        ClienteId INT NOT NULL,
        Email NVARCHAR(200) NOT NULL UNIQUE,
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

    -- Índices para performance
    CREATE INDEX IX_ClienteCredenciais_Email ON ClienteCredenciais(Email);
    CREATE INDEX IX_ClienteCredenciais_ClienteId ON ClienteCredenciais(ClienteId);

    PRINT 'Tabela ClienteCredenciais criada com sucesso!';
END
ELSE
BEGIN
    PRINT 'Tabela ClienteCredenciais já existe.';
END
GO

-- Trigger para atualizar DataAtualizacao
IF NOT EXISTS (SELECT * FROM sys.triggers WHERE name = 'TR_ClienteCredenciais_Update')
BEGIN
    EXEC('
    CREATE TRIGGER TR_ClienteCredenciais_Update
    ON ClienteCredenciais
    AFTER UPDATE
    AS
    BEGIN
        SET NOCOUNT ON;
        UPDATE ClienteCredenciais
        SET DataAtualizacao = GETDATE()
        FROM ClienteCredenciais cc
        INNER JOIN inserted i ON cc.Id = i.Id;
    END
    ');
    PRINT 'Trigger TR_ClienteCredenciais_Update criado com sucesso!';
END
GO

