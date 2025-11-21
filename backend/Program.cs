using Microsoft.EntityFrameworkCore;
using CrmArrighi.Data;
using System.Text.Json;
using System.Text.Json.Serialization;
using Microsoft.AspNetCore.HttpOverrides;
using CrmArrighi.Middleware;
using CrmArrighi.Services;
using CrmArrighi.Utils;
using System.Globalization;

var builder = WebApplication.CreateBuilder(args);

// Configure timezone for Brazil
TimeZoneInfo brasiliaTimeZone = TimeZoneInfo.FindSystemTimeZoneById("E. South America Standard Time");

// ✅ Configure Kestrel to accept large file uploads (remove size limits)
builder.Services.Configure<Microsoft.AspNetCore.Server.Kestrel.Core.KestrelServerOptions>(options =>
{
    options.Limits.MaxRequestBodySize = null; // Remove limit (default is 30MB)
    Console.WriteLine("✅ Kestrel: Limite de tamanho de requisição removido (aceita qualquer tamanho)");
});

// ✅ Configure FormOptions to accept large multipart bodies (for form uploads)
builder.Services.Configure<Microsoft.AspNetCore.Http.Features.FormOptions>(options =>
{
    options.MultipartBodyLengthLimit = long.MaxValue; // Remove limit (default is ~28.6MB)
    options.ValueLengthLimit = int.MaxValue; // Remove limit for individual form values
    options.MultipartHeadersLengthLimit = int.MaxValue; // Remove limit for headers
    Console.WriteLine("✅ FormOptions: Limites de tamanho removidos para uploads de formulários");
});

// Add services to the container.
builder.Services.AddControllers()
    .AddJsonOptions(options =>
    {
        options.JsonSerializerOptions.PropertyNamingPolicy = JsonNamingPolicy.CamelCase;
        options.JsonSerializerOptions.Converters.Add(new JsonStringEnumConverter());
        options.JsonSerializerOptions.ReferenceHandler = System.Text.Json.Serialization.ReferenceHandler.IgnoreCycles;
        options.JsonSerializerOptions.WriteIndented = true;
        options.JsonSerializerOptions.DefaultIgnoreCondition = System.Text.Json.Serialization.JsonIgnoreCondition.Never;
    });

// Configure Forwarded Headers for Reverse Proxy
builder.Services.Configure<ForwardedHeadersOptions>(options =>
{
    options.ForwardedHeaders = ForwardedHeaders.XForwardedFor | ForwardedHeaders.XForwardedProto | ForwardedHeaders.XForwardedHost;
    options.KnownNetworks.Clear();
    options.KnownProxies.Clear();
    // Allow all IPs for development - in production, specify your proxy IPs
    options.RequireHeaderSymmetry = false;
    options.ForwardLimit = null;
});

// Add Entity Framework
builder.Services.AddDbContext<CrmArrighiContext>(options =>
    options.UseSqlServer(builder.Configuration.GetConnectionString("DefaultConnection")));

// Register HttpClient
builder.Services.AddHttpClient();

// Register Santander Boleto Service (sem HttpClient injetado - cria o próprio com certificado)
builder.Services.AddScoped<ISantanderBoletoService, SantanderBoletoService>();

// Register Authorization Service
builder.Services.AddScoped<IAuthorizationService, AuthorizationService>();

// Register Permission Service
builder.Services.AddScoped<IPermissionService, PermissionService>();

// Register Group Access Service
builder.Services.AddScoped<IGroupAccessService, GroupAccessService>();

// Register Database Index Service (para manutenção de índices)
builder.Services.AddScoped<DatabaseIndexService>();

// Register Seed Data Service
builder.Services.AddScoped<ISeedDataService, SeedDataService>();

// Register Usuario Filial Service
builder.Services.AddScoped<IUsuarioFilialService, UsuarioFilialService>();

// Register Usuario Grupo Filial Service
builder.Services.AddScoped<IUsuarioGrupoFilialService, UsuarioGrupoFilialService>();

// Register Azure Blob Storage Service
builder.Services.AddScoped<IAzureBlobStorageService, AzureBlobStorageService>();

// Register Email Service
builder.Services.AddScoped<IEmailService, EmailService>();

