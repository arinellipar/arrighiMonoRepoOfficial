using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using CrmArrighi.Data;
using CrmArrighi.Models;
using CrmArrighi.Services;
using System.Text.Json;

namespace CrmArrighi.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class BoletoController : ControllerBase
    {
        private readonly CrmArrighiContext _context;
        private readonly ISantanderBoletoService _santanderService;
        private readonly ILogger<BoletoController> _logger;
        private readonly IAuthorizationService _authorizationService;
        private readonly IConfiguration _configuration;

        public BoletoController(
            CrmArrighiContext context,
            ISantanderBoletoService santanderService,
            ILogger<BoletoController> logger,
            IAuthorizationService authorizationService,
            IConfiguration configuration)
        {
            _context = context;
            _santanderService = santanderService;
            _logger = logger;
            _authorizationService = authorizationService;
            _configuration = configuration;
        }

        // GET: api/Boleto
        [HttpGet]
        public async Task<ActionResult<IEnumerable<BoletoResponseDTO>>> GetBoletos()
        {
            try
            {
                _logger.LogInformation("🔍 GetBoletos: Iniciando busca de boletos");

                // Obter usuário logado para aplicar filtragem por filial
                var usuarioIdHeader = Request.Headers["X-Usuario-Id"].FirstOrDefault();
                _logger.LogInformation($"🔍 GetBoletos: X-Usuario-Id header = {usuarioIdHeader}");

                if (!int.TryParse(usuarioIdHeader, out int usuarioId))
                {
                    _logger.LogWarning("❌ GetBoletos: Usuário não identificado");
                    return Unauthorized("Usuário não identificado na requisição.");
                }

                _logger.LogInformation($"🔍 GetBoletos: UsuarioId identificado = {usuarioId}");

                var boletosQuery = _context.Boletos
                    .Include(b => b.Contrato)
                        .ThenInclude(c => c.Cliente)
                            .ThenInclude(cl => cl.PessoaFisica)
                    .Include(b => b.Contrato)
                        .ThenInclude(c => c.Cliente)
                            .ThenInclude(cl => cl.PessoaJuridica)
                    .Include(b => b.Contrato)
                        .ThenInclude(c => c.Cliente)
                            .ThenInclude(cl => cl.Filial);

                _logger.LogInformation("🔍 GetBoletos: Query base criada, aplicando filtros de autorização");

                // Aplicar filtragem por permissões de usuário (incluindo filial para Gestor de Filial)
                var boletosFiltrados = await _authorizationService.FilterBoletosByUserAsync(usuarioId, boletosQuery);

                _logger.LogInformation("🔍 GetBoletos: Filtros aplicados, executando query no banco");

                var boletos = await boletosFiltrados.OrderByDescending(b => b.DataCadastro).ToListAsync();

                _logger.LogInformation($"✅ GetBoletos: Encontrados {boletos.Count} boletos para usuário {usuarioId}");

                var response = boletos.Select(MapearBoletoParaResponse).ToList();

                _logger.LogInformation($"✅ GetBoletos: Response preparada com {response.Count} boletos");

                return Ok(response);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"❌ GetBoletos: Erro completo: {ex.Message} | StackTrace: {ex.StackTrace}");
                return StatusCode(500, new { erro = "Erro interno do servidor", detalhes = ex.Message, tipo = ex.GetType().Name });
            }
        }

        // GET: api/Boleto/5
        [HttpGet("{id}")]
        public async Task<ActionResult<BoletoResponseDTO>> GetBoleto(int id)
        {
            try
            {
                var boleto = await _context.Boletos
                    .Include(b => b.Contrato)
                        .ThenInclude(c => c.Cliente)
                            .ThenInclude(cl => cl.PessoaFisica)
                    .Include(b => b.Contrato)
                        .ThenInclude(c => c.Cliente)
                            .ThenInclude(cl => cl.PessoaJuridica)
                    .FirstOrDefaultAsync(b => b.Id == id);

                if (boleto == null)
                {
                    return NotFound($"Boleto com ID {id} não encontrado");
                }

                var response = MapearBoletoParaResponse(boleto);
                return Ok(response);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Erro ao buscar boleto ID: {Id}", id);
                return StatusCode(500, "Erro interno do servidor");
            }
        }

        // GET: api/Boleto/contrato/5
        [HttpGet("contrato/{contratoId}")]
        public async Task<ActionResult<IEnumerable<BoletoResponseDTO>>> GetBoletosPorContrato(int contratoId)
        {
            try
            {
                var boletos = await _context.Boletos
                    .Include(b => b.Contrato)
                        .ThenInclude(c => c.Cliente)
                            .ThenInclude(cl => cl.PessoaFisica)
                    .Include(b => b.Contrato)
                        .ThenInclude(c => c.Cliente)
                            .ThenInclude(cl => cl.PessoaJuridica)
                    .Where(b => b.ContratoId == contratoId)
                    .OrderByDescending(b => b.DataCadastro)
                    .ToListAsync();

                var response = boletos.Select(MapearBoletoParaResponse).ToList();
                return Ok(response);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Erro ao buscar boletos do contrato ID: {ContratoId}", contratoId);
                return StatusCode(500, "Erro interno do servidor");
            }
        }

        // POST: api/Boleto
        [HttpPost]
        public async Task<ActionResult<BoletoResponseDTO>> PostBoleto(CreateBoletoDTO dto)
        {
            try
            {
                _logger.LogInformation("🔔 Iniciando criação de boleto para contrato ID: {ContratoId}", dto.ContratoId);
                _logger.LogInformation("🔔 Dados recebidos: ContratoId={ContratoId}, Valor={Valor}, Vencimento={Vencimento}",
                    dto.ContratoId, dto.NominalValue, dto.DueDate);

                // Validar se o contrato existe
                var contrato = await _context.Contratos
                    .Include(c => c.Cliente)
                        .ThenInclude(cl => cl.PessoaFisica)
                            .ThenInclude(pf => pf.Endereco)
                    .Include(c => c.Cliente)
                        .ThenInclude(cl => cl.PessoaJuridica)
                            .ThenInclude(pj => pj.Endereco)
                    .FirstOrDefaultAsync(c => c.Id == dto.ContratoId);

                if (contrato == null)
                {
                    _logger.LogWarning("❌ Tentativa de criar boleto para contrato inexistente: {ContratoId}", dto.ContratoId);
                    return NotFound(new {
                        recurso = "Contrato",
                        id = dto.ContratoId,
                        mensagem = $"Contrato #{dto.ContratoId} não foi encontrado no banco de dados",
                        detalhes = "Verifique se o contrato existe antes de criar o boleto"
                    });
                }

                _logger.LogInformation("✅ Contrato encontrado: {ContratoId}", contrato.Id);

                // Validar se cliente tem dados necessários
                if (contrato.Cliente == null)
                {
                    _logger.LogError("❌ Contrato {ContratoId} não possui cliente associado", dto.ContratoId);
                    return BadRequest(new { mensagem = "Contrato não possui cliente associado" });
                }

                _logger.LogInformation("✅ Cliente associado ao contrato");

                // Gerar NSU Code único
                var nsuCode = await _santanderService.GerarProximoNsuCodeAsync();
                var nsuDate = DateTime.Today;

                _logger.LogInformation("✅ NSU Code gerado: {NsuCode}", nsuCode);

                // Criar boleto
                var boleto = await CriarBoletoFromDTO(dto, contrato, nsuCode, nsuDate);

                _logger.LogInformation("✅ Boleto criado em memória, preparando para registrar no Santander...");

                // Registrar na API Santander
                try
                {
                    var santanderResponse = await _santanderService.RegistrarBoletoAsync(boleto);

                    // Atualizar boleto com dados de resposta
                    AtualizarBoletoComResposta(boleto, santanderResponse);
                    boleto.Status = "REGISTRADO";

                    _logger.LogInformation("✅ Boleto registrado no Santander com sucesso");
                }
                catch (Exception ex)
                {
                    _logger.LogError(ex, "❌ Erro ao registrar boleto na API Santander");
                    boleto.Status = "ERRO";
                    boleto.ErrorMessage = ex.Message;
                    boleto.ErrorCode = "API_ERROR";
                }

                // Salvar no banco
                _context.Boletos.Add(boleto);
                await _context.SaveChangesAsync();

                _logger.LogInformation("✅ Boleto salvo no banco de dados. ID: {Id}, NSU: {NsuCode}", boleto.Id, boleto.NsuCode);

                var response = MapearBoletoParaResponse(boleto);
                return CreatedAtAction(nameof(GetBoleto), new { id = boleto.Id }, response);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "❌ ERRO CRÍTICO ao criar boleto: {Message}", ex.Message);
                _logger.LogError("❌ Stack trace: {StackTrace}", ex.StackTrace);
                return StatusCode(500, new {
                    mensagem = "Erro interno do servidor",
                    detalhes = ex.Message,
                    tipo = ex.GetType().Name
                });
            }
        }

        // PUT: api/Boleto/sincronizar-todos
        [HttpPut("sincronizar-todos")]
        public async Task<ActionResult<object>> SincronizarTodosBoletos()
        {
            try
            {
                _logger.LogInformation("🔄 Iniciando sincronização de todos os boletos registrados");

                // Buscar todos os boletos que estão REGISTRADOS ou ATIVO (não incluir PENDENTE, LIQUIDADO, BAIXADO, CANCELADO)
                var boletos = await _context.Boletos
                    .Where(b => b.Ativo && (b.Status == "REGISTRADO" || b.Status == "ATIVO"))
                    .ToListAsync();

                _logger.LogInformation("📊 Encontrados {Total} boletos para sincronizar", boletos.Count);

                var beneficiaryCode = _configuration["SantanderAPI:CovenantCode"] ?? "0596794";

                var resultados = new
                {
                    Total = boletos.Count,
                    Sucesso = 0,
                    Erros = 0,
                    Atualizados = new List<object>(),
                    Erros_Lista = new List<object>()
                };

                int sucessoCount = 0;
                int erroCount = 0;
                var atualizadosList = new List<object>();
                var errosList = new List<object>();

                foreach (var boleto in boletos)
                {
                    try
                    {
                        var statusAnterior = boleto.Status;

                        // Consultar status
                        var statusResponse = await _santanderService.ConsultarStatusPorNossoNumeroAsync(beneficiaryCode, boleto.BankNumber);

                        // Atualizar no banco
                        await AtualizarStatusBoletoNoBanco(boleto, statusResponse);

                        sucessoCount++;

                        if (statusAnterior != boleto.Status)
                        {
                            atualizadosList.Add(new
                            {
                                BoletoId = boleto.Id,
                                NsuCode = boleto.NsuCode,
                                StatusAnterior = statusAnterior,
                                StatusNovo = boleto.Status
                            });

                            _logger.LogInformation("✅ Boleto {Id} atualizado: {Anterior} → {Novo}",
                                boleto.Id, statusAnterior, boleto.Status);
                        }
                    }
                    catch (Exception ex)
                    {
                        erroCount++;
                        errosList.Add(new
                        {
                            BoletoId = boleto.Id,
                            NsuCode = boleto.NsuCode,
                            Erro = ex.Message
                        });

                        _logger.LogError(ex, "❌ Erro ao sincronizar boleto {Id}", boleto.Id);
                    }
                }

                var resultado = new
                {
                    Total = boletos.Count,
                    Sucesso = sucessoCount,
                    Erros = erroCount,
                    Atualizados = atualizadosList,
                    Erros_Lista = errosList
                };

                _logger.LogInformation("✅ Sincronização concluída. Total: {Total}, Sucesso: {Sucesso}, Erros: {Erros}, Atualizados: {Atualizados}",
                    boletos.Count, sucessoCount, erroCount, atualizadosList.Count);

                return Ok(resultado);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "❌ Erro ao sincronizar todos os boletos");
                return StatusCode(500, new
                {
                    mensagem = "Erro ao sincronizar boletos",
                    detalhes = ex.Message
                });
            }
        }

        // PUT: api/Boleto/5/sincronizar
        [HttpPut("{id}/sincronizar")]
        public async Task<ActionResult<BoletoResponseDTO>> SincronizarBoleto(int id)
        {
            try
            {
                var boleto = await _context.Boletos
                    .Include(b => b.Contrato)
                    .FirstOrDefaultAsync(b => b.Id == id);

                if (boleto == null)
                {
                    return NotFound($"Boleto com ID {id} não encontrado");
                }

                // Permitir sincronização de qualquer boleto que não seja PENDENTE
                if (boleto.Status == "PENDENTE")
                {
                    return BadRequest("Boletos pendentes (não registrados) não podem ser sincronizados. Registre o boleto primeiro.");
                }

                _logger.LogInformation("🔄 Sincronizando boleto ID: {Id}, Status atual: {Status}", id, boleto.Status);

                try
                {
                    var beneficiaryCode = _configuration["SantanderAPI:CovenantCode"] ?? "0596794";

                    // ✅ Usar novo método de consulta de status
                    var statusResponse = await _santanderService.ConsultarStatusPorNossoNumeroAsync(beneficiaryCode, boleto.BankNumber);

                    // ✅ Atualizar status no banco
                    await AtualizarStatusBoletoNoBanco(boleto, statusResponse);

                    _logger.LogInformation("✅ Boleto sincronizado com sucesso. ID: {Id}, Novo Status: {Status}", id, boleto.Status);

                    var response = MapearBoletoParaResponse(boleto);
                    return Ok(response);
                }
                catch (Exception ex)
                {
                    _logger.LogError(ex, "Erro ao sincronizar boleto ID: {Id}", id);
                    return BadRequest($"Erro ao sincronizar boleto: {ex.Message}");
                }
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Erro ao sincronizar boleto ID: {Id}", id);
                return StatusCode(500, "Erro interno do servidor");
            }
        }

        // DELETE: api/Boleto/5
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteBoleto(int id)
        {
            try
            {
                var boleto = await _context.Boletos.FindAsync(id);
                if (boleto == null)
                {
                    return NotFound($"Boleto com ID {id} não encontrado");
                }

                if (boleto.Status == "LIQUIDADO")
                {
                    return BadRequest("Não é possível excluir um boleto liquidado");
                }

                // Tentar cancelar na API Santander se estiver registrado
                if (boleto.Status == "REGISTRADO")
                {
                    try
                    {
                        await _santanderService.CancelarBoletoAsync(boleto.CovenantCode, boleto.BankNumber, boleto.NsuDate);
                        _logger.LogInformation("Boleto cancelado na API Santander. ID: {Id}", id);
                    }
                    catch (Exception ex)
                    {
                        _logger.LogWarning(ex, "Erro ao cancelar boleto na API Santander. ID: {Id}", id);
                        // Continua com a exclusão mesmo se não conseguir cancelar na API
                    }
                }

                boleto.Ativo = false;
                boleto.Status = "CANCELADO";
                boleto.DataAtualizacao = DateTime.UtcNow;
                await _context.SaveChangesAsync();

                _logger.LogInformation("Boleto cancelado com sucesso. ID: {Id}", id);
                return NoContent();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Erro ao cancelar boleto ID: {Id}", id);
                return StatusCode(500, "Erro interno do servidor");
            }
        }

        // GET: api/Boleto/dashboard
        [HttpGet("dashboard")]
        public async Task<ActionResult<object>> GetDashboard()
        {
            try
            {
                var hoje = DateTime.Today;
                var inicioMes = new DateTime(hoje.Year, hoje.Month, 1);

                var stats = await _context.Boletos
                    .Where(b => b.Ativo)
                    .GroupBy(b => 1)
                    .Select(g => new
                    {
                        TotalBoletos = g.Count(),
                        BoletosPendentes = g.Count(b => b.Status == "PENDENTE"),
                        BoletosRegistrados = g.Count(b => b.Status == "REGISTRADO"),
                        BoletosLiquidados = g.Count(b => b.Status == "LIQUIDADO"),
                        BoletosVencidos = g.Count(b => b.Status == "VENCIDO"),
                        BoletosCancelados = g.Count(b => b.Status == "CANCELADO"),
                        ValorTotalRegistrado = g.Where(b => b.Status == "REGISTRADO").Sum(b => (decimal?)b.NominalValue) ?? 0,
                        ValorTotalLiquidado = g.Where(b => b.Status == "LIQUIDADO").Sum(b => (decimal?)b.NominalValue) ?? 0,
                        BoletosHoje = g.Count(b => b.DataCadastro.Date == hoje),
                        BoletosEsteMes = g.Count(b => b.DataCadastro >= inicioMes)
                    })
                    .FirstOrDefaultAsync();

                if (stats == null)
                {
                    stats = new
                    {
                        TotalBoletos = 0,
                        BoletosPendentes = 0,
                        BoletosRegistrados = 0,
                        BoletosLiquidados = 0,
                        BoletosVencidos = 0,
                        BoletosCancelados = 0,
                        ValorTotalRegistrado = 0m,
                        ValorTotalLiquidado = 0m,
                        BoletosHoje = 0,
                        BoletosEsteMes = 0
                    };
                }

                return Ok(stats);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Erro ao gerar dashboard");
                return StatusCode(500, "Erro interno do servidor");
            }
        }

        // GET: api/Boleto/liquidados-por-periodo?periodo=semana
        [HttpGet("liquidados-por-periodo")]
        public async Task<ActionResult<object>> GetBoletosLiquidadosPorPeriodo([FromQuery] string periodo = "semana")
        {
            try
            {
                var hoje = DateTime.Today;
                DateTime dataInicio;
                int dias;

                switch (periodo.ToLower())
                {
                    case "dia":
                        dataInicio = hoje;
                        dias = 1;
                        break;
                    case "semana":
                        dataInicio = hoje.AddDays(-6); // Últimos 7 dias
                        dias = 7;
                        break;
                    case "mês":
                    case "mes":
                        dataInicio = hoje.AddDays(-29); // Últimos 30 dias
                        dias = 30;
                        break;
                    default:
                        dataInicio = hoje.AddDays(-6);
                        dias = 7;
                        break;
                }

                _logger.LogInformation($"📊 GetBoletosLiquidadosPorPeriodo: Buscando boletos de {dataInicio:dd/MM/yyyy} até {hoje:dd/MM/yyyy}");

                // Buscar boletos liquidados no período
                var boletosLiquidados = await _context.Boletos
                    .Where(b => b.Ativo &&
                           b.Status == "LIQUIDADO" &&
                           b.DataAtualizacao.HasValue &&
                           b.DataAtualizacao.Value >= dataInicio &&
                           b.DataAtualizacao.Value <= hoje.AddDays(1).AddSeconds(-1))
                    .Select(b => new
                    {
                        b.Id,
                        b.NominalValue,
                        DataLiquidacao = b.DataAtualizacao.HasValue ? b.DataAtualizacao.Value.Date : hoje
                    })
                    .ToListAsync();

                _logger.LogInformation($"📊 Total de boletos liquidados encontrados: {boletosLiquidados.Count}");

                // Gerar lista de todos os dias do período
                var diasPeriodo = Enumerable.Range(0, dias)
                    .Select(i => dataInicio.AddDays(i))
                    .ToList();

                // Agrupar por dia e calcular valores
                var dadosPorDia = diasPeriodo.Select(dia =>
                {
                    var boletosNoDia = boletosLiquidados.Where(b => b.DataLiquidacao.Date == dia.Date).ToList();
                    var valorTotal = boletosNoDia.Any() ? boletosNoDia.Sum(b => b.NominalValue) : 0m;
                    var quantidade = boletosNoDia.Count;

                    return new
                    {
                        Data = dia.ToString("dd/MM"),
                        DiaSemana = GetDiaSemanaAbreviado(dia.DayOfWeek),
                        Valor = valorTotal,
                        Quantidade = quantidade,
                        DataCompleta = dia.ToString("yyyy-MM-dd")
                    };
                }).ToList();

                var resultado = new
                {
                    Periodo = periodo,
                    DataInicio = dataInicio.ToString("dd/MM/yyyy"),
                    DataFim = hoje.ToString("dd/MM/yyyy"),
                    TotalDias = dias,
                    ValorTotal = dadosPorDia.Sum(d => d.Valor),
                    QuantidadeTotal = dadosPorDia.Sum(d => d.Quantidade),
                    Dados = dadosPorDia
                };

                _logger.LogInformation($"✅ Resultado: {resultado.QuantidadeTotal} boletos, R$ {resultado.ValorTotal:N2}");

                return Ok(resultado);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Erro ao buscar boletos liquidados por período");
                return StatusCode(500, "Erro interno do servidor");
            }
        }

        private string GetDiaSemanaAbreviado(DayOfWeek diaSemana)
        {
            return diaSemana switch
            {
                DayOfWeek.Sunday => "Dom",
                DayOfWeek.Monday => "Seg",
                DayOfWeek.Tuesday => "Ter",
                DayOfWeek.Wednesday => "Qua",
                DayOfWeek.Thursday => "Qui",
                DayOfWeek.Friday => "Sex",
                DayOfWeek.Saturday => "Sáb",
                _ => ""
            };
        }

        #region Métodos Privados

        private string LimparTexto(string texto)
        {
            if (string.IsNullOrEmpty(texto)) return "";

            // Remover acentos primeiro
            var normalizado = texto
                .Replace("á", "a").Replace("à", "a").Replace("ã", "a").Replace("â", "a")
                .Replace("é", "e").Replace("ê", "e")
                .Replace("í", "i")
                .Replace("ó", "o").Replace("ô", "o").Replace("õ", "o")
                .Replace("ú", "u").Replace("ü", "u")
                .Replace("ç", "c")
                .Replace("Á", "A").Replace("À", "A").Replace("Ã", "A").Replace("Â", "A")
                .Replace("É", "E").Replace("Ê", "E")
                .Replace("Í", "I")
                .Replace("Ó", "O").Replace("Ô", "O").Replace("Õ", "O")
                .Replace("Ú", "U").Replace("Ü", "U")
                .Replace("Ç", "C")
                .Replace("'", "'").Replace("'", "'").Replace(""", "\"").Replace(""", "\"")
                .Replace("–", "-").Replace("—", "-")
                .Replace("\r", " ").Replace("\n", " ")
                .Replace("\t", " ");

            // ✅ API Santander: Remover caracteres especiais (só aceita alfanumérico e espaços)
            // Remove: . - & / \ ( ) [ ] { } @ # $ % * + = ! ? : ; , < > | _ ~ ` ^ ' "
            normalizado = normalizado
                .Replace(".", " ")      // Ponto → Ex: "LTDA." vira "LTDA"
                .Replace("-", " ")      // Hífen → Ex: "EMPRESA-SP" vira "EMPRESA SP"
                .Replace("&", "E")      // E comercial → "A & B" vira "A E B"
                .Replace("/", " ")      // Barra
                .Replace("\\", " ")     // Barra invertida
                .Replace("(", " ")      // Parênteses
                .Replace(")", " ")
                .Replace("[", " ")      // Colchetes
                .Replace("]", " ")
                .Replace("{", " ")      // Chaves
                .Replace("}", " ")
                .Replace("@", " ")      // Arroba
                .Replace("#", " ")      // Hashtag
                .Replace("$", " ")      // Cifrão
                .Replace("%", " ")      // Porcentagem
                .Replace("*", " ")      // Asterisco
                .Replace("+", " ")      // Mais
                .Replace("=", " ")      // Igual
                .Replace("!", " ")      // Exclamação
                .Replace("?", " ")      // Interrogação
                .Replace(":", " ")      // Dois pontos
                .Replace(";", " ")      // Ponto e vírgula
                .Replace(",", " ")      // Vírgula
                .Replace("<", " ")      // Menor que
                .Replace(">", " ")      // Maior que
                .Replace("|", " ")      // Pipe
                .Replace("_", " ")      // Underscore
                .Replace("~", " ")      // Til
                .Replace("`", " ")      // Crase
                .Replace("^", " ")      // Circunflexo
                .Replace("'", " ")      // Aspas simples
                .Replace("\"", " ");    // Aspas duplas

            // Remove espaços múltiplos e trim
            while (normalizado.Contains("  "))
            {
                normalizado = normalizado.Replace("  ", " ");
            }

            return normalizado.Trim();
        }

        private string TruncarTexto(string texto, int maxLength)
        {
            if (string.IsNullOrEmpty(texto)) return "";

            if (texto.Length <= maxLength)
            {
                return texto;
            }

            // Truncar e adicionar indicador
            var truncado = texto.Substring(0, maxLength);
            _logger.LogWarning("⚠️ Texto truncado de {Original} para {Max} caracteres: '{Texto}'",
                texto.Length, maxLength, truncado);

            return truncado;
        }

        private async Task<Boleto> CriarBoletoFromDTO(CreateBoletoDTO dto, Contrato contrato, string nsuCode, DateTime nsuDate)
        {
            // Determinar dados do pagador
            var (nomeCliente, tipoDoc, numeroDoc, endereco) = ObterDadosCliente(contrato.Cliente);

            // Truncar textos para respeitar limites do banco de dados
            var payerNameTruncado = TruncarTexto(LimparTexto(nomeCliente), 40);
            var payerAddressTruncado = TruncarTexto(LimparTexto(endereco?.Logradouro ?? "Endereco nao informado"), 40);
            var payerNeighborhoodTruncado = TruncarTexto(LimparTexto(endereco?.Bairro ?? "Bairro nao informado"), 30);
            var payerCityTruncado = TruncarTexto(LimparTexto(endereco?.Cidade ?? "Cidade nao informada"), 20);

            _logger.LogInformation("📝 Nome truncado: '{Original}' → '{Truncado}'", nomeCliente, payerNameTruncado);

            var boleto = new Boleto
            {
                ContratoId = dto.ContratoId,
                NsuCode = nsuCode,
                NsuDate = nsuDate,
                CovenantCode = _configuration["SantanderAPI:CovenantCode"] ?? "0596794",
                BankNumber = GerarNossoNumero(), // Gerar número único para cada boleto
                ClientNumber = !string.IsNullOrWhiteSpace(dto.ClientNumber) ? dto.ClientNumber.Replace("-", "") : await GerarClientNumberAsync(),
                DueDate = dto.DueDate,
                IssueDate = DateTime.Today,
                NominalValue = dto.NominalValue,
                DocumentKind = "DUPLICATA_MERCANTIL",

                // Dados do pagador (sanitizados e truncados)
                PayerName = payerNameTruncado,
                PayerDocumentType = tipoDoc,
                PayerDocumentNumber = TruncarTexto(
                    numeroDoc?.Replace(".", "").Replace("-", "").Replace("/", "") ?? "00000000000",
                    15
                ),
                PayerAddress = payerAddressTruncado,
                PayerNeighborhood = payerNeighborhoodTruncado,
                PayerCity = payerCityTruncado,
                PayerState = !string.IsNullOrWhiteSpace(endereco?.Estado) ? endereco.Estado.ToUpper() : "SP",
                PayerZipCode = FormatarCep(endereco?.Cep),

                // Configurações opcionais
                FinePercentage = dto.FinePercentage,
                FineQuantityDays = dto.FineQuantityDays,
                InterestPercentage = dto.InterestPercentage,
                DeductionValue = dto.DeductionValue,
                WriteOffQuantityDays = dto.WriteOffQuantityDays,

                // Mensagens
                Messages = dto.Messages != null && dto.Messages.Any() ?
                    JsonSerializer.Serialize(dto.Messages) : null,

                Status = "PENDENTE"
            };

            return boleto;
        }

        private (string nome, string tipoDoc, string numeroDoc, Endereco? endereco) ObterDadosCliente(Cliente cliente)
        {
            _logger.LogInformation("🔍 ObterDadosCliente: ClienteId={ClienteId}, TipoPessoa={TipoPessoa}",
                cliente.Id, cliente.TipoPessoa);

            if (cliente.PessoaFisica != null)
            {
                _logger.LogInformation("✅ Cliente é Pessoa Física: {Nome}", cliente.PessoaFisica.Nome);
                return (
                    cliente.PessoaFisica.Nome,
                    "CPF",
                    cliente.PessoaFisica.Cpf,
                    cliente.PessoaFisica.Endereco
                );
            }
            else if (cliente.PessoaJuridica != null)
            {
                _logger.LogInformation("✅ Cliente é Pessoa Jurídica: {RazaoSocial}", cliente.PessoaJuridica.RazaoSocial);
                return (
                    cliente.PessoaJuridica.RazaoSocial,
                    "CNPJ",
                    cliente.PessoaJuridica.Cnpj,
                    cliente.PessoaJuridica.Endereco
                );
            }
            else
            {
                _logger.LogError("❌ Cliente {ClienteId} não possui PessoaFisica nem PessoaJuridica associada!", cliente.Id);
                _logger.LogError("❌ TipoPessoa: {TipoPessoa}, PessoaFisicaId: {PFId}, PessoaJuridicaId: {PJId}",
                    cliente.TipoPessoa, cliente.PessoaFisicaId, cliente.PessoaJuridicaId);
                throw new InvalidOperationException(
                    $"Cliente {cliente.Id} deve ter pessoa física ou jurídica associada. " +
                    $"TipoPessoa={cliente.TipoPessoa}, PFId={cliente.PessoaFisicaId}, PJId={cliente.PessoaJuridicaId}"
                );
            }
        }

        private string GerarNossoNumero()
        {
            // Gerar nosso número baseado em timestamp + random
            var timestamp = DateTimeOffset.UtcNow.ToUnixTimeSeconds();
            var random = new Random().Next(100, 999);
            return $"{timestamp}{random}".Substring(0, 13); // Máximo 13 caracteres
        }

        private async Task<string> GerarClientNumberAsync()
        {
            try
            {
                // Buscar o último ClientNumber usado
                var ultimoBoleto = await _context.Boletos
                    .Where(b => !string.IsNullOrEmpty(b.ClientNumber))
                    .OrderByDescending(b => b.Id)
                    .FirstOrDefaultAsync();

                if (ultimoBoleto != null && !string.IsNullOrEmpty(ultimoBoleto.ClientNumber))
                {
                    // Limpar hífens do ClientNumber existente
                    var clientNumberLimpo = ultimoBoleto.ClientNumber.Replace("-", "");

                    // Tentar extrair número do ClientNumber (ex: CONT148 → 148)
                    var apenasNumeros = new string(clientNumberLimpo.Where(char.IsDigit).ToArray());

                    if (int.TryParse(apenasNumeros, out int numeroAtual))
                    {
                        var proximoNumero = numeroAtual + 1;
                        return $"CONT{proximoNumero}";
                    }
                }

                // Se não encontrou, começar do 1
                return "CONT1";
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "❌ Erro ao gerar ClientNumber, usando fallback");
                // Fallback: usar timestamp para garantir unicidade
                return $"CONT{DateTimeOffset.UtcNow.ToUnixTimeSeconds().ToString().Substring(5)}";
            }
        }

        private string FormatarCep(string? cep)
        {
            if (string.IsNullOrWhiteSpace(cep))
            {
                return "00000-000"; // CEP padrão
            }

            // Remover tudo que não é número
            var apenasNumeros = new string(cep.Where(char.IsDigit).ToArray());

            // Garantir 8 dígitos
            if (apenasNumeros.Length < 8)
            {
                apenasNumeros = apenasNumeros.PadLeft(8, '0');
            }
            else if (apenasNumeros.Length > 8)
            {
                apenasNumeros = apenasNumeros.Substring(0, 8);
            }

            // Formatar como 00000-000
            return $"{apenasNumeros.Substring(0, 5)}-{apenasNumeros.Substring(5, 3)}";
        }

        private void AtualizarBoletoComResposta(Boleto boleto, SantanderBoletoResponse response)
        {
            boleto.BarCode = response.barCode;
            boleto.DigitableLine = response.digitableLine;
            boleto.QrCodePix = response.qrCodePix;
            boleto.QrCodeUrl = response.qrCodeUrl;

            if (DateTime.TryParse(response.entryDate, out DateTime entryDate))
            {
                boleto.EntryDate = entryDate;
            }

            // Atualizar status se o boleto foi liquidado
            if (!string.IsNullOrEmpty(response.Status))
            {
                // A API Santander pode retornar diferentes valores para status liquidado
                var statusLiquidado = new[] { "LIQUIDADO", "PAID", "SETTLED", "PAGO" };
                if (statusLiquidado.Any(s => response.Status.Equals(s, StringComparison.OrdinalIgnoreCase)))
                {
                    _logger.LogInformation("✅ Boleto ID {BoletoId} foi LIQUIDADO. Status da API: {Status}", boleto.Id, response.Status);
                    boleto.Status = "LIQUIDADO";

                    // Atualizar data de liquidação se disponível
                    if (!string.IsNullOrEmpty(response.SettlementDate) && DateTime.TryParse(response.SettlementDate, out DateTime settlementDate))
                    {
                        boleto.DataAtualizacao = settlementDate;
                        _logger.LogInformation("📅 Data de liquidação: {SettlementDate}", settlementDate);
                    }
                }
            }

            boleto.DataAtualizacao = DateTime.UtcNow;
        }

        private BoletoResponseDTO MapearBoletoParaResponse(Boleto boleto)
        {
            var response = new BoletoResponseDTO
            {
                Id = boleto.Id,
                ContratoId = boleto.ContratoId,
                NsuCode = boleto.NsuCode,
                NsuDate = boleto.NsuDate,
                CovenantCode = boleto.CovenantCode,
                BankNumber = boleto.BankNumber,
                ClientNumber = boleto.ClientNumber,
                DueDate = boleto.DueDate,
                IssueDate = boleto.IssueDate,
                NominalValue = boleto.NominalValue,
                DocumentKind = boleto.DocumentKind,
                Status = boleto.Status,
                PayerName = boleto.PayerName,
                PayerDocumentType = boleto.PayerDocumentType,
                PayerDocumentNumber = boleto.PayerDocumentNumber,
                PayerAddress = boleto.PayerAddress,
                PayerNeighborhood = boleto.PayerNeighborhood,
                PayerCity = boleto.PayerCity,
                PayerState = boleto.PayerState,
                PayerZipCode = boleto.PayerZipCode,
                BarCode = boleto.BarCode,
                DigitableLine = boleto.DigitableLine,
                EntryDate = boleto.EntryDate,
                QrCodePix = boleto.QrCodePix,
                QrCodeUrl = boleto.QrCodeUrl,
                DataCadastro = boleto.DataCadastro,
                DataAtualizacao = boleto.DataAtualizacao,
                ErrorCode = boleto.ErrorCode,
                ErrorMessage = boleto.ErrorMessage,
                TraceId = boleto.TraceId
            };

            // Adicionar informações do contrato se disponível
            if (boleto.Contrato != null)
            {
                var clienteNome = boleto.Contrato.Cliente?.PessoaFisica?.Nome ??
                                 boleto.Contrato.Cliente?.PessoaJuridica?.RazaoSocial ??
                                 "Cliente não informado";

                var clienteDoc = boleto.Contrato.Cliente?.PessoaFisica?.Cpf ??
                                boleto.Contrato.Cliente?.PessoaJuridica?.Cnpj ??
                                "Documento não informado";

                var filialNome = boleto.Contrato.Cliente?.Filial?.Nome ?? "Sem filial";

                response.Contrato = new ContratoInfoDTO
                {
                    Id = boleto.Contrato.Id,
                    NumeroContrato = $"CONT-{boleto.Contrato.Id}",
                    ClienteNome = clienteNome,
                    ClienteDocumento = clienteDoc,
                    ValorContrato = boleto.Contrato.ValorNegociado,
                    FilialNome = filialNome
                };
            }

            return response;
        }

        // GET: api/Boleto/{id}/status
        [HttpGet("{id}/status")]
        public async Task<ActionResult<BoletoStatusResponseDTO>> ConsultarStatusBoleto(int id)
        {
            try
            {
                _logger.LogInformation("🔍 Consultando status do boleto ID: {BoletoId}", id);

                var boleto = await _context.Boletos.FindAsync(id);

                if (boleto == null)
                {
                    return NotFound(new { mensagem = $"Boleto com ID {id} não encontrado." });
                }

                if (string.IsNullOrEmpty(boleto.BankNumber))
                {
                    return BadRequest(new { mensagem = "Boleto não possui BankNumber válido para consulta de status." });
                }

                var beneficiaryCode = _configuration["SantanderAPI:CovenantCode"] ?? "0596794";

                _logger.LogInformation("📄 BankNumber: {BankNumber}, BeneficiaryCode: {BeneficiaryCode}", boleto.BankNumber, beneficiaryCode);

                // Consultar status usando Nosso Número
                var statusResponse = await _santanderService.ConsultarStatusPorNossoNumeroAsync(beneficiaryCode, boleto.BankNumber);

                _logger.LogInformation("✅ Status consultado com sucesso: {Status}", statusResponse.Status);

                // ✅ ATUALIZAR STATUS NO BANCO DE DADOS
                await AtualizarStatusBoletoNoBanco(boleto, statusResponse);

                return Ok(statusResponse);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "❌ Erro ao consultar status do boleto ID: {BoletoId}", id);
                return StatusCode(500, new
                {
                    mensagem = "Erro ao consultar status do boleto",
                    detalhes = ex.Message,
                    tipo = ex.GetType().Name
                });
            }
        }

        // GET: api/Boleto/status/nosso-numero?beneficiaryCode=xxx&bankNumber=xxx
        [HttpGet("status/nosso-numero")]
        public async Task<ActionResult<BoletoStatusResponseDTO>> ConsultarStatusPorNossoNumero(
            [FromQuery] string beneficiaryCode,
            [FromQuery] string bankNumber)
        {
            try
            {
                if (string.IsNullOrWhiteSpace(beneficiaryCode) || string.IsNullOrWhiteSpace(bankNumber))
                {
                    return BadRequest(new { mensagem = "beneficiaryCode e bankNumber são obrigatórios." });
                }

                _logger.LogInformation("🔍 Consultando status por Nosso Número - BeneficiaryCode: {BeneficiaryCode}, BankNumber: {BankNumber}",
                    beneficiaryCode, bankNumber);

                var statusResponse = await _santanderService.ConsultarStatusPorNossoNumeroAsync(beneficiaryCode, bankNumber);

                _logger.LogInformation("✅ Status consultado com sucesso: {Status}", statusResponse.Status);

                return Ok(statusResponse);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "❌ Erro ao consultar status por Nosso Número");
                return StatusCode(500, new
                {
                    mensagem = "Erro ao consultar status do boleto",
                    detalhes = ex.Message,
                    tipo = ex.GetType().Name
                });
            }
        }

        // GET: api/Boleto/status/seu-numero?beneficiaryCode=xxx&clientNumber=xxx&dueDate=2023-01-01&nominalValue=100.00
        [HttpGet("status/seu-numero")]
        public async Task<ActionResult<BoletoStatusResponseDTO>> ConsultarStatusPorSeuNumero(
            [FromQuery] string beneficiaryCode,
            [FromQuery] string clientNumber,
            [FromQuery] string dueDate,
            [FromQuery] decimal nominalValue)
        {
            try
            {
                if (string.IsNullOrWhiteSpace(beneficiaryCode) || string.IsNullOrWhiteSpace(clientNumber) ||
                    string.IsNullOrWhiteSpace(dueDate))
                {
                    return BadRequest(new { mensagem = "beneficiaryCode, clientNumber, dueDate e nominalValue são obrigatórios." });
                }

                if (!DateTime.TryParse(dueDate, out DateTime parsedDueDate))
                {
                    return BadRequest(new { mensagem = "dueDate deve estar no formato YYYY-MM-DD." });
                }

                _logger.LogInformation("🔍 Consultando status por Seu Número - BeneficiaryCode: {BeneficiaryCode}, ClientNumber: {ClientNumber}, DueDate: {DueDate}, Value: {Value}",
                    beneficiaryCode, clientNumber, parsedDueDate, nominalValue);

                var statusResponse = await _santanderService.ConsultarStatusPorSeuNumeroAsync(
                    beneficiaryCode, clientNumber, parsedDueDate, nominalValue);

                _logger.LogInformation("✅ Status consultado com sucesso: {Status}", statusResponse.Status);

                return Ok(statusResponse);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "❌ Erro ao consultar status por Seu Número");
                return StatusCode(500, new
                {
                    mensagem = "Erro ao consultar status do boleto",
                    detalhes = ex.Message,
                    tipo = ex.GetType().Name
                });
            }
        }

        // GET: api/Boleto/status/por-tipo/{billId}?tipoConsulta=default
        [HttpGet("status/por-tipo/{billId}")]
        public async Task<ActionResult<BoletoStatusResponseDTO>> ConsultarStatusPorTipo(
            string billId,
            [FromQuery] string tipoConsulta = "default")
        {
            try
            {
                if (string.IsNullOrWhiteSpace(billId))
                {
                    return BadRequest(new { mensagem = "billId é obrigatório (formato: beneficiaryCode.bankNumber)." });
                }

                // Validar tipo de consulta
                var tiposValidos = new[] { "default", "duplicate", "bankslip", "settlement", "registry" };
                if (!tiposValidos.Contains(tipoConsulta.ToLower()))
                {
                    return BadRequest(new
                    {
                        mensagem = "tipoConsulta inválido.",
                        valoresPermitidos = tiposValidos,
                        descricoes = new
                        {
                            @default = "Pesquisa padrão, trazendo somente dados básicos do boleto",
                            duplicate = "Pesquisa de dados para emissão de segunda via de boleto",
                            bankslip = "Pesquisa para dados completos do boleto",
                            settlement = "Pesquisa para informações de baixas/liquidações do boleto",
                            registry = "Pesquisa de informações de cartório no boleto"
                        }
                    });
                }

                _logger.LogInformation("🔍 Consultando status por Tipo - BillId: {BillId}, TipoConsulta: {TipoConsulta}",
                    billId, tipoConsulta);

                var statusResponse = await _santanderService.ConsultarStatusPorTipoAsync(billId, tipoConsulta);

                _logger.LogInformation("✅ Status consultado com sucesso: {Status}", statusResponse.Status);

                return Ok(statusResponse);
            }
            catch (ArgumentException argEx)
            {
                _logger.LogWarning(argEx, "⚠️ Argumento inválido na consulta por tipo");
                return BadRequest(new { mensagem = argEx.Message });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "❌ Erro ao consultar status por Tipo");
                return StatusCode(500, new
                {
                    mensagem = "Erro ao consultar status do boleto",
                    detalhes = ex.Message,
                    tipo = ex.GetType().Name
                });
            }
        }

        // GET: api/Boleto/{id}/pdf
        [HttpGet("{id}/pdf")]
        public async Task<IActionResult> BaixarPdfBoleto(int id)
        {
            try
            {
                _logger.LogInformation("📄 Baixando PDF do boleto ID: {BoletoId}", id);

                var boleto = await _context.Boletos
                    .Include(b => b.Contrato)
                        .ThenInclude(c => c.Cliente)
                            .ThenInclude(cl => cl.PessoaFisica)
                    .Include(b => b.Contrato)
                        .ThenInclude(c => c.Cliente)
                            .ThenInclude(cl => cl.PessoaJuridica)
                    .FirstOrDefaultAsync(b => b.Id == id);

                if (boleto == null)
                {
                    return NotFound(new { mensagem = $"Boleto com ID {id} não encontrado." });
                }

                if (string.IsNullOrEmpty(boleto.BankNumber))
                {
                    return BadRequest(new { mensagem = "Boleto não possui BankNumber válido para download do PDF." });
                }

                var covenantCode = _configuration["SantanderAPI:CovenantCode"] ?? "0596794";

                _logger.LogInformation("📄 BankNumber: {BankNumber}, CovenantCode: {CovenantCode}", boleto.BankNumber, covenantCode);

                // Obter link do PDF da API Santander
                _logger.LogInformation("📄 Obtendo link do PDF da API Santander...");
                var pdfLink = await _santanderService.BaixarPdfBoletoAsync(boleto.BankNumber, covenantCode, boleto.PayerDocumentNumber);

                _logger.LogInformation("✅ Link do PDF obtido: {PdfLink}", pdfLink);

                // Baixar o PDF do link fornecido pelo Santander
                _logger.LogInformation("📥 Baixando arquivo PDF do link...");
                var httpClient = new HttpClient();
                httpClient.Timeout = TimeSpan.FromSeconds(30);

                var pdfBytes = await httpClient.GetByteArrayAsync(pdfLink);

                _logger.LogInformation("✅ PDF baixado com sucesso. Tamanho: {Size} bytes", pdfBytes.Length);

                // Gerar nome padronizado do arquivo
                var clienteNome = boleto.PayerName ??
                                 boleto.Contrato?.Cliente?.PessoaFisica?.Nome ??
                                 boleto.Contrato?.Cliente?.PessoaJuridica?.RazaoSocial ??
                                 "Cliente";

                // Limpar nome do cliente (remover caracteres inválidos)
                clienteNome = LimparNomeArquivo(clienteNome);

                var dataVencimento = boleto.DueDate.ToString("yyyy-MM-dd");
                var nomeArquivo = $"Boleto_{id}_{clienteNome}_{dataVencimento}.pdf";

                _logger.LogInformation("📄 Nome do arquivo: {NomeArquivo}", nomeArquivo);

                // Retornar o PDF diretamente com headers apropriados
                return File(pdfBytes, "application/pdf", nomeArquivo);
            }
            catch (HttpRequestException httpEx)
            {
                _logger.LogError(httpEx, "❌ Erro HTTP ao baixar PDF do Santander para boleto ID: {BoletoId}", id);
                return StatusCode(500, new {
                    mensagem = "Erro ao comunicar com a API Santander",
                    detalhes = $"Não foi possível baixar o PDF. Verifique se o boleto foi registrado corretamente no Santander. Erro: {httpEx.Message}",
                    tipo = "HttpRequestException"
                });
            }
            catch (TaskCanceledException timeoutEx)
            {
                _logger.LogError(timeoutEx, "❌ Timeout ao baixar PDF do Santander para boleto ID: {BoletoId}", id);
                return StatusCode(500, new {
                    mensagem = "Timeout ao baixar PDF",
                    detalhes = "A requisição para a API Santander demorou muito tempo. Tente novamente.",
                    tipo = "TimeoutException"
                });
            }
            catch (InvalidOperationException invalidOpEx) when (invalidOpEx.Message.Contains("access token"))
            {
                _logger.LogError(invalidOpEx, "❌ Erro de autenticação ao baixar PDF do boleto ID: {BoletoId}", id);
                return StatusCode(500, new {
                    mensagem = "Erro de autenticação com a API Santander",
                    detalhes = invalidOpEx.Message + " Verifique se o certificado mTLS está configurado corretamente.",
                    tipo = "AuthenticationException",
                    innerException = invalidOpEx.InnerException?.Message
                });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "❌ Erro geral ao baixar PDF do boleto ID: {BoletoId}. Tipo: {ExType}. StackTrace: {StackTrace}",
                    id, ex.GetType().Name, ex.StackTrace);
                return StatusCode(500, new {
                    mensagem = "Erro interno do servidor",
                    detalhes = ex.Message,
                    tipo = ex.GetType().Name,
                    innerException = ex.InnerException?.Message
                });
            }
        }

        private string LimparNomeArquivo(string nome)
        {
            if (string.IsNullOrWhiteSpace(nome))
                return "SemNome";

            // Remover caracteres inválidos para nomes de arquivo
            var caracteresInvalidos = Path.GetInvalidFileNameChars();
            var nomeLimpo = new string(nome
                .Where(c => !caracteresInvalidos.Contains(c))
                .ToArray());

            // Substituir espaços por underscore e limitar tamanho
            nomeLimpo = nomeLimpo.Replace(" ", "_");

            // Limitar a 50 caracteres
            if (nomeLimpo.Length > 50)
            {
                nomeLimpo = nomeLimpo.Substring(0, 50);
            }

            return string.IsNullOrWhiteSpace(nomeLimpo) ? "Cliente" : nomeLimpo;
        }

        /// <summary>
        /// Atualiza o status do boleto no banco de dados com base na resposta da API Santander
        /// </summary>
        private async Task AtualizarStatusBoletoNoBanco(Boleto boleto, BoletoStatusResponseDTO statusResponse)
        {
            try
            {
                var statusAnterior = boleto.Status;

                // Atualizar Status principal
                if (!string.IsNullOrEmpty(statusResponse.Status))
                {
                    boleto.Status = statusResponse.Status.ToUpper();
                    _logger.LogInformation("📝 Atualizando status do boleto ID {BoletoId}: {StatusAnterior} → {StatusNovo}",
                        boleto.Id, statusAnterior, boleto.Status);
                }

                // Atualizar campos relacionados ao pagamento
                if (statusResponse.PaidValue.HasValue && statusResponse.PaidValue > 0)
                {
                    _logger.LogInformation("💰 Boleto ID {BoletoId} foi pago. Valor: R$ {Valor}",
                        boleto.Id, statusResponse.PaidValue);
                }

                // Atualizar data de liquidação
                if (!string.IsNullOrEmpty(statusResponse.SettlementDate) &&
                    DateTime.TryParse(statusResponse.SettlementDate, out DateTime settlementDate))
                {
                    boleto.DataAtualizacao = settlementDate;
                    _logger.LogInformation("📅 Data de liquidação atualizada: {Data}", settlementDate);
                }
                else
                {
                    boleto.DataAtualizacao = DateTime.UtcNow;
                }

                // Atualizar campos adicionais se disponíveis
                if (!string.IsNullOrEmpty(statusResponse.BarCode) && string.IsNullOrEmpty(boleto.BarCode))
                {
                    boleto.BarCode = statusResponse.BarCode;
                }

                if (!string.IsNullOrEmpty(statusResponse.DigitableLine) && string.IsNullOrEmpty(boleto.DigitableLine))
                {
                    boleto.DigitableLine = statusResponse.DigitableLine;
                }

                if (!string.IsNullOrEmpty(statusResponse.QrCodePix) && string.IsNullOrEmpty(boleto.QrCodePix))
                {
                    boleto.QrCodePix = statusResponse.QrCodePix;
                }

                if (!string.IsNullOrEmpty(statusResponse.QrCodeUrl) && string.IsNullOrEmpty(boleto.QrCodeUrl))
                {
                    boleto.QrCodeUrl = statusResponse.QrCodeUrl;
                }

                // Salvar no banco de dados
                await _context.SaveChangesAsync();

                _logger.LogInformation("✅ Status do boleto ID {BoletoId} atualizado com sucesso no banco de dados", boleto.Id);

                // Log especial para mudanças importantes
                if (statusAnterior != boleto.Status)
                {
                    if (boleto.Status == "LIQUIDADO" || boleto.Status == "BAIXADO")
                    {
                        _logger.LogInformation("🎉 BOLETO PAGO! ID: {BoletoId}, Status: {Status}, NSU: {NsuCode}",
                            boleto.Id, boleto.Status, boleto.NsuCode);
                    }
                    else if (boleto.Status == "CANCELADO")
                    {
                        _logger.LogInformation("❌ Boleto CANCELADO! ID: {BoletoId}, NSU: {NsuCode}",
                            boleto.Id, boleto.NsuCode);
                    }
                }
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "❌ Erro ao atualizar status do boleto ID {BoletoId} no banco de dados", boleto.Id);
                throw;
            }
        }

        #endregion

        #region Mapas de Faturamento

        // GET: api/Boleto/mapas-faturamento
        [HttpGet("mapas-faturamento")]
        public async Task<ActionResult<object>> GetMapasFaturamento()
        {
            try
            {
                _logger.LogInformation("🗺️ GetMapasFaturamento: Iniciando busca de mapas de faturamento");

                // Obter usuário logado
                var usuarioIdHeader = Request.Headers["X-Usuario-Id"].FirstOrDefault();
                if (!int.TryParse(usuarioIdHeader, out int usuarioId))
                {
                    _logger.LogWarning("❌ GetMapasFaturamento: Usuário não identificado");
                    return Unauthorized("Usuário não identificado na requisição.");
                }

                // Buscar filiais com clientes e contratos (ordenadas alfabeticamente)
                var filiaisQuery = _context.Filiais
                    .Where(f => f.Id > 0)
                    .OrderBy(f => f.Nome);

                // Aplicar filtros por permissões de usuário
                var usuario = await _context.Usuarios
                    .Include(u => u.GrupoAcesso)
                    .Include(u => u.Filial)
                    .FirstOrDefaultAsync(u => u.Id == usuarioId);

                if (usuario == null)
                {
                    return Unauthorized("Usuário não encontrado.");
                }

                IQueryable<Filial> filialsFiltradas = filiaisQuery;

                // Se usuário é Gestor de Filial, filtrar apenas sua filial
                if (usuario.GrupoAcesso?.Nome == "Gestor de Filial" && usuario.FilialId.HasValue)
                {
                    filialsFiltradas = filiaisQuery.Where(f => f.Id == usuario.FilialId.Value);
                }

                var filiais = await filialsFiltradas.ToListAsync();

                var resultado = new List<object>();

                foreach (var filial in filiais)
                {
                    // Buscar clientes da filial
                    var clientesQuery = _context.Clientes
                        .Where(c => c.FilialId == filial.Id && c.Ativo)
                        .Include(c => c.PessoaFisica)
                        .Include(c => c.PessoaJuridica);

                    var clientesTemp = await clientesQuery.ToListAsync();

                    // Ordenar alfabeticamente em memória
                    var clientes = clientesTemp.OrderBy(c =>
                        c.TipoPessoa == "Fisica"
                            ? c.PessoaFisica?.Nome ?? ""
                            : c.PessoaJuridica?.RazaoSocial ?? ""
                    ).ToList();

                    var clientesData = new List<object>();

                    foreach (var cliente in clientes)
                    {
                        // Buscar contratos ativos do cliente para pegar os IDs
                        var contratoIds = await _context.Contratos
                            .Where(co => co.ClienteId == cliente.Id && co.Ativo)
                            .Select(co => co.Id)
                            .ToListAsync();

                        if (!contratoIds.Any()) continue; // Pular clientes sem contratos ativos

                        // Buscar TODOS os boletos do cliente de todos os contratos ativos
                        var todosBoletos = await _context.Boletos
                            .Where(b => contratoIds.Contains(b.ContratoId))
                            .Include(b => b.Contrato)
                            .OrderBy(b => b.DueDate)
                            .ToListAsync();

                        if (!todosBoletos.Any()) continue; // Pular clientes sem boletos

                        // USAR O NOME DO PAGADOR DO BOLETO (fonte mais confiável)
                        // Pegar o nome do primeiro boleto (todos boletos do mesmo cliente têm o mesmo payerName)
                        var primeiroBoleto = todosBoletos.FirstOrDefault();
                        var nomeCliente = primeiroBoleto?.PayerName ??
                            (cliente.TipoPessoa == "Fisica"
                                ? cliente.PessoaFisica?.Nome
                                : cliente.PessoaJuridica?.RazaoSocial) ?? "Cliente sem nome";

                        var documentoCliente = primeiroBoleto?.PayerDocumentNumber ??
                            (cliente.TipoPessoa == "Fisica"
                                ? cliente.PessoaFisica?.Cpf
                                : cliente.PessoaJuridica?.Cnpj) ?? "Sem documento";

                        _logger.LogInformation($"👤 Cliente ID {cliente.Id}: Nome='{nomeCliente}', Documento='{documentoCliente}' (de {todosBoletos.Count} boletos)");

                        // Agrupar boletos pagos (histórico)
                        var boletosPagos = todosBoletos
                            .Where(b => b.Status == "LIQUIDADO")
                            .Select(b => new
                            {
                                Id = b.Id,
                                ContratoId = b.ContratoId,
                                NumeroContrato = $"Contrato #{b.ContratoId}",
                                NumeroPasta = b.Contrato?.NumeroPasta,
                                NsuCode = b.NsuCode,
                                DataEmissao = b.IssueDate.ToString("dd/MM/yyyy"),
                                DataVencimento = b.DueDate.ToString("dd/MM/yyyy"),
                                DataPagamento = b.EntryDate?.ToString("dd/MM/yyyy"),
                                Valor = b.NominalValue,
                                Status = b.Status
                            })
                            .OrderByDescending(b => b.DataPagamento)
                            .ToList();

                        // Agrupar boletos à pagar (ativos)
                        var boletosAPagar = todosBoletos
                            .Where(b => b.Status != "LIQUIDADO" && b.Status != "CANCELADO")
                            .Select(b => new
                            {
                                Id = b.Id,
                                ContratoId = b.ContratoId,
                                NumeroContrato = $"Contrato #{b.ContratoId}",
                                NumeroPasta = b.Contrato?.NumeroPasta,
                                NsuCode = b.NsuCode,
                                DataEmissao = b.IssueDate.ToString("dd/MM/yyyy"),
                                DataVencimento = b.DueDate.ToString("dd/MM/yyyy"),
                                Valor = b.NominalValue,
                                Status = b.Status,
                                Vencido = b.DueDate < DateTime.Now && b.Status != "LIQUIDADO"
                            })
                            .OrderBy(b => b.DataVencimento)
                            .ToList();

                        // Adicionar cliente com seus boletos
                        clientesData.Add(new
                        {
                            ClienteId = cliente.Id,
                            Nome = nomeCliente,
                            Documento = documentoCliente,
                            TipoPessoa = cliente.TipoPessoa,
                            TotalBoletos = todosBoletos.Count,
                            TotalPagos = boletosPagos.Count,
                            TotalAPagar = boletosAPagar.Count,
                            ValorTotalPago = boletosPagos.Sum(b => b.Valor),
                            ValorTotalAPagar = boletosAPagar.Sum(b => b.Valor),
                            BoletosPagos = boletosPagos,
                            BoletosAPagar = boletosAPagar
                        });
                    }

                    if (clientesData.Any())
                    {
                        resultado.Add(new
                        {
                            FilialId = filial.Id,
                            FilialNome = filial.Nome,
                            TotalClientes = clientesData.Count,
                            Clientes = clientesData
                        });
                    }
                }

                _logger.LogInformation($"✅ GetMapasFaturamento: Retornando {resultado.Count} filiais com dados");

                return Ok(resultado);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"❌ GetMapasFaturamento: Erro completo: {ex.Message}");
                return StatusCode(500, new { erro = "Erro interno do servidor", detalhes = ex.Message });
            }
        }

        #endregion
    }
}
