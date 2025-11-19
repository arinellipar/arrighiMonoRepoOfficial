using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using CrmArrighi.Data;
using CrmArrighi.Models;

// Última atualização: 08/10/2025
// Correção: Ordenação por ID ao invés de PessoaFisica.Nome para evitar erros no deploy
namespace CrmArrighi.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class ConsultorController : ControllerBase
    {
        private readonly CrmArrighiContext _context;

        public ConsultorController(CrmArrighiContext context)
        {
            _context = context;
        }

        // GET: api/Consultor/count - Contar total de consultores
        [HttpGet("count")]
        public async Task<ActionResult<int>> GetConsultoresCount()
        {
            try
            {
                var count = await _context.Consultores.CountAsync();
                Console.WriteLine($"📊 GetConsultoresCount: Total de {count} consultores");
                return Ok(count);
            }
            catch (Exception ex)
            {
                Console.WriteLine($"❌ GetConsultoresCount: Erro: {ex.Message}");
                return StatusCode(500, new { message = "Erro ao contar consultores" });
            }
        }

        // GET: api/Consultor/buscar?termo=xxx&limit=50
        [HttpGet("buscar")]
        public async Task<ActionResult<IEnumerable<Consultor>>> BuscarConsultores([FromQuery] string? termo, [FromQuery] int limit = 50)
        {
            try
            {
                Console.WriteLine($"🔍 BuscarConsultores: Buscando com termo: {termo}, limit: {limit}");

                IQueryable<Consultor> query = _context.Consultores
                    .Include(c => c.PessoaFisica)
                    .Include(c => c.Filial);

                // Se houver termo de busca, aplicar filtros
                if (!string.IsNullOrWhiteSpace(termo))
                {
                    var termoLower = termo.ToLower().Trim();
                    query = query.Where(c =>
                        (c.PessoaFisica != null && c.PessoaFisica.Nome != null && c.PessoaFisica.Nome.ToLower().Contains(termoLower)) ||
                        (c.PessoaFisica != null && c.PessoaFisica.EmailEmpresarial != null && c.PessoaFisica.EmailEmpresarial.ToLower().Contains(termoLower)) ||
                        (c.OAB != null && c.OAB.ToLower().Contains(termoLower)) ||
                        (c.Filial != null && c.Filial.Nome != null && c.Filial.Nome.ToLower().Contains(termoLower))
                    );
                }

                // Ordenar por ID para garantir consistência e performance
                var consultores = await query
                    .OrderBy(c => c.Id)
                    .Take(limit)
                    .ToListAsync();

                Console.WriteLine($"✅ BuscarConsultores: Encontrados {consultores.Count} consultores");
                return Ok(consultores);
            }
            catch (Exception ex)
            {
                Console.WriteLine($"❌ BuscarConsultores: Erro: {ex.Message}");
                return StatusCode(500, $"Erro ao buscar consultores: {ex.Message}");
            }
        }

        // GET: api/Consultor
        [HttpGet]
        public async Task<ActionResult<IEnumerable<Consultor>>> GetConsultores()
        {
            try
            {
                Console.WriteLine("🔍 GetConsultores: Buscando TODOS os consultores");

                // Buscar consultores com includes necessários
                var consultores = await _context.Consultores
                    .Include(c => c.PessoaFisica)
                    .Include(c => c.Filial)
                    .OrderBy(c => c.Id) // Ordenação simples por ID
                    .ToListAsync();

                Console.WriteLine($"✅ GetConsultores: Retornando {consultores.Count} consultores");

                // Log de verificação para debug
                if (consultores.Any())
                {
                    var primeiro = consultores.First();
                    Console.WriteLine($"📊 Exemplo de consultor: ID={primeiro.Id}, Ativo={primeiro.Ativo}, " +
                                    $"PessoaFisica={primeiro.PessoaFisica?.Nome ?? "NULL"}");
                }

                return Ok(consultores);
            }
            catch (Exception ex)
            {
                Console.WriteLine($"❌ GetConsultores: Erro: {ex.Message}");
                Console.WriteLine($"❌ StackTrace: {ex.StackTrace}");
                return StatusCode(500, $"Erro interno do servidor: {ex.Message}");
            }
        }

        // GET: api/Consultor/{id}
        [HttpGet("{id}")]
        public async Task<ActionResult<Consultor>> GetConsultor(int id)
        {
            try
            {
                var consultor = await _context.Consultores
                    .Include(c => c.PessoaFisica)
                        .ThenInclude(pf => pf.Endereco)  // ✅ Removido ! perigoso
                    .Include(c => c.Filial)
                    .FirstOrDefaultAsync(c => c.Id == id);

                if (consultor == null)
                {
                    return NotFound(new {
                        recurso = "Consultor",
                        id = id,
                        mensagem = $"Consultor #{id} não foi encontrado"
                    });
                }

                return consultor;
            }
            catch (Exception ex)
            {
                Console.WriteLine($"❌ GetConsultor: Erro ao buscar consultor {id}: {ex.Message}");
                return StatusCode(500, $"Erro interno ao buscar consultor: {ex.Message}");
            }
        }

        // POST: api/Consultor
        [HttpPost]
        public async Task<ActionResult<Consultor>> CreateConsultor([FromBody] CreateConsultorDTO dto)
        {
            try
            {
                Console.WriteLine($"🆕 CreateConsultor: Criando novo consultor");
                Console.WriteLine($"   - PessoaFisicaId: {dto.PessoaFisicaId}");
                Console.WriteLine($"   - FilialId: {dto.FilialId}");
                Console.WriteLine($"   - OAB: {dto.OAB}");

                // Validar dados obrigatórios (ModelState já valida via DataAnnotations)
                if (!ModelState.IsValid)
                {
                    Console.WriteLine($"❌ CreateConsultor: ModelState inválido");
                    return BadRequest(ModelState);
                }

                // Verificar se a pessoa física existe
                var pessoaFisica = await _context.PessoasFisicas.FindAsync(dto.PessoaFisicaId);
                if (pessoaFisica == null)
                {
                    return BadRequest(new { message = "Pessoa física não encontrada" });
                }

                // Verificar se a filial existe
                var filial = await _context.Filiais.FindAsync(dto.FilialId);
                if (filial == null)
                {
                    return BadRequest(new { message = "Filial não encontrada" });
                }

                // Verificar se já existe um consultor vinculado a esta pessoa física
                var consultorExistente = await _context.Consultores
                    .FirstOrDefaultAsync(c => c.PessoaFisicaId == dto.PessoaFisicaId);
                if (consultorExistente != null)
                {
                    return BadRequest(new { message = "Já existe um consultor vinculado a esta pessoa física" });
                }

                // Criar o consultor a partir do DTO
                var consultor = new Consultor
                {
                    PessoaFisicaId = dto.PessoaFisicaId,
                    FilialId = dto.FilialId,
                    OAB = dto.OAB,
                    Ativo = true,
                    DataCadastro = DateTime.UtcNow,
                    DataAtualizacao = DateTime.UtcNow
                };

                _context.Consultores.Add(consultor);
                await _context.SaveChangesAsync();

                // Buscar o consultor criado com os includes
                var consultorCriado = await _context.Consultores
                    .Include(c => c.PessoaFisica)
                    .Include(c => c.Filial)
                    .FirstOrDefaultAsync(c => c.Id == consultor.Id);

                Console.WriteLine($"✅ CreateConsultor: Consultor criado com ID {consultor.Id}");

                return CreatedAtAction(nameof(GetConsultor), new { id = consultor.Id }, consultorCriado);
            }
            catch (Exception ex)
            {
                Console.WriteLine($"❌ CreateConsultor: Erro: {ex.Message}");
                Console.WriteLine($"   Stack trace: {ex.StackTrace}");
                return StatusCode(500, new { message = $"Erro ao criar consultor: {ex.Message}" });
            }
        }

        // PUT: api/Consultor/{id}
        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateConsultor(int id, [FromBody] UpdateConsultorDTO dto)
        {
            try
            {
                Console.WriteLine($"📝 UpdateConsultor: Atualizando consultor {id}");

                if (id != dto.Id)
                {
                    return BadRequest(new { message = "ID do consultor não corresponde" });
                }

                // Validar ModelState
                if (!ModelState.IsValid)
                {
                    Console.WriteLine($"❌ UpdateConsultor: ModelState inválido");
                    return BadRequest(ModelState);
                }

                var consultorExistente = await _context.Consultores.FindAsync(id);
                if (consultorExistente == null)
                {
                    return NotFound(new {
                        recurso = "Consultor",
                        id = id,
                        mensagem = $"Consultor #{id} não foi encontrado"
                    });
                }

                // Verificar se a filial existe
                var filial = await _context.Filiais.FindAsync(dto.FilialId);
                if (filial == null)
                {
                    return BadRequest(new { message = "Filial não encontrada" });
                }

                // Atualizar apenas campos permitidos
                consultorExistente.FilialId = dto.FilialId;
                consultorExistente.OAB = dto.OAB;
                consultorExistente.DataAtualizacao = DateTime.UtcNow;

                _context.Entry(consultorExistente).State = EntityState.Modified;
                await _context.SaveChangesAsync();

                Console.WriteLine($"✅ UpdateConsultor: Consultor {id} atualizado com sucesso");

                return NoContent();
            }
            catch (DbUpdateConcurrencyException ex)
            {
                Console.WriteLine($"❌ UpdateConsultor: Erro de concorrência: {ex.Message}");
                return StatusCode(409, new { message = "Erro de concorrência ao atualizar consultor" });
            }
            catch (Exception ex)
            {
                Console.WriteLine($"❌ UpdateConsultor: Erro: {ex.Message}");
                return StatusCode(500, new { message = $"Erro ao atualizar consultor: {ex.Message}" });
            }
        }

        // DELETE: api/Consultor/{id}
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteConsultor(int id)
        {
            try
            {
                Console.WriteLine($"🗑️ DeleteConsultor: Deletando consultor {id}");

                var consultor = await _context.Consultores.FindAsync(id);
                if (consultor == null)
                {
                    return NotFound(new {
                        recurso = "Consultor",
                        id = id,
                        mensagem = $"Consultor #{id} não foi encontrado"
                    });
                }

                // Verificar se há contratos vinculados
                var temContratos = await _context.Contratos
                    .AnyAsync(c => c.ConsultorId == id);
                if (temContratos)
                {
                    return BadRequest(new { message = "Não é possível excluir consultor com contratos vinculados" });
                }

                // Soft delete - marcar como inativo ao invés de deletar
                consultor.Ativo = false;
                consultor.DataAtualizacao = DateTime.UtcNow;
                await _context.SaveChangesAsync();

                Console.WriteLine($"✅ DeleteConsultor: Consultor {id} marcado como inativo");

                return NoContent();
            }
            catch (Exception ex)
            {
                Console.WriteLine($"❌ DeleteConsultor: Erro: {ex.Message}");
                return StatusCode(500, new { message = $"Erro ao deletar consultor: {ex.Message}" });
            }
        }

    }
}
