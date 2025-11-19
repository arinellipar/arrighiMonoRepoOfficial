using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using CrmArrighi.Data;
using CrmArrighi.Models;

namespace CrmArrighi.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class ClienteController : ControllerBase
    {
        private readonly CrmArrighiContext _context;
        private readonly ILogger<ClienteController> _logger;

        public ClienteController(CrmArrighiContext context, ILogger<ClienteController> logger)
        {
            _context = context;
            _logger = logger;
        }

        // Método auxiliar para registrar histórico
        private async Task RegistrarHistoricoAsync(int clienteId, string tipoAcao, string descricao, string? dadosAnteriores = null, string? dadosNovos = null, int? usuarioId = null)
        {
            try
            {
                // Obter usuário ID do contexto de autenticação
                int? usuarioIdFinal = usuarioId;

                if (!usuarioIdFinal.HasValue)
                {
                    // Tentar obter do header X-Usuario-Id
                    if (HttpContext.Request.Headers.TryGetValue("X-Usuario-Id", out var headerValue) &&
                        int.TryParse(headerValue.FirstOrDefault(), out int parsedId))
                    {
                        usuarioIdFinal = parsedId;
                        _logger.LogInformation($"🔧 UsuarioId obtido do header: {usuarioIdFinal}");
                    }
                    else
                    {
                        // Tentar obter do token JWT
                        var userIdClaim = User.FindFirst("UsuarioId") ?? User.FindFirst("sub") ?? User.FindFirst("id");
                        if (userIdClaim != null && int.TryParse(userIdClaim.Value, out int claimId))
                        {
                            usuarioIdFinal = claimId;
                            _logger.LogInformation($"🔧 UsuarioId obtido do token JWT: {usuarioIdFinal}");
                        }
                    }
                }

                // Se ainda não tiver usuário, buscar o primeiro usuário ativo no sistema
                if (!usuarioIdFinal.HasValue)
                {
                    var primeiroUsuario = await _context.Usuarios.FirstOrDefaultAsync(u => u.Ativo);
                    if (primeiroUsuario != null)
                    {
                        usuarioIdFinal = primeiroUsuario.Id;
                        _logger.LogWarning($"⚠️ UsuarioId não fornecido, usando primeiro usuário ativo: {usuarioIdFinal}");
                    }
                    else
                    {
                        _logger.LogError("❌ Nenhum usuário ativo encontrado no sistema. Histórico não será registrado.");
                        return;
                    }
                }

                // Verificar se o usuário existe e obter o nome
                var usuario = await _context.Usuarios.FirstOrDefaultAsync(u => u.Id == usuarioIdFinal.Value);
                if (usuario == null)
                {
                    _logger.LogError($"❌ Usuário {usuarioIdFinal} não encontrado no banco de dados. Histórico não será registrado.");
                    return;
                }

                var historico = new HistoricoCliente
                {
                    ClienteId = clienteId,
                    TipoAcao = tipoAcao,
                    Descricao = descricao,
                    DadosAnteriores = dadosAnteriores,
                    DadosNovos = dadosNovos,
                    UsuarioId = usuarioIdFinal.Value,
                    NomeUsuario = usuario.Login, // Armazenar o nome do usuário
                    DataHora = DateTime.Now,
                    EnderecoIP = HttpContext.Connection.RemoteIpAddress?.ToString()
                };

                _context.HistoricoClientes.Add(historico);
                await _context.SaveChangesAsync();
                _logger.LogInformation($"✅ Histórico registrado com sucesso: {tipoAcao} - Cliente {clienteId} - Usuário {usuarioIdFinal}");
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"❌ Erro ao registrar histórico para cliente {clienteId}: {ex.Message}");
                _logger.LogError($"❌ Stack trace: {ex.StackTrace}");
            }
        }

        // GET: api/Cliente
        [HttpGet]
        public async Task<ActionResult<IEnumerable<Cliente>>> GetClientes()
        {
            try
            {
                Console.WriteLine("🔍 GetClientes: Buscando clientes ativos");

                // RETORNAR APENAS CLIENTES ATIVOS (soft delete)
                var clientes = await _context.Clientes
                    .Where(c => c.Ativo) // 🔥 Filtrar apenas clientes ativos
                    .Include(c => c.PessoaFisica)
                        .ThenInclude(pf => pf!.Endereco)
                    .Include(c => c.PessoaJuridica)
                        .ThenInclude(pj => pj!.Endereco)
                    .Include(c => c.Filial)
                    .ToListAsync();

                Console.WriteLine($"✅ GetClientes: Retornando {clientes.Count} clientes ativos");

                return Ok(clientes);
            }
            catch (Exception ex)
            {
                Console.WriteLine($"❌ GetClientes: Erro: {ex.Message}");
                return StatusCode(500, $"Erro interno do servidor: {ex.Message}");
            }
        }

        // GET: api/Cliente/buscar-por-cpf/{cpf}
        [HttpGet("buscar-por-cpf/{cpf}")]
        public async Task<ActionResult<Cliente>> GetClientePorCpf(string cpf)
        {
            try
            {
                Console.WriteLine($"🔍 GetClientePorCpf: Buscando cliente com CPF: {cpf}");

                // Remover caracteres especiais do CPF para busca
                var cpfLimpo = cpf.Replace(".", "").Replace("-", "").Replace(" ", "");
                Console.WriteLine($"🔍 GetClientePorCpf: CPF limpo: {cpfLimpo}");

                var cliente = await _context.Clientes
                    .Include(c => c.PessoaFisica)
                        .ThenInclude(pf => pf!.Endereco)
                    .Include(c => c.PessoaJuridica)
                        .ThenInclude(pj => pj!.Endereco)
                    .Include(c => c.Filial)
                    .FirstOrDefaultAsync(c => c.PessoaFisica != null &&
                        c.PessoaFisica.Cpf != null &&
                        c.PessoaFisica.Cpf.Replace(".", "").Replace("-", "").Replace(" ", "") == cpfLimpo);

                if (cliente == null)
                {
                    Console.WriteLine($"❌ GetClientePorCpf: Cliente com CPF {cpf} não encontrado");
                    return NotFound($"Cliente com CPF {cpf} não encontrado");
                }

                Console.WriteLine($"✅ GetClientePorCpf: Cliente encontrado: {cliente.PessoaFisica?.Nome} (ID: {cliente.Id})");
                return Ok(cliente);
            }
            catch (Exception ex)
            {
                Console.WriteLine($"❌ GetClientePorCpf: Erro: {ex.Message}");
                Console.WriteLine($"❌ GetClientePorCpf: StackTrace: {ex.StackTrace}");
                return StatusCode(500, $"Erro interno do servidor: {ex.Message}");
            }
        }

        // GET: api/Cliente/buscar-por-cnpj/{cnpj}
        [HttpGet("buscar-por-cnpj/{cnpj}")]
        public async Task<ActionResult<Cliente>> GetClientePorCnpj(string cnpj)
        {
            try
            {
                Console.WriteLine($"🔍 GetClientePorCnpj: Buscando cliente com CNPJ: {cnpj}");

                // Remover caracteres especiais do CNPJ para busca
                var cnpjLimpo = cnpj.Replace(".", "").Replace("/", "").Replace("-", "").Replace(" ", "");
                Console.WriteLine($"🔍 GetClientePorCnpj: CNPJ limpo: {cnpjLimpo}");

                var cliente = await _context.Clientes
                    .Include(c => c.PessoaFisica)
                        .ThenInclude(pf => pf!.Endereco)
                    .Include(c => c.PessoaJuridica)
                        .ThenInclude(pj => pj!.Endereco)
                    .Include(c => c.PessoaJuridica)
                        .ThenInclude(pj => pj!.ResponsavelTecnico)
                    .Include(c => c.Filial)
                    .FirstOrDefaultAsync(c => c.PessoaJuridica != null &&
                        c.PessoaJuridica.Cnpj != null &&
                        c.PessoaJuridica.Cnpj.Replace(".", "").Replace("/", "").Replace("-", "").Replace(" ", "") == cnpjLimpo);

                if (cliente == null)
                {
                    Console.WriteLine($"❌ GetClientePorCnpj: Cliente com CNPJ {cnpj} não encontrado");
                    return NotFound($"Cliente com CNPJ {cnpj} não encontrado");
                }

                Console.WriteLine($"✅ GetClientePorCnpj: Cliente encontrado: {cliente.PessoaJuridica?.RazaoSocial} (ID: {cliente.Id})");
                return Ok(cliente);
            }
            catch (Exception ex)
            {
                Console.WriteLine($"❌ GetClientePorCnpj: Erro: {ex.Message}");
                Console.WriteLine($"❌ GetClientePorCnpj: StackTrace: {ex.StackTrace}");
                return StatusCode(500, $"Erro interno do servidor: {ex.Message}");
            }
        }

        // GET: api/Cliente/buscar-por-documento/{documento}
        [HttpGet("buscar-por-documento/{documento}")]
        public async Task<ActionResult<Cliente>> GetClientePorDocumento(string documento)
        {
            try
            {
                Console.WriteLine($"🔍 GetClientePorDocumento: Buscando cliente com documento: {documento}");

                // Remover caracteres especiais do documento para busca
                var documentoLimpo = documento.Replace(".", "").Replace("/", "").Replace("-", "").Replace(" ", "");
                Console.WriteLine($"🔍 GetClientePorDocumento: Documento limpo: {documentoLimpo}");

                // Buscar tanto por CPF quanto por CNPJ
                var cliente = await _context.Clientes
                    .Include(c => c.PessoaFisica)
                        .ThenInclude(pf => pf!.Endereco)
                    .Include(c => c.PessoaJuridica)
                        .ThenInclude(pj => pj!.Endereco)
                    .Include(c => c.PessoaJuridica)
                        .ThenInclude(pj => pj!.ResponsavelTecnico)
                    .Include(c => c.Filial)
                    .FirstOrDefaultAsync(c =>
                        (c.PessoaFisica != null &&
                         c.PessoaFisica.Cpf != null &&
                         c.PessoaFisica.Cpf.Replace(".", "").Replace("-", "").Replace(" ", "") == documentoLimpo) ||
                        (c.PessoaJuridica != null &&
                         c.PessoaJuridica.Cnpj != null &&
                         c.PessoaJuridica.Cnpj.Replace(".", "").Replace("/", "").Replace("-", "").Replace(" ", "") == documentoLimpo));

                if (cliente == null)
                {
                    Console.WriteLine($"❌ GetClientePorDocumento: Cliente com documento {documento} não encontrado");
                    return NotFound($"Cliente com documento {documento} não encontrado");
                }

                var nomeCliente = cliente.PessoaFisica?.Nome ?? cliente.PessoaJuridica?.RazaoSocial ?? "Nome não encontrado";
                Console.WriteLine($"✅ GetClientePorDocumento: Cliente encontrado: {nomeCliente} (ID: {cliente.Id})");
                return Ok(cliente);
            }
            catch (Exception ex)
            {
                Console.WriteLine($"❌ GetClientePorDocumento: Erro: {ex.Message}");
                Console.WriteLine($"❌ GetClientePorDocumento: StackTrace: {ex.StackTrace}");
                return StatusCode(500, $"Erro interno do servidor: {ex.Message}");
            }
        }

        // GET: api/Cliente/{id}
        [HttpGet("{id:int}")]
        public async Task<ActionResult<Cliente>> GetCliente(int id)
        {
            var cliente = await _context.Clientes
                .Include(c => c.PessoaFisica)
                    .ThenInclude(pf => pf!.Endereco)
                .Include(c => c.PessoaJuridica)
                    .ThenInclude(pj => pj!.Endereco)
                .Include(c => c.Filial)
                .FirstOrDefaultAsync(c => c.Id == id);

            if (cliente == null)
            {
                return NotFound($"Cliente com ID {id} não encontrado.");
            }

            return cliente;
        }

        // POST: api/Cliente/test
        [HttpPost("test")]
        public async Task<ActionResult<string>> TestPost()
        {
            return Ok("POST funcionando!");
        }

        // POST: api/Cliente
        [HttpPost]
        public async Task<ActionResult<Cliente>> PostCliente(CreateClienteDTO createDto)
        {
            try
            {
                Console.WriteLine($"🔍 PostCliente: Iniciando criação de cliente");
                Console.WriteLine($"🔍 PostCliente: TipoPessoa: {createDto.TipoPessoa}, PessoaId: {createDto.PessoaId}");

                // Validar se a pessoa existe
                if (createDto.TipoPessoa.ToLower() == "fisica")
                {
                    var pessoaFisica = await _context.PessoasFisicas.FindAsync(createDto.PessoaId);
                    if (pessoaFisica == null)
                    {
                        return BadRequest($"Pessoa física com ID {createDto.PessoaId} não encontrada.");
                    }
                }
                else if (createDto.TipoPessoa.ToLower() == "juridica")
                {
                    var pessoaJuridica = await _context.PessoasJuridicas.FindAsync(createDto.PessoaId);
                    if (pessoaJuridica == null)
                    {
                        return BadRequest($"Pessoa jurídica com ID {createDto.PessoaId} não encontrada.");
                    }
                }
                else
                {
                    return BadRequest("TipoPessoa deve ser 'Fisica' ou 'Juridica'.");
                }

                // Verificar se já existe cliente para esta pessoa
                var clienteExistente = await _context.Clientes
                    .Where(c => (createDto.TipoPessoa.ToLower() == "fisica" && c.PessoaFisicaId == createDto.PessoaId) ||
                               (createDto.TipoPessoa.ToLower() == "juridica" && c.PessoaJuridicaId == createDto.PessoaId))
                    .FirstOrDefaultAsync();

                if (clienteExistente != null)
                {
                    return BadRequest("Já existe um cliente cadastrado para esta pessoa.");
                }

                // Validar filial se fornecida
                if (createDto.FilialId.HasValue)
                {
                    var filial = await _context.Filiais.FindAsync(createDto.FilialId.Value);
                    if (filial == null)
                    {
                        return BadRequest($"Filial com ID {createDto.FilialId} não encontrada.");
                    }
                }

                // Criar o cliente
                var cliente = new Cliente
                {
                    PessoaFisicaId = createDto.TipoPessoa.ToLower() == "fisica" ? createDto.PessoaId : null,
                    PessoaJuridicaId = createDto.TipoPessoa.ToLower() == "juridica" ? createDto.PessoaId : null,
                    FilialId = createDto.FilialId,
                    Status = createDto.Status ?? "Ativo",
                    Observacoes = createDto.Observacoes,
                    DataCadastro = DateTime.UtcNow
                };

                _context.Clientes.Add(cliente);
                await _context.SaveChangesAsync();

                Console.WriteLine($"✅ PostCliente: Cliente criado com ID {cliente.Id}");

                // Registrar no histórico
                var nomeCliente = cliente.PessoaFisicaId.HasValue
                    ? (await _context.PessoasFisicas.FindAsync(cliente.PessoaFisicaId))?.Nome
                    : (await _context.PessoasJuridicas.FindAsync(cliente.PessoaJuridicaId))?.RazaoSocial;

                await RegistrarHistoricoAsync(
                    cliente.Id,
                    "Criacao",
                    $"Cliente criado: {nomeCliente}",
                    null,
                    System.Text.Json.JsonSerializer.Serialize(new { cliente.Id, cliente.Status, cliente.FilialId })
                );

                // Retornar o cliente criado com includes
                var clienteCriado = await _context.Clientes
                    .Include(c => c.PessoaFisica)
                        .ThenInclude(pf => pf!.Endereco)
                    .Include(c => c.PessoaJuridica)
                        .ThenInclude(pj => pj!.Endereco)
                    .Include(c => c.Filial)
                    .FirstOrDefaultAsync(c => c.Id == cliente.Id);

                return CreatedAtAction(nameof(GetCliente), new { id = cliente.Id }, clienteCriado);
            }
            catch (Exception ex)
            {
                Console.WriteLine($"❌ PostCliente: Erro: {ex.Message}");
                Console.WriteLine($"❌ PostCliente: StackTrace: {ex.StackTrace}");
                return StatusCode(500, $"Erro interno do servidor: {ex.Message}");
            }
        }

        // PUT: api/Cliente/5
        [HttpPut("{id}")]
        public async Task<IActionResult> PutCliente(int id, CreateClienteDTO updateDto)
        {
            try
            {
                Console.WriteLine($"🔍 PutCliente: Atualizando cliente ID {id}");

                var clienteExistente = await _context.Clientes
                    .Include(c => c.PessoaFisica)
                        .ThenInclude(pf => pf!.Endereco)
                    .Include(c => c.PessoaJuridica)
                        .ThenInclude(pj => pj!.Endereco)
                    .FirstOrDefaultAsync(c => c.Id == id);

                if (clienteExistente == null)
                {
                    return NotFound($"Cliente com ID {id} não encontrado.");
                }

                // Guardar status anterior para detectar mudança de status
                var statusAnterior = clienteExistente.Status;

                // Guardar dados anteriores para histórico
                var dadosAnteriores = System.Text.Json.JsonSerializer.Serialize(new
                {
                    clienteExistente.Status,
                    clienteExistente.FilialId,
                    clienteExistente.Observacoes,
                    PessoaFisica = clienteExistente.PessoaFisica,
                    PessoaJuridica = clienteExistente.PessoaJuridica
                });

                // Atualizar campos do Cliente
                bool statusMudou = false;
                if (!string.IsNullOrEmpty(updateDto.Status) && updateDto.Status != clienteExistente.Status)
                {
                    clienteExistente.Status = updateDto.Status;
                    statusMudou = true;
                }

                if (updateDto.FilialId.HasValue)
                {
                    var filial = await _context.Filiais.FindAsync(updateDto.FilialId.Value);
                    if (filial == null)
                    {
                        return BadRequest($"Filial com ID {updateDto.FilialId} não encontrada.");
                    }
                    clienteExistente.FilialId = updateDto.FilialId;
                }

                clienteExistente.Observacoes = updateDto.Observacoes;
                clienteExistente.DataAtualizacao = DateTime.UtcNow;

                // Atualizar dados da Pessoa Física
                if (clienteExistente.TipoPessoa == "Fisica" && clienteExistente.PessoaFisica != null)
                {
                    if (!string.IsNullOrEmpty(updateDto.Nome))
                        clienteExistente.PessoaFisica.Nome = updateDto.Nome;
                    if (!string.IsNullOrEmpty(updateDto.EmailEmpresarial))
                        clienteExistente.PessoaFisica.EmailEmpresarial = updateDto.EmailEmpresarial;
                    if (!string.IsNullOrEmpty(updateDto.EmailPessoal))
                        clienteExistente.PessoaFisica.EmailPessoal = updateDto.EmailPessoal;
                    if (!string.IsNullOrEmpty(updateDto.Telefone1))
                        clienteExistente.PessoaFisica.Telefone1 = updateDto.Telefone1;
                    if (!string.IsNullOrEmpty(updateDto.Telefone2))
                        clienteExistente.PessoaFisica.Telefone2 = updateDto.Telefone2;
                    if (updateDto.DataNascimento.HasValue)
                        clienteExistente.PessoaFisica.DataNascimento = updateDto.DataNascimento;
                    if (!string.IsNullOrEmpty(updateDto.EstadoCivil))
                        clienteExistente.PessoaFisica.EstadoCivil = updateDto.EstadoCivil;
                    if (!string.IsNullOrEmpty(updateDto.Sexo))
                        clienteExistente.PessoaFisica.Sexo = updateDto.Sexo;

                    clienteExistente.PessoaFisica.DataAtualizacao = DateTime.UtcNow;

                    // Atualizar endereço se existir
                    if (clienteExistente.PessoaFisica.Endereco != null)
                    {
                        if (!string.IsNullOrEmpty(updateDto.Logradouro))
                            clienteExistente.PessoaFisica.Endereco.Logradouro = updateDto.Logradouro;
                        if (!string.IsNullOrEmpty(updateDto.Numero))
                            clienteExistente.PessoaFisica.Endereco.Numero = updateDto.Numero;
                        if (!string.IsNullOrEmpty(updateDto.Complemento))
                            clienteExistente.PessoaFisica.Endereco.Complemento = updateDto.Complemento;
                        if (!string.IsNullOrEmpty(updateDto.Bairro))
                            clienteExistente.PessoaFisica.Endereco.Bairro = updateDto.Bairro;
                        if (!string.IsNullOrEmpty(updateDto.Cidade))
                            clienteExistente.PessoaFisica.Endereco.Cidade = updateDto.Cidade;
                        if (!string.IsNullOrEmpty(updateDto.Cep))
                            clienteExistente.PessoaFisica.Endereco.Cep = updateDto.Cep;
                    }
                }
                // Atualizar dados da Pessoa Jurídica
                else if (clienteExistente.TipoPessoa == "Juridica" && clienteExistente.PessoaJuridica != null)
                {
                    if (!string.IsNullOrEmpty(updateDto.RazaoSocial))
                        clienteExistente.PessoaJuridica.RazaoSocial = updateDto.RazaoSocial;
                    if (!string.IsNullOrEmpty(updateDto.NomeFantasia))
                        clienteExistente.PessoaJuridica.NomeFantasia = updateDto.NomeFantasia;
                    if (!string.IsNullOrEmpty(updateDto.Email))
                        clienteExistente.PessoaJuridica.Email = updateDto.Email;
                    if (!string.IsNullOrEmpty(updateDto.Telefone1))
                        clienteExistente.PessoaJuridica.Telefone1 = updateDto.Telefone1;
                    if (!string.IsNullOrEmpty(updateDto.Telefone2))
                        clienteExistente.PessoaJuridica.Telefone2 = updateDto.Telefone2;
                    if (!string.IsNullOrEmpty(updateDto.Telefone3))
                        clienteExistente.PessoaJuridica.Telefone3 = updateDto.Telefone3;
                    if (!string.IsNullOrEmpty(updateDto.Telefone4))
                        clienteExistente.PessoaJuridica.Telefone4 = updateDto.Telefone4;

                    clienteExistente.PessoaJuridica.DataAtualizacao = DateTime.UtcNow;

                    // Atualizar endereço se existir
                    if (clienteExistente.PessoaJuridica.Endereco != null)
                    {
                        if (!string.IsNullOrEmpty(updateDto.Logradouro))
                            clienteExistente.PessoaJuridica.Endereco.Logradouro = updateDto.Logradouro;
                        if (!string.IsNullOrEmpty(updateDto.Numero))
                            clienteExistente.PessoaJuridica.Endereco.Numero = updateDto.Numero;
                        if (!string.IsNullOrEmpty(updateDto.Complemento))
                            clienteExistente.PessoaJuridica.Endereco.Complemento = updateDto.Complemento;
                        if (!string.IsNullOrEmpty(updateDto.Bairro))
                            clienteExistente.PessoaJuridica.Endereco.Bairro = updateDto.Bairro;
                        if (!string.IsNullOrEmpty(updateDto.Cidade))
                            clienteExistente.PessoaJuridica.Endereco.Cidade = updateDto.Cidade;
                        if (!string.IsNullOrEmpty(updateDto.Cep))
                            clienteExistente.PessoaJuridica.Endereco.Cep = updateDto.Cep;
                    }
                }

                await _context.SaveChangesAsync();

                // Registrar no histórico
                var nomeCliente = clienteExistente.TipoPessoa == "Fisica"
                    ? clienteExistente.PessoaFisica?.Nome
                    : clienteExistente.PessoaJuridica?.RazaoSocial;

                var dadosNovos = System.Text.Json.JsonSerializer.Serialize(new
                {
                    clienteExistente.Status,
                    clienteExistente.FilialId,
                    clienteExistente.Observacoes,
                    PessoaFisica = clienteExistente.PessoaFisica,
                    PessoaJuridica = clienteExistente.PessoaJuridica
                });

                // Registrar histórico apropriado baseado na mudança
                if (statusMudou)
                {
                    await RegistrarHistoricoAsync(
                        id,
                        "MudancaStatus",
                        $"Status alterado de '{statusAnterior}' para '{clienteExistente.Status}' - Cliente: {nomeCliente}",
                        dadosAnteriores,
                        dadosNovos
                    );
                }
                else
                {
                    await RegistrarHistoricoAsync(
                        id,
                        "Atualizacao",
                        $"Cliente atualizado: {nomeCliente}",
                        dadosAnteriores,
                        dadosNovos
                    );
                }

                Console.WriteLine($"✅ PutCliente: Cliente {id} atualizado com sucesso");

                // Retornar cliente atualizado completo
                var clienteAtualizado = await _context.Clientes
                    .Include(c => c.PessoaFisica)
                        .ThenInclude(pf => pf!.Endereco)
                    .Include(c => c.PessoaJuridica)
                        .ThenInclude(pj => pj!.Endereco)
                    .Include(c => c.Filial)
                    .FirstOrDefaultAsync(c => c.Id == id);

                return Ok(clienteAtualizado);
            }
            catch (Exception ex)
            {
                Console.WriteLine($"❌ PutCliente: Erro: {ex.Message}");
                Console.WriteLine($"❌ PutCliente: StackTrace: {ex.StackTrace}");
                return StatusCode(500, $"Erro interno do servidor: {ex.Message}");
            }
        }

        // DELETE: api/Cliente/5
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteCliente(int id)
        {
            try
            {
                Console.WriteLine($"🔍 DeleteCliente: Deletando cliente ID {id}");

                var cliente = await _context.Clientes
                    .Include(c => c.PessoaFisica)
                    .Include(c => c.PessoaJuridica)
                    .FirstOrDefaultAsync(c => c.Id == id);

                if (cliente == null)
                {
                    return NotFound($"Cliente com ID {id} não encontrado.");
                }

                // Soft delete - apenas marcar como inativo
                cliente.Ativo = false;
                cliente.DataAtualizacao = DateTime.UtcNow;

                await _context.SaveChangesAsync();

                // Registrar no histórico
                var nomeCliente = cliente.TipoPessoa == "Fisica"
                    ? cliente.PessoaFisica?.Nome
                    : cliente.PessoaJuridica?.RazaoSocial;

                await RegistrarHistoricoAsync(
                    id,
                    "Exclusao",
                    $"Cliente inativado: {nomeCliente}",
                    System.Text.Json.JsonSerializer.Serialize(new { Ativo = true }),
                    System.Text.Json.JsonSerializer.Serialize(new { Ativo = false })
                );

                Console.WriteLine($"✅ DeleteCliente: Cliente {id} inativado com sucesso");
                return NoContent();
            }
            catch (Exception ex)
            {
                Console.WriteLine($"❌ DeleteCliente: Erro: {ex.Message}");
                return StatusCode(500, $"Erro interno do servidor: {ex.Message}");
            }
        }

    }
}