// Add CORS
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowAll",
        builder =>
        {
            builder.AllowAnyOrigin()
                   .AllowAnyMethod()
                   .AllowAnyHeader()
                   .WithExposedHeaders("X-Convert-To-PDF", "X-Document-Title", "Content-Disposition");
        });

    options.AddPolicy("AllowVercel",
        builder =>
        {
            builder.WithOrigins(
                    "https://arrighi-front-v1-copy.vercel.app",
                    "https://arrighi-front-v1-copy.vercel.app/",
                    "https://arrighicrm-front-v1.vercel.app",
                    "https://arrighicrm-front-v1.vercel.app/",
                    "https://arrighicrm.com",
                    "https://www.arrighicrm.com",
                    "https://contratos-bk-gag8afd6degtdca4.brazilsouth-01.azurewebsites.net",
                    "http://localhost:3000",
                    "http://localhost:3001"
                )
                .AllowAnyMethod()
                .AllowAnyHeader()
                .AllowCredentials()
                .WithExposedHeaders("X-Convert-To-PDF", "X-Document-Title", "Content-Disposition");
        });
});

var app = builder.Build();

// 🔥 Executar migration AddDataHoraOffline automaticamente ao iniciar
using (var scope = app.Services.CreateScope())
{
    var services = scope.ServiceProvider;
    try
    {
        var context = services.GetRequiredService<CrmArrighiContext>();
        Console.WriteLine("🔄 Executando migration AddDataHoraOfflineToSessaoAtiva...");
        await ExecuteMigrationHelper.ExecuteAddDataHoraOfflineMigrationAsync(context);
        Console.WriteLine("✅ Migration executada com sucesso!");
    }
    catch (Exception ex)
    {
        var logger = services.GetRequiredService<ILogger<Program>>();
        logger.LogError(ex, "❌ Erro ao executar migration AddDataHoraOfflineToSessaoAtiva");
        Console.WriteLine($"❌ Erro: {ex.Message}");
    }
}

// 🔥 Criar tabela PasswordResets automaticamente ao iniciar
using (var scope = app.Services.CreateScope())
{
    var services = scope.ServiceProvider;
    try
    {
        var context = services.GetRequiredService<CrmArrighiContext>();
        Console.WriteLine("🔄 Verificando tabela PasswordResets...");
        await PasswordResetTableHelper.EnsurePasswordResetTableExistsAsync(context);
        Console.WriteLine("✅ Tabela PasswordResets pronta!");
    }
    catch (Exception ex)
    {
        var logger = services.GetRequiredService<ILogger<Program>>();
        logger.LogError(ex, "❌ Erro ao verificar/criar tabela PasswordResets");
        Console.WriteLine($"❌ Erro: {ex.Message}");
    }
}

// Database will be created when needed

// Configure the HTTP request pipeline.
if (!app.Environment.IsDevelopment())
{
    app.UseHsts();
}

// Use Forwarded Headers for Reverse Proxy
app.UseForwardedHeaders();

// Use custom Reverse Proxy middleware
app.UseReverseProxy();

app.UseHttpsRedirection();
app.UseCors("AllowAll");
app.UseAuthorization();

app.MapControllers();

// Criar tabelas se não existirem e popular dados iniciais
using (var scope = app.Services.CreateScope())
{
    var context = scope.ServiceProvider.GetRequiredService<CrmArrighiContext>();
    var seedDataService = scope.ServiceProvider.GetRequiredService<ISeedDataService>();

    // Criar tabelas de Grupos de Acesso primeiro
    await CrmArrighi.Helpers.CreateGruposAcessoTableHelper.CreateGruposAcessoTablesIfNotExists(context);

    // Criar tabela de Parceiros
    await CreateTableHelper.CreateParceirosTableIfNotExists(context);

    // Criar tabela de Sessões Ativas
    await CreateTableHelper.CreateSessoesAtivasTableIfNotExists(context);

    // Criar tabela de Histórico de Clientes
    await CreateTableHelper.CreateHistoricoClientesTableIfNotExists(context);

    // Fazer seed dos dados
    await seedDataService.SeedAllAsync();

    // 🔥 Verificar e corrigir grupo Administrador após seed
    Console.WriteLine("🔄 Verificando configuração do grupo Administrador...");
    await AdminGroupHelper.EnsureAdminGroupIsCorrectAsync(context);
    await AdminGroupHelper.ListAdministratorsAsync(context);
    Console.WriteLine("✅ Verificação do grupo Administrador concluída!");
}

app.Run();
