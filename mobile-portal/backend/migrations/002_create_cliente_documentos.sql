-- Migration: Criar tabela ClienteDocumentos para armazenar documentos anexados pelos clientes
-- Execute este script no Azure SQL Server

IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'ClienteDocumentos')
BEGIN
    CREATE TABLE ClienteDocumentos (
        Id INT IDENTITY(1,1) PRIMARY KEY,
        ClienteId INT NOT NULL,
        NomeOriginal NVARCHAR(255) NOT NULL,
        NomeArquivo NVARCHAR(255) NOT NULL,
        TipoMime NVARCHAR(100) NULL,
        Tamanho BIGINT NOT NULL,
        BlobUrl NVARCHAR(500) NOT NULL,
        BlobName NVARCHAR(255) NOT NULL,
        DataUpload DATETIME DEFAULT GETDATE(),
        Ativo BIT DEFAULT 1,
        Descricao NVARCHAR(500) NULL,

        CONSTRAINT FK_ClienteDocumentos_Cliente FOREIGN KEY (ClienteId)
            REFERENCES Clientes(Id) ON DELETE CASCADE
    );

    -- Índices para melhor performance
    CREATE INDEX IX_ClienteDocumentos_ClienteId ON ClienteDocumentos(ClienteId);
    CREATE INDEX IX_ClienteDocumentos_DataUpload ON ClienteDocumentos(DataUpload DESC);
    CREATE INDEX IX_ClienteDocumentos_Ativo ON ClienteDocumentos(Ativo);

    PRINT 'Tabela ClienteDocumentos criada com sucesso!';
END
ELSE
BEGIN
    PRINT 'Tabela ClienteDocumentos já existe.';
END
GO

