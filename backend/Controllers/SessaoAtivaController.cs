using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using CrmArrighi.Data;
using CrmArrighi.Models;
using CrmArrighi.Utils;
using CrmArrighi.Services;
using System;
using System.Linq;
using System.Threading.Tasks;
using System.Collections.Generic;

namespace CrmArrighi.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class SessaoAtivaController : ControllerBase
    {
        private readonly CrmArrighiContext _context;
        private readonly ILogger<SessaoAtivaController> _logger;
        private readonly IPermissionService _permissionService;

        public SessaoAtivaController(CrmArrighiContext context, ILogger<SessaoAtivaController> logger, IPermissionService permissionService)
        {
            _context = context;
            _logger = logger;
            _permissionService = permissionService;
        }

        private async Task<bool> IsAdminAsync()
        {
            // Obter ID do usuário do header X-Usuario-Id
            if (!Request.Headers.TryGetValue("X-Usuario-Id", out var userIdHeader) ||
                !int.TryParse(userIdHeader.FirstOrDefault(), out int userId))
            {
                return false;
            }

            var grupoNome = await _permissionService.GetUserGroupNameAsync(userId);
            return grupoNome == "Administrador";
        }

        [HttpGet]
        public async Task<ActionResult<IEnumerable<object>>> GetSessoesAtivas()
        {
            // Verificar se usuário é administrador
            if (!await IsAdminAsync())
            {
                return Forbid("Apenas administradores podem visualizar sessões ativas");
            }

            try
            {
                // 🔥 LIMPEZA: Marca sessões inativas como offline (sem atividade há mais de 15 minutos)
                var tempoLimite = DateTime.UtcNow.AddMinutes(-15);
                var sessoesInativas = await _context.SessoesAtivas
                    .Where(s => s.Ativa && s.UltimaAtividade < tempoLimite)
                    .ToListAsync();

                if (sessoesInativas.Any())
                {
                    _logger.LogInformation($"🧹 Marcando {sessoesInativas.Count} sessões como offline (sem atividade há > 15 min)");
                    foreach (var sessao in sessoesInativas)
                    {
                        sessao.DataHoraOffline = DateTime.UtcNow;
                        sessao.Ativa = false;
                    }
                    await _context.SaveChangesAsync();
                }

                // Busca sessões ativas com informações do usuário
                var sessoes = await _context.SessoesAtivas
                    .Where(s => s.Ativa)
                    .Include(s => s.Usuario)
                    .OrderByDescending(s => s.UltimaAtividade)
                    .Select(s => new
                    {
                        Id = s.Id,
                        UsuarioId = s.UsuarioId,
                        NomeUsuario = s.NomeUsuario,
                        Email = s.Email,
                        UltimoAcesso = s.Usuario != null && s.Usuario.UltimoAcesso.HasValue ? TimeZoneHelper.ConvertToBrasiliaTime(s.Usuario.UltimoAcesso.Value) : (DateTime?)null,
                        Perfil = s.Perfil,
                        InicioSessao = s.InicioSessao,
                        UltimaAtividade = s.UltimaAtividade,
                        EnderecoIP = s.EnderecoIP,
                        PaginaAtual = s.PaginaAtual,
                        TempoOnline = DateTime.UtcNow.Subtract(s.InicioSessao).ToString(@"hh\:mm\:ss")
                    })
                    .ToListAsync();

                _logger.LogInformation($"Encontradas {sessoes.Count} sessões ativas");

                return Ok(sessoes);
            }
            catch (Exception ex)
            {
                _logger.LogError($"Erro ao buscar sessões ativas: {ex.Message}");
                _logger.LogError($"Stack trace: {ex.StackTrace}");
                return StatusCode(500, "Erro ao buscar sessões ativas");
            }
        }

        [HttpPost("registrar")]
        public async Task<ActionResult<SessaoAtiva>> RegistrarSessao([FromBody] RegistrarSessaoRequest request)
        {
            try
            {
                _logger.LogInformation($"Registrando sessão para usuário {request.NomeUsuario} (ID: {request.UsuarioId})");

                // Remove sessões antigas do mesmo usuário
                var sessoesAntigas = await _context.SessoesAtivas
                    .Where(s => s.UsuarioId == request.UsuarioId)
                    .ToListAsync();

                _logger.LogInformation($"Removendo {sessoesAntigas.Count} sessões antigas do usuário {request.UsuarioId}");

                if (sessoesAntigas.Any())
                {
                    _context.SessoesAtivas.RemoveRange(sessoesAntigas);
                }

                // Obtém o IP real do cliente (considerando proxy reverso)
                var clientIp = GetClientIpAddress();

                _logger.LogInformation($"IP capturado para sessão: {clientIp}");

                // Cria nova sessão
                var novaSessao = new SessaoAtiva
                {
                    UsuarioId = request.UsuarioId,
                    NomeUsuario = request.NomeUsuario,
                    Email = request.Email,
                    Perfil = request.Perfil,
                    InicioSessao = DateTime.UtcNow,
                    UltimaAtividade = DateTime.UtcNow,
                    EnderecoIP = clientIp,
                    UserAgent = Request.Headers["User-Agent"].ToString(),
                    TokenSessao = request.TokenSessao,
                    Ativa = true
                };

                _context.SessoesAtivas.Add(novaSessao);
                await _context.SaveChangesAsync();

                _logger.LogInformation($"Sessão registrada com sucesso para usuário {request.NomeUsuario} (ID: {request.UsuarioId}), sessão ID: {novaSessao.Id}, IP: {clientIp}");

                return Ok(novaSessao);
            }
            catch (Exception ex)
            {
                _logger.LogError($"Erro ao registrar sessão: {ex.Message}");
                return StatusCode(500, "Erro ao registrar sessão");
            }
        }

        [HttpPut("atualizar/{usuarioId}")]
        public async Task<IActionResult> AtualizarAtividade(int usuarioId, [FromBody] AtualizarAtividadeRequest? request = null)
        {
            // 🔄 Retry com até 3 tentativas para evitar erro de concorrência
            int maxRetries = 3;
            int retryCount = 0;

            while (retryCount < maxRetries)
            {
                try
                {
                    _logger.LogInformation($"📡 AtualizarAtividade: Recebida requisição para usuário {usuarioId} (tentativa {retryCount + 1}/{maxRetries})");
                    _logger.LogInformation($"📡 Request body: {(request != null ? $"PaginaAtual='{request.PaginaAtual}'" : "null")}");

                    var sessao = await _context.SessoesAtivas
                        .FirstOrDefaultAsync(s => s.UsuarioId == usuarioId && s.Ativa);

                    if (sessao == null)
                    {
                        _logger.LogWarning($"⚠️ Sessão não encontrada para usuário {usuarioId}");
                        return NotFound("Sessão não encontrada");
                    }

                    _logger.LogInformation($"✅ Sessão encontrada: Id={sessao.Id}, PaginaAtual anterior='{sessao.PaginaAtual}'");

                    sessao.UltimaAtividade = DateTime.UtcNow;

                    // Atualizar página atual se fornecida
                    if (request != null && !string.IsNullOrEmpty(request.PaginaAtual))
                    {
                        sessao.PaginaAtual = request.PaginaAtual;
                        _logger.LogInformation($"📍 Página atualizada para usuário {usuarioId}: '{request.PaginaAtual}'");
                    }
                    else
                    {
                        _logger.LogInformation($"ℹ️ PaginaAtual não fornecida ou vazia na requisição");
                    }

                    await _context.SaveChangesAsync();
                    _logger.LogInformation($"💾 Alterações salvas no banco para usuário {usuarioId}");

                    return Ok(new { success = true, message = "Atividade atualizada com sucesso", paginaAtual = sessao.PaginaAtual });
                }
                catch (DbUpdateConcurrencyException ex)
                {
                    retryCount++;
                    _logger.LogWarning($"⚠️ Conflito de concorrência ao atualizar sessão (tentativa {retryCount}/{maxRetries}): {ex.Message}");

                    // Limpar o contexto para a próxima tentativa
                    foreach (var entry in _context.ChangeTracker.Entries())
                    {
                        entry.State = EntityState.Detached;
                    }

                    if (retryCount >= maxRetries)
                    {
                        _logger.LogError($"❌ Máximo de tentativas atingido ao atualizar sessão do usuário {usuarioId}");
                        return StatusCode(500, new { success = false, message = "Erro ao atualizar atividade" });
                    }

                    // Aguardar um pouco antes de tentar novamente
                    await Task.Delay(100 * retryCount); // Backoff exponencial: 100ms, 200ms, 300ms
                }
                catch (Exception ex)
                {
                    _logger.LogError($"❌ Erro ao atualizar atividade: {ex.Message}");
                    _logger.LogError($"Stack trace: {ex.StackTrace}");
                    return StatusCode(500, new { success = false, message = "Erro ao atualizar atividade", error = ex.Message });
                }
            }

            // Nunca deve chegar aqui, mas por segurança
            return StatusCode(500, new { success = false, message = "Erro inesperado ao atualizar atividade" });
        }

        [HttpDelete("remover/{usuarioId}")]
        public async Task<IActionResult> RemoverSessao(int usuarioId)
        {
            try
            {
                var sessao = await _context.SessoesAtivas
                    .FirstOrDefaultAsync(s => s.UsuarioId == usuarioId);

                if (sessao != null)
                {
                    // 🔥 Registrar horário que ficou offline ao invés de deletar
                    sessao.DataHoraOffline = DateTime.UtcNow;
                    sessao.Ativa = false;
                    await _context.SaveChangesAsync();
                    _logger.LogInformation($"✅ Sessão marcada como offline para usuário ID: {usuarioId} às {sessao.DataHoraOffline:yyyy-MM-dd HH:mm:ss} UTC");
                }

                return Ok();
            }
            catch (Exception ex)
            {
                _logger.LogError($"Erro ao remover sessão: {ex.Message}");
                return StatusCode(500, "Erro ao remover sessão");
            }
        }

        [HttpGet("count")]
        public async Task<ActionResult<int>> GetContagemSessoesAtivas()
        {
            // Verificar se usuário é administrador
            if (!await IsAdminAsync())
            {
                return Forbid("Apenas administradores podem visualizar contagem de sessões ativas");
            }

            try
            {
                // 🔥 Marca sessões inativas como offline (sem atividade há mais de 15 minutos)
                var tempoLimite = DateTime.UtcNow.AddMinutes(-15);
                var sessoesInativas = await _context.SessoesAtivas
                    .Where(s => s.Ativa && s.UltimaAtividade < tempoLimite)
                    .ToListAsync();

                if (sessoesInativas.Any())
                {
                    foreach (var sessao in sessoesInativas)
                    {
                        sessao.DataHoraOffline = DateTime.UtcNow;
                        sessao.Ativa = false;
                    }
                    await _context.SaveChangesAsync();
                }

                var count = await _context.SessoesAtivas
                    .Where(s => s.Ativa)
                    .CountAsync();

                _logger.LogInformation($"Contagem de sessões ativas: {count}");

                return Ok(count);
            }
            catch (Exception ex)
            {
                _logger.LogError($"Erro ao contar sessões ativas: {ex.Message}");
                return StatusCode(500, "Erro ao contar sessões ativas");
            }
        }

        [HttpGet("diagnostico")]
        public async Task<ActionResult<object>> GetDiagnostico()
        {
            try
            {
                var todasSessoes = await _context.SessoesAtivas.ToListAsync();
                var sessoesAtivas = await _context.SessoesAtivas.Where(s => s.Ativa).ToListAsync();

                return Ok(new
                {
                    TotalSessoes = todasSessoes.Count,
                    SessoesAtivas = sessoesAtivas.Count,
                    Sessoes = sessoesAtivas.Select(s => new
                    {
                        Id = s.Id,
                        UsuarioId = s.UsuarioId,
                        NomeUsuario = s.NomeUsuario,
                        Email = s.Email,
                        Perfil = s.Perfil,
                        InicioSessao = s.InicioSessao,
                        UltimaAtividade = s.UltimaAtividade,
                        TempoOnline = DateTime.UtcNow.Subtract(s.InicioSessao).ToString(@"hh\:mm\:ss"),
                        Ativa = s.Ativa
                    })
                });
            }
            catch (Exception ex)
            {
                _logger.LogError($"Erro no diagnóstico: {ex.Message}");
                return StatusCode(500, "Erro no diagnóstico");
            }
        }

        /// <summary>
        /// Retorna todos os usuários do sistema com informações de último acesso e status de sessão
        /// </summary>
        [HttpGet("historico")]
        public async Task<ActionResult<IEnumerable<object>>> GetHistoricoAcessos()
        {
            // Verificar se usuário é administrador
            if (!await IsAdminAsync())
            {
                return Forbid("Apenas administradores podem visualizar histórico de sessões");
            }

            try
            {
                _logger.LogInformation("Buscando histórico de acessos de todos os usuários");

                // 🔥 LIMPEZA: Marca sessões inativas como offline (sem atividade há mais de 15 minutos)
                var tempoLimite = DateTime.UtcNow.AddMinutes(-15);
                var sessoesInativas = await _context.SessoesAtivas
                    .Where(s => s.Ativa && s.UltimaAtividade < tempoLimite)
                    .ToListAsync();

                if (sessoesInativas.Any())
                {
                    _logger.LogInformation($"🧹 Marcando {sessoesInativas.Count} sessões como offline (sem atividade há > 15 min)");
                    foreach (var sessao in sessoesInativas)
                    {
                        sessao.DataHoraOffline = DateTime.UtcNow;
                        sessao.Ativa = false;
                    }
                    await _context.SaveChangesAsync();
                }

                // Busca todos os usuários ativos com seus relacionamentos
                var usuarios = await _context.Usuarios
                    .Where(u => u.Ativo)
                    .Include(u => u.GrupoAcesso)
                    .Include(u => u.PessoaFisica)
                    .Include(u => u.PessoaJuridica)
                    .ToListAsync();

                // Busca sessões ativas
                var sessoesAtivas = await _context.SessoesAtivas
                    .Where(s => s.Ativa)
                    .ToListAsync();

                // Busca todas as sessões (incluindo inativas) para calcular duração da última sessão
                var todasSessoes = await _context.SessoesAtivas.ToListAsync();

                // Combina informações de usuários com sessões
                var historico = usuarios.Select(u =>
                {
                    var sessaoAtiva = sessoesAtivas.FirstOrDefault(s => s.UsuarioId == u.Id);
                    var estaOnline = sessaoAtiva != null;
                    var ultimoAcesso = u.UltimoAcesso.HasValue
                        ? TimeZoneHelper.ConvertToBrasiliaTime(u.UltimoAcesso.Value)
                        : (DateTime?)null;

                    // Obter nome do usuário de PessoaFisica ou PessoaJuridica, ou usar Login como fallback
                    string nomeUsuario = u.PessoaFisica?.Nome
                        ?? u.PessoaJuridica?.RazaoSocial
                        ?? u.Login;

                    // Calcular tempo online
                    string tempoOnline = "00:00:00";
                    if (estaOnline && sessaoAtiva != null)
                    {
                        // Para usuários online, mostra tempo desde início da sessão
                        tempoOnline = DateTime.UtcNow.Subtract(sessaoAtiva.InicioSessao).ToString(@"hh\:mm\:ss");
                    }
                    else
                    {
                        // Para usuários offline, busca a última sessão e calcula duração
                        var ultimaSessao = todasSessoes
                            .Where(s => s.UsuarioId == u.Id)
                            .OrderByDescending(s => s.UltimaAtividade)
                            .FirstOrDefault();

                        if (ultimaSessao != null)
                        {
                            // Calcula duração da última sessão (da inicioSessao até ultimaAtividade)
                            var duracao = ultimaSessao.UltimaAtividade.Subtract(ultimaSessao.InicioSessao);
                            tempoOnline = duracao.ToString(@"hh\:mm\:ss");
                        }
                    }

                    // Buscar DataHoraOffline da última sessão offline
                    DateTime? dataHoraOffline = null;
                    if (!estaOnline)
                    {
                        var ultimaSessaoOffline = todasSessoes
                            .Where(s => s.UsuarioId == u.Id && s.DataHoraOffline.HasValue)
                            .OrderByDescending(s => s.DataHoraOffline)
                            .FirstOrDefault();

                        // 🔥 Converter para horário de Brasília
                        dataHoraOffline = ultimaSessaoOffline?.DataHoraOffline.HasValue == true
                            ? TimeZoneHelper.ConvertToBrasiliaTime(ultimaSessaoOffline.DataHoraOffline.Value)
                            : (DateTime?)null;
                    }

                    return new
                    {
                        Id = u.Id,
                        UsuarioId = u.Id,
                        NomeUsuario = nomeUsuario,
                        Email = u.Email,
                        Perfil = u.GrupoAcesso?.Nome ?? "Sem Grupo",
                        EstaOnline = estaOnline,
                        UltimoAcesso = ultimoAcesso,
                        InicioSessao = estaOnline ? sessaoAtiva?.InicioSessao : (DateTime?)null,
                        UltimaAtividade = estaOnline ? sessaoAtiva?.UltimaAtividade : ultimoAcesso,
                        EnderecoIP = estaOnline ? sessaoAtiva?.EnderecoIP : null,
                        PaginaAtual = estaOnline ? sessaoAtiva?.PaginaAtual : null,
                        TempoOnline = tempoOnline,
                        SessaoId = estaOnline ? sessaoAtiva?.Id : (int?)null,
                        DataHoraOffline = dataHoraOffline
                    };
                })
                .OrderByDescending(u => u.EstaOnline)
                .ThenByDescending(u => u.UltimoAcesso)
                .ToList();

                _logger.LogInformation($"Retornando histórico de {historico.Count} usuários ({sessoesAtivas.Count} online)");

                return Ok(historico);
            }
            catch (Exception ex)
            {
                _logger.LogError($"Erro ao buscar histórico de acessos: {ex.Message}");
                _logger.LogError($"Stack trace: {ex.StackTrace}");
                return StatusCode(500, "Erro ao buscar histórico de acessos");
            }
        }

        private string CalcularTempoOnline(DateTime inicioSessao)
        {
            var tempo = DateTime.UtcNow - inicioSessao;

            if (tempo.TotalDays >= 1)
            {
                return $"{(int)tempo.TotalDays}d {tempo.Hours}h";
            }
            else if (tempo.TotalHours >= 1)
            {
                return $"{(int)tempo.TotalHours}h {tempo.Minutes}m";
            }
            else
            {
                return $"{tempo.Minutes}m";
            }
        }

        /// <summary>
        /// Obtém o endereço IP real do cliente, considerando proxies reversos
        /// </summary>
        private string GetClientIpAddress()
        {
            // 1. Tentar obter do header X-Forwarded-For (padrão para proxies)
            var xForwardedFor = Request.Headers["X-Forwarded-For"].FirstOrDefault();
            if (!string.IsNullOrEmpty(xForwardedFor))
            {
                // X-Forwarded-For pode conter múltiplos IPs (client, proxy1, proxy2, ...)
                // O primeiro IP é o cliente original
                var ips = xForwardedFor.Split(',');
                var clientIp = ips[0].Trim();

                _logger.LogDebug($"IP obtido de X-Forwarded-For: {clientIp} (full header: {xForwardedFor})");
                return clientIp;
            }

            // 2. Tentar obter do header X-Real-IP (usado por alguns proxies como Nginx)
            var xRealIp = Request.Headers["X-Real-IP"].FirstOrDefault();
            if (!string.IsNullOrEmpty(xRealIp))
            {
                _logger.LogDebug($"IP obtido de X-Real-IP: {xRealIp}");
                return xRealIp.Trim();
            }

            // 3. Tentar obter do header CF-Connecting-IP (Cloudflare)
            var cfConnectingIp = Request.Headers["CF-Connecting-IP"].FirstOrDefault();
            if (!string.IsNullOrEmpty(cfConnectingIp))
            {
                _logger.LogDebug($"IP obtido de CF-Connecting-IP: {cfConnectingIp}");
                return cfConnectingIp.Trim();
            }

            // 4. Fallback: usar RemoteIpAddress (pode ser o IP do proxy se não houver headers)
            var remoteIp = HttpContext.Connection.RemoteIpAddress?.ToString() ?? "Desconhecido";

            // Se for IPv6 loopback, converter para IPv4
            if (remoteIp == "::1")
            {
                remoteIp = "127.0.0.1 (localhost)";
            }

            _logger.LogDebug($"IP obtido de RemoteIpAddress (fallback): {remoteIp}");
            return remoteIp;
        }
    }

    public class RegistrarSessaoRequest
    {
        public int UsuarioId { get; set; }
        public string NomeUsuario { get; set; } = string.Empty;
        public string Email { get; set; } = string.Empty;
        public string Perfil { get; set; } = string.Empty;
        public string TokenSessao { get; set; } = string.Empty;
    }

    public class AtualizarAtividadeRequest
    {
        public string PaginaAtual { get; set; } = string.Empty;
    }
}
