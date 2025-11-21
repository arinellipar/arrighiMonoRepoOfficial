using System.Security.Cryptography;
using System.Security.Cryptography.X509Certificates;
using System.Text;
using System.Text.Json;
using CrmArrighi.Data;
using CrmArrighi.Models;
using Microsoft.EntityFrameworkCore;

namespace CrmArrighi.Services
{
    public class SantanderBoletoService : ISantanderBoletoService
    {
        private readonly IConfiguration _configuration;
        private readonly CrmArrighiContext _context;
        private readonly ILogger<SantanderBoletoService> _logger;
        private readonly HttpClient _httpClientWithCertificate;

        private readonly string _baseUrl;
        private readonly string _workspaceId;
        private readonly string _covenantCode;
        private readonly string _clientId;
        private readonly string _clientSecret;

        // Cache do access token
        private string? _cachedAccessToken;
        private DateTime _tokenExpirationTime;

        public SantanderBoletoService(
            IConfiguration configuration,
            CrmArrighiContext context,
            ILogger<SantanderBoletoService> logger)
        {
            _configuration = configuration;
            _context = context;
            _logger = logger;

            // Configurações da API Santander
            _baseUrl = _configuration["SantanderAPI:BaseUrl"] ?? "https://trust-open.api.santander.com.br";
            _workspaceId = _configuration["SantanderAPI:WorkspaceId"] ?? throw new InvalidOperationException("WorkspaceId não configurado");
            _covenantCode = _configuration["SantanderAPI:CovenantCode"] ?? throw new InvalidOperationException("CovenantCode não configurado");
            _clientId = _configuration["SantanderAPI:ClientId"] ?? throw new InvalidOperationException("ClientId não configurado");
            _clientSecret = _configuration["SantanderAPI:ClientSecret"] ?? throw new InvalidOperationException("ClientSecret não configurado");

            // Criar HttpClient com certificado configurado
            _httpClientWithCertificate = CriarHttpClientComCertificado();
        }

        private HttpClient CriarHttpClientComCertificado()
        {
            try
            {
                var certificateThumbprint = _configuration["SantanderAPI:CertificateThumbprint"];
                var certificatePath = _configuration["SantanderAPI:CertificatePath"];
                var certificatePassword = _configuration["SantanderAPI:CertificatePassword"];

                X509Certificate2? certificate = null;

                _logger.LogInformation("🔐 Iniciando configuração do certificado mTLS...");

                // Azure App Service: Tentar carregar do caminho automático (Linux)
                var azureCertPaths = new[]
                {
                    $"/var/ssl/private/{certificateThumbprint}.p12",
                    $"/var/ssl/certs/{certificateThumbprint}.pfx",
                    $"/var/ssl/certs/{certificateThumbprint}.p12"
                };

                foreach (var certPath in azureCertPaths)
                {
                    _logger.LogInformation("🔍 Verificando caminho: {Path}", certPath);

                    if (File.Exists(certPath))
                    {
                        _logger.LogInformation("✅ Encontrado certificado no Azure: {Path}", certPath);

                        // Tentar diferentes senhas (Azure geralmente usa senha vazia)
                        var passwordsToTry = new[] { string.Empty, certificatePassword, "1234", null };

                        foreach (var pwd in passwordsToTry)
                        {
                            try
                            {
                                _logger.LogInformation("🔑 Tentando carregar com senha: {HasPassword}", string.IsNullOrEmpty(pwd) ? "vazia" : "configurada");

                                certificate = new X509Certificate2(certPath, pwd,
                                    X509KeyStorageFlags.MachineKeySet | X509KeyStorageFlags.PersistKeySet | X509KeyStorageFlags.Exportable);

                                _logger.LogInformation("✅ Certificado carregado do Azure com sucesso! Subject: {Subject}, Válido até: {ValidTo}",
                                    certificate.Subject, certificate.NotAfter);
                                break;
                            }
                            catch (CryptographicException ex) when (ex.Message.Contains("password"))
                            {
                                _logger.LogDebug("🔑 Senha incorreta, tentando próxima...");
                                continue;
                            }
                            catch (Exception ex)
                            {
                                _logger.LogError(ex, "❌ Erro ao carregar certificado: {Path}", certPath);
                                break;
                            }
                        }

                        if (certificate != null)
                            break;
                    }
                }

                if (certificate == null)
                {
                    _logger.LogWarning("⚠️ Certificado não encontrado em nenhum caminho do Azure");
                }

                // Se não encontrou no Azure, tentar por Thumbprint nos stores
                if (certificate == null && !string.IsNullOrEmpty(certificateThumbprint))
                {
                    _logger.LogInformation("🔐 Tentando carregar certificado por thumbprint: {Thumbprint}", certificateThumbprint);

                    // Tentar CurrentUser primeiro
                    _logger.LogInformation("🔍 Procurando no CurrentUser store...");
                    using (var store = new X509Store(StoreName.My, StoreLocation.CurrentUser))
                    {
                        store.Open(OpenFlags.ReadOnly);
                        var certificates = store.Certificates.Find(X509FindType.FindByThumbprint, certificateThumbprint, false);

                        _logger.LogInformation($"📊 Certificados encontrados no CurrentUser: {certificates.Count}");

                        if (certificates.Count > 0)
                        {
                            certificate = certificates[0];
                            _logger.LogInformation("✅ Certificado carregado do CurrentUser store. Válido até: {ValidTo}", certificate.NotAfter);
                        }
                    }

                    // Se não encontrou, tentar LocalMachine (apenas em Windows)
                    if (certificate == null && Environment.OSVersion.Platform == PlatformID.Win32NT)
                    {
                        _logger.LogInformation("🔍 Não encontrado no CurrentUser, tentando LocalMachine store (Windows)...");
                        try
                        {
                            using (var store = new X509Store(StoreName.My, StoreLocation.LocalMachine))
                            {
                                store.Open(OpenFlags.ReadOnly);
                                var certificates = store.Certificates.Find(X509FindType.FindByThumbprint, certificateThumbprint, false);

                                _logger.LogInformation($"📊 Certificados encontrados no LocalMachine: {certificates.Count}");

                                if (certificates.Count > 0)
                                {
                                    certificate = certificates[0];
                                    _logger.LogInformation("✅ Certificado carregado do LocalMachine store. Válido até: {ValidTo}", certificate.NotAfter);
                                }
                            }
                        }
                        catch (Exception ex)
                        {
                            _logger.LogWarning(ex, "⚠️ Erro ao acessar LocalMachine store (esperado em Linux)");
                        }
                    }
                    else if (certificate == null)
                    {
                        _logger.LogWarning("⚠️ Sistema operacional: {OS}, Certificado não encontrado em stores", Environment.OSVersion.Platform);
                    }
                }

                // Fallback: carregar por arquivo (desenvolvimento local)
                if (certificate == null && !string.IsNullOrEmpty(certificatePath) && File.Exists(certificatePath))
                {
                    _logger.LogInformation("🔐 Carregando certificado do arquivo local: {Path}", certificatePath);
                    certificate = new X509Certificate2(certificatePath, certificatePassword);
                    _logger.LogInformation("✅ Certificado carregado do arquivo local. Válido até: {ValidTo}", certificate.NotAfter);
                }

                // Criar HttpClientHandler com certificado
                var handler = new HttpClientHandler();
                handler.ServerCertificateCustomValidationCallback = (message, cert, chain, errors) => true; // Aceitar certificados auto-assinados em dev

                if (certificate != null)
                {
                    handler.ClientCertificates.Add(certificate);
                    handler.ClientCertificateOptions = ClientCertificateOption.Manual;
                    _logger.LogInformation("✅ Certificado mTLS configurado no HttpClient. Subject: {Subject}", certificate.Subject);
                }
                else
                {
                    _logger.LogError("❌ NENHUM certificado foi carregado! API Santander VAI FALHAR!");
                }

                // Criar e configurar HttpClient
                var httpClient = new HttpClient(handler);
                httpClient.BaseAddress = new Uri(_baseUrl);
                httpClient.DefaultRequestHeaders.Add("Accept", "application/json");
                httpClient.Timeout = TimeSpan.FromSeconds(30);

                return httpClient;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "❌ Erro CRÍTICO ao criar HttpClient com certificado");

                // Fallback: criar HttpClient sem certificado (vai falhar na API)
                var httpClient = new HttpClient();
                httpClient.BaseAddress = new Uri(_baseUrl);
                httpClient.DefaultRequestHeaders.Add("Accept", "application/json");
                return httpClient;
            }
        }

        private async Task<string> GetAccessTokenAsync()
        {
            // Verificar se o token em cache ainda é válido
            if (!string.IsNullOrEmpty(_cachedAccessToken) && DateTime.UtcNow < _tokenExpirationTime)
            {
                _logger.LogDebug("🔑 Usando access token em cache");
                return _cachedAccessToken;
            }

            _logger.LogInformation("🔑 Gerando novo access token...");
            _logger.LogInformation("🔑 ClientId: {ClientId}", _clientId);
            _logger.LogInformation("🔑 ClientSecret: {Secret}", _clientSecret?.Substring(0, 3) + "***");

            try
            {
                var tokenEndpoint = "/auth/oauth/v2/token";
                _logger.LogInformation("🔑 Token Endpoint: {BaseUrl}{Endpoint}", _baseUrl, tokenEndpoint);

                var requestBody = new Dictionary<string, string>
                {
                    { "grant_type", "client_credentials" },
                    { "client_id", _clientId },
                    { "client_secret", _clientSecret }
                };

                var content = new FormUrlEncodedContent(requestBody);
                _logger.LogInformation("🔑 Enviando requisição para obter token...");

                // ✅ Criar request message e adicionar X-Application-Key
                var requestMessage = new HttpRequestMessage(HttpMethod.Post, tokenEndpoint)
                {
                    Content = content
                };
                requestMessage.Headers.Add("X-Application-Key", _clientId);
                _logger.LogInformation("🔑 X-Application-Key adicionado: {ClientId}", _clientId);

                var response = await _httpClientWithCertificate.SendAsync(requestMessage);
                var responseContent = await response.Content.ReadAsStringAsync();

                _logger.LogInformation("🔑 Response Status: {StatusCode}", response.StatusCode);
                _logger.LogInformation("🔑 Response Content: {Content}", responseContent.Length > 200 ? responseContent.Substring(0, 200) + "..." : responseContent);

                if (response.IsSuccessStatusCode)
                {
                    var tokenResponse = JsonSerializer.Deserialize<Dictionary<string, JsonElement>>(responseContent);

                    if (tokenResponse != null && tokenResponse.ContainsKey("access_token"))
                    {
                        _cachedAccessToken = tokenResponse["access_token"].GetString() ?? "";

                        // Definir tempo de expiração (geralmente 1 hora, renovar 5 minutos antes)
                        var expiresIn = tokenResponse.ContainsKey("expires_in")
                            ? tokenResponse["expires_in"].GetInt32()
                            : 3600;

                        _tokenExpirationTime = DateTime.UtcNow.AddSeconds(expiresIn - 300); // Renovar 5 min antes

                        _logger.LogInformation("✅ Access token gerado com sucesso. Expira em: {Minutes} minutos", expiresIn / 60);
                        return _cachedAccessToken;
                    }
                }

                _logger.LogError("❌ Erro ao gerar access token. Status: {StatusCode}, Response: {Response}",
                    response.StatusCode, responseContent);

                throw new InvalidOperationException($"Erro ao gerar access token: {response.StatusCode}");
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "❌ Exceção ao gerar access token");
                throw;
            }
        }

        public async Task<SantanderBoletoResponse> RegistrarBoletoAsync(Boleto boleto)
        {
            try
            {
                _logger.LogInformation("🔔 Iniciando registro de boleto NSU: {NsuCode}", boleto.NsuCode);

                // ✅ Verificar se está em modo de simulação (APENAS DESENVOLVIMENTO)
                var modoSimulacao = _configuration["SantanderAPI:ModoSimulacao"]?.ToLower() == "true";

                if (modoSimulacao)
                {
                    _logger.LogWarning("⚠️ MODO SIMULAÇÃO ATIVADO - Gerando dados fictícios (APENAS DESENVOLVIMENTO)");
                    return GerarRespostaSimulada(boleto);
                }

                // Obter access token
                var accessToken = await GetAccessTokenAsync();

                var request = CriarRequestRegistro(boleto);
                var json = JsonSerializer.Serialize(request, new JsonSerializerOptions
                {
                    PropertyNamingPolicy = JsonNamingPolicy.CamelCase,
                    WriteIndented = true
                });

                _logger.LogInformation("📤 Request JSON completo para Santander:");
                _logger.LogInformation(json);

                var content = new StringContent(json, Encoding.UTF8, "application/json");
                var endpoint = $"/collection_bill_management/v2/workspaces/{_workspaceId}/bank_slips";

                _logger.LogInformation("📍 Chamando API Santander: {BaseUrl}{Endpoint}", _baseUrl, endpoint);

                // Adicionar Authorization header com o token atual
                var requestMessage = new HttpRequestMessage(HttpMethod.Post, endpoint)
                {
                    Content = content
                };
                requestMessage.Headers.Add("Authorization", $"Bearer {accessToken}");
                requestMessage.Headers.Add("X-Application-Key", _clientId); // Header necessário para API Santander

                var response = await _httpClientWithCertificate.SendAsync(requestMessage);
                var responseContent = await response.Content.ReadAsStringAsync();

                _logger.LogInformation("📥 Response Status: {StatusCode}", response.StatusCode);
                _logger.LogInformation("📥 Response Content completo:");
                _logger.LogInformation(responseContent);

                // Verificar se a resposta é JSON válido
                if (!response.Content.Headers.ContentType?.MediaType?.Contains("json") ?? true)
                {
                    _logger.LogError("❌ API Santander retornou {ContentType} ao invés de JSON!",
                        response.Content.Headers.ContentType?.MediaType ?? "unknown");
                    _logger.LogError("❌ Conteúdo: {Content}", responseContent.Substring(0, Math.Min(500, responseContent.Length)));

                    throw new InvalidOperationException(
                        "API Santander não disponível ou credenciais inválidas. " +
                        "Para desenvolvimento, ative ModoSimulacao=true no appsettings.json"
                    );
                }

                if (response.IsSuccessStatusCode)
                {
                    var santanderResponse = JsonSerializer.Deserialize<SantanderBoletoResponse>(responseContent,
                        new JsonSerializerOptions { PropertyNamingPolicy = JsonNamingPolicy.CamelCase });

                    _logger.LogInformation("✅ Boleto registrado com sucesso. NSU: {NsuCode}, BarCode: {BarCode}",
                        boleto.NsuCode, santanderResponse?.barCode);

                    return santanderResponse ?? new SantanderBoletoResponse();
                }
                else
                {
                    var errorResponse = JsonSerializer.Deserialize<SantanderErrorResponse>(responseContent,
                        new JsonSerializerOptions { PropertyNamingPolicy = JsonNamingPolicy.CamelCase });

                    _logger.LogError("❌ Erro ao registrar boleto. Status: {StatusCode}, Error: {Error}",
                        response.StatusCode, errorResponse?._message);

                    throw new InvalidOperationException($"Erro na API Santander: {errorResponse?._message} - {errorResponse?._details}");
                }
            }
            catch (JsonException jsonEx)
            {
                _logger.LogError(jsonEx, "❌ Erro ao parsear JSON da API Santander");
                _logger.LogError("💡 SOLUÇÃO: Ative ModoSimulacao=true no appsettings.json para testes");
                throw new InvalidOperationException(
                    "API Santander retornou formato inválido. Ative ModoSimulacao para desenvolvimento.",
                    jsonEx
                );
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "❌ Erro ao registrar boleto NSU: {NsuCode}", boleto.NsuCode);
                throw;
            }
        }

        private SantanderBoletoResponse GerarRespostaSimulada(Boleto boleto)
        {
            _logger.LogInformation("🎭 Gerando resposta SIMULADA para boleto NSU: {NsuCode}", boleto.NsuCode);

            // Gerar código de barras fictício (formato válido)
            var random = new Random();
            var codigoBarras = $"03399{random.Next(10000, 99999)}00000{((int)boleto.NominalValue):000000000}0{boleto.BankNumber.PadLeft(13, '0')}";

            // Gerar linha digitável fictícia (formato válido)
            var linhaDigitavel = $"03399.{random.Next(10000, 99999)} {random.Next(10000, 99999)}.{random.Next(100000, 999999)} {random.Next(10000, 99999)}.{random.Next(100000, 999999)} {random.Next(1, 9)} {((long)boleto.NominalValue * 100):00000000000000}";

            // Gerar QR Code PIX fictício
            var qrCodePix = $"00020101021226900014br.gov.bcb.pix{Guid.NewGuid().ToString("N")}5204000053039865802BR5925ARRIGHI ADVOGADOS6009SAO PAULO62{boleto.NsuCode}6304{random.Next(1000, 9999)}";

            _logger.LogInformation("✅ Resposta simulada gerada com sucesso");

            return new SantanderBoletoResponse
            {
                barCode = codigoBarras,
                digitableLine = linhaDigitavel,
                entryDate = DateTime.Today.ToString("yyyy-MM-dd"),
                qrCodePix = qrCodePix,
                qrCodeUrl = $"https://pix.simulado.dev/qr/{boleto.NsuCode}",
                nsuCode = boleto.NsuCode,
                bankNumber = boleto.BankNumber
            };
        }

        public async Task<SantanderBoletoResponse> ConsultarBoletoAsync(string covenantCode, string bankNumber, DateTime nsuDate)
        {
            try
            {
                // O bankslip_id deve ser no formato: covenantCode + bankNumber
                var bankslipId = $"{covenantCode}{bankNumber}";

                _logger.LogInformation("🔍 Consultando boleto - CovenantCode: {CovenantCode}, BankNumber: {BankNumber}, BankslipId: {BankslipId}, Data: {NsuDate}",
                    covenantCode, bankNumber, bankslipId, nsuDate);

                // Obter access token
                var accessToken = await GetAccessTokenAsync();
                _logger.LogInformation("🔑 Access token obtido para consulta. Length: {Length}", accessToken?.Length ?? 0);

                var endpoint = $"/collection_bill_management/v2/workspaces/{_workspaceId}/bank_slips/{bankslipId}?nsuDate={nsuDate:yyyy-MM-dd}";
                _logger.LogInformation("📍 Endpoint de consulta: {Endpoint}", endpoint);

                var requestMessage = new HttpRequestMessage(HttpMethod.Get, endpoint);
                requestMessage.Headers.Add("Authorization", $"Bearer {accessToken}");
                requestMessage.Headers.Add("X-Application-Key", _clientId);

                _logger.LogInformation("📤 Enviando requisição GET para consultar boleto...");
                var response = await _httpClientWithCertificate.SendAsync(requestMessage);
                var responseContent = await response.Content.ReadAsStringAsync();

                _logger.LogInformation("📥 Response Status: {StatusCode}", response.StatusCode);
                _logger.LogInformation("📥 Response Content: {Content}", responseContent.Length > 500 ? responseContent.Substring(0, 500) + "..." : responseContent);

                if (response.IsSuccessStatusCode)
                {
                    var santanderResponse = JsonSerializer.Deserialize<SantanderBoletoResponse>(responseContent,
                        new JsonSerializerOptions { PropertyNamingPolicy = JsonNamingPolicy.CamelCase });

                    _logger.LogInformation("✅ Boleto consultado com sucesso: {BankslipId}", bankslipId);
                    return santanderResponse ?? new SantanderBoletoResponse();
                }
                else
                {
                    _logger.LogError("❌ Erro ao consultar boleto. Status: {StatusCode}, Response: {Response}",
                        response.StatusCode, responseContent);
                    throw new InvalidOperationException($"Erro ao consultar boleto: {response.StatusCode} - {responseContent}");
                }
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "❌ Erro ao consultar boleto - CovenantCode: {CovenantCode}, BankNumber: {BankNumber}", covenantCode, bankNumber);
                throw;
            }
        }

        public async Task<bool> CancelarBoletoAsync(string covenantCode, string bankNumber, DateTime nsuDate)
        {
            try
            {
                // O bankslip_id deve ser no formato: covenantCode + bankNumber
                var bankslipId = $"{covenantCode}{bankNumber}";

                _logger.LogInformation("Cancelando boleto - CovenantCode: {CovenantCode}, BankNumber: {BankNumber}, BankslipId: {BankslipId}, Data: {NsuDate}",
                    covenantCode, bankNumber, bankslipId, nsuDate);

                // Obter access token
                var accessToken = await GetAccessTokenAsync();

                var endpoint = $"/collection_bill_management/v2/workspaces/{_workspaceId}/bank_slips/{bankslipId}?nsuDate={nsuDate:yyyy-MM-dd}";

                var requestMessage = new HttpRequestMessage(HttpMethod.Delete, endpoint);
                requestMessage.Headers.Add("Authorization", $"Bearer {accessToken}");
                requestMessage.Headers.Add("X-Application-Key", _clientId);

                var response = await _httpClientWithCertificate.SendAsync(requestMessage);

                if (response.IsSuccessStatusCode)
                {
                    _logger.LogInformation("✅ Boleto cancelado com sucesso: {BankslipId}", bankslipId);
                    return true;
                }
                else
                {
                    _logger.LogError("❌ Erro ao cancelar boleto. Status: {StatusCode}", response.StatusCode);
                    return false;
                }
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "❌ Erro ao cancelar boleto. CovenantCode: {CovenantCode}, BankNumber: {BankNumber}", covenantCode, bankNumber);
                return false;
            }
        }

        public async Task<string> GerarProximoNsuCodeAsync()
        {
            try
            {
                // Buscar o último NSU usado no banco
                var ultimoBoleto = await _context.Boletos
                    .OrderByDescending(b => b.Id)
                    .FirstOrDefaultAsync();

                if (ultimoBoleto != null && !string.IsNullOrEmpty(ultimoBoleto.NsuCode))
                {
                    // Extrair número do NSU (assumindo formato: FAT000001, FAT000002, etc)
                    var nsuPrefix = new string(ultimoBoleto.NsuCode.TakeWhile(char.IsLetter).ToArray());
                    var nsuNumero = new string(ultimoBoleto.NsuCode.SkipWhile(char.IsLetter).ToArray());

                    if (int.TryParse(nsuNumero, out int numeroAtual))
                    {
                        var proximoNumero = numeroAtual + 1;
                        var proximoNsu = $"{nsuPrefix}{proximoNumero.ToString().PadLeft(nsuNumero.Length, '0')}";

                        _logger.LogInformation("✅ Próximo NSU gerado: {ProximoNsu}", proximoNsu);
                        return proximoNsu;
                    }
                }

                // Se não encontrou nenhum boleto ou formato inválido, começar do FAT000001
                var nsuInicial = "FAT000001";
                _logger.LogInformation("✅ NSU inicial gerado: {NsuInicial}", nsuInicial);
                return nsuInicial;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "❌ Erro ao gerar próximo NSU Code");
                throw;
            }
        }

        private object CriarRequestRegistro(Boleto boleto)
        {
            var request = new
            {
                environment = "PRODUCAO",
                nsuCode = boleto.NsuCode,
                nsuDate = boleto.NsuDate.ToString("yyyy-MM-dd"),
                covenantCode = boleto.CovenantCode,
                bankNumber = boleto.BankNumber,
                clientNumber = boleto.ClientNumber,
                dueDate = boleto.DueDate.ToString("yyyy-MM-dd"),
                issueDate = boleto.IssueDate.ToString("yyyy-MM-dd"),
                nominalValue = boleto.NominalValue.ToString("F2", System.Globalization.CultureInfo.InvariantCulture),
                payer = new
                {
                    name = boleto.PayerName,
                    documentType = boleto.PayerDocumentType,
                    documentNumber = boleto.PayerDocumentNumber,
                    address = boleto.PayerAddress,
                    neighborhood = boleto.PayerNeighborhood,
                    city = boleto.PayerCity,
                    state = boleto.PayerState,
                    zipCode = boleto.PayerZipCode
                },
                documentKind = boleto.DocumentKind,
                paymentType = "REGISTRO",
                finePercentage = boleto.FinePercentage?.ToString("F2"),
                interestPercentage = boleto.InterestPercentage?.ToString("F2"),
                messages = boleto.Messages?.Split(';').Where(m => !string.IsNullOrWhiteSpace(m)).ToArray(),
                // PIX será adicionado futuramente quando implementado no modelo
                key = _configuration["SantanderAPI:PixKey"] != null ? new
                {
                    type = _configuration["SantanderAPI:PixKeyType"] ?? "CNPJ",
                    dictKey = _configuration["SantanderAPI:PixKey"]
                } : null
            };

            return request;
        }

        public async Task<BoletoStatusResponseDTO> ConsultarStatusPorNossoNumeroAsync(string beneficiaryCode, string bankNumber)
        {
            try
            {
                _logger.LogInformation("🔍 Consultando status do boleto por Nosso Número - BeneficiaryCode: {BeneficiaryCode}, BankNumber: {BankNumber}",
                    beneficiaryCode, bankNumber);

                // Verificar se as credenciais estão configuradas
                if (string.IsNullOrEmpty(_clientId) || _clientId == "PRODUCTION_CLIENT_ID" ||
                    string.IsNullOrEmpty(_clientSecret) || _clientSecret == "PRODUCTION_CLIENT_SECRET" ||
                    string.IsNullOrEmpty(_workspaceId) || _workspaceId == "PRODUCTION_WORKSPACE_ID")
                {
                    throw new InvalidOperationException(
                        "⚠️ Credenciais da API Santander não configuradas. " +
                        "Configure WorkspaceId, ClientId e ClientSecret no appsettings.Production.json ou variáveis de ambiente. " +
                        "Veja LEIA_ME_SANTANDER.md para instruções.");
                }

                // Obter access token
                var accessToken = await GetAccessTokenAsync();

                // Construir query parameters
                var endpoint = $"/collection_bill_management/v2/bills?beneficiaryCode={beneficiaryCode}&bankNumber={bankNumber}";
                _logger.LogInformation("📍 Endpoint de consulta: {BaseUrl}{Endpoint}", _baseUrl, endpoint);

                var requestMessage = new HttpRequestMessage(HttpMethod.Get, endpoint);
                requestMessage.Headers.Add("Authorization", $"Bearer {accessToken}");
                requestMessage.Headers.Add("X-Application-Key", _clientId);

                _logger.LogInformation("📤 Enviando requisição GET para consultar status do boleto...");
                var response = await _httpClientWithCertificate.SendAsync(requestMessage);
                var responseContent = await response.Content.ReadAsStringAsync();

                _logger.LogInformation("📥 Response Status: {StatusCode}", response.StatusCode);
                _logger.LogInformation("📥 Response Content: {Content}", responseContent.Length > 500 ? responseContent.Substring(0, 500) + "..." : responseContent);

                if (response.IsSuccessStatusCode)
                {
                    var santanderResponse = JsonSerializer.Deserialize<SantanderBillStatusResponse>(responseContent,
                        new JsonSerializerOptions { PropertyNamingPolicy = JsonNamingPolicy.CamelCase });

                    var statusResponse = MapearStatusResponse(santanderResponse, "nossoNumero");

                    _logger.LogInformation("✅ Status do boleto consultado com sucesso. Status: {Status}", statusResponse.Status);
                    return statusResponse;
                }
                else
                {
                    var errorResponse = JsonSerializer.Deserialize<SantanderErrorResponse>(responseContent,
                        new JsonSerializerOptions { PropertyNamingPolicy = JsonNamingPolicy.CamelCase });

                    _logger.LogError("❌ Erro ao consultar status do boleto. Status: {StatusCode}, Error: {Error}",
                        response.StatusCode, errorResponse?._message);
                    throw new InvalidOperationException($"Erro na API Santander: {errorResponse?._message} - {errorResponse?._details}");
                }
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "❌ Erro ao consultar status por Nosso Número - BeneficiaryCode: {BeneficiaryCode}, BankNumber: {BankNumber}",
                    beneficiaryCode, bankNumber);
                throw;
            }
        }

        public async Task<BoletoStatusResponseDTO> ConsultarStatusPorSeuNumeroAsync(string beneficiaryCode, string clientNumber, DateTime dueDate, decimal nominalValue)
        {
            try
            {
                _logger.LogInformation("🔍 Consultando status do boleto por Seu Número - BeneficiaryCode: {BeneficiaryCode}, ClientNumber: {ClientNumber}, DueDate: {DueDate}, Value: {Value}",
                    beneficiaryCode, clientNumber, dueDate.ToString("yyyy-MM-dd"), nominalValue);

                // Obter access token
                var accessToken = await GetAccessTokenAsync();

                // Formatar valor nominal com ponto decimal
                var nominalValueFormatted = nominalValue.ToString("F2", System.Globalization.CultureInfo.InvariantCulture);
                var dueDateFormatted = dueDate.ToString("yyyy-MM-dd");

                // Construir query parameters
                var endpoint = $"/collection_bill_management/v2/bills?beneficiaryCode={beneficiaryCode}&clientNumber={clientNumber}&dueDate={dueDateFormatted}&nominalValue={nominalValueFormatted}";
                _logger.LogInformation("📍 Endpoint de consulta: {BaseUrl}{Endpoint}", _baseUrl, endpoint);

                var requestMessage = new HttpRequestMessage(HttpMethod.Get, endpoint);
                requestMessage.Headers.Add("Authorization", $"Bearer {accessToken}");
                requestMessage.Headers.Add("X-Application-Key", _clientId);

                _logger.LogInformation("📤 Enviando requisição GET para consultar status do boleto...");
                var response = await _httpClientWithCertificate.SendAsync(requestMessage);
                var responseContent = await response.Content.ReadAsStringAsync();

                _logger.LogInformation("📥 Response Status: {StatusCode}", response.StatusCode);
                _logger.LogInformation("📥 Response Content: {Content}", responseContent.Length > 500 ? responseContent.Substring(0, 500) + "..." : responseContent);

                if (response.IsSuccessStatusCode)
                {
                    var santanderResponse = JsonSerializer.Deserialize<SantanderBillStatusResponse>(responseContent,
                        new JsonSerializerOptions { PropertyNamingPolicy = JsonNamingPolicy.CamelCase });

                    var statusResponse = MapearStatusResponse(santanderResponse, "seuNumero");

                    _logger.LogInformation("✅ Status do boleto consultado com sucesso. Status: {Status}", statusResponse.Status);
                    return statusResponse;
                }
                else
                {
                    var errorResponse = JsonSerializer.Deserialize<SantanderErrorResponse>(responseContent,
                        new JsonSerializerOptions { PropertyNamingPolicy = JsonNamingPolicy.CamelCase });

                    _logger.LogError("❌ Erro ao consultar status do boleto. Status: {StatusCode}, Error: {Error}",
                        response.StatusCode, errorResponse?._message);
                    throw new InvalidOperationException($"Erro na API Santander: {errorResponse?._message} - {errorResponse?._details}");
                }
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "❌ Erro ao consultar status por Seu Número - BeneficiaryCode: {BeneficiaryCode}, ClientNumber: {ClientNumber}",
                    beneficiaryCode, clientNumber);
                throw;
            }
        }

        public async Task<BoletoStatusResponseDTO> ConsultarStatusPorTipoAsync(string billId, string tipoConsulta = "default")
        {
            try
            {
                _logger.LogInformation("🔍 Consultando status do boleto por Tipo - BillId: {BillId}, TipoConsulta: {TipoConsulta}",
                    billId, tipoConsulta);

                // Validar tipo de consulta
                var tiposValidos = new[] { "default", "duplicate", "bankslip", "settlement", "registry" };
                if (!tiposValidos.Contains(tipoConsulta.ToLower()))
                {
                    throw new ArgumentException($"Tipo de consulta inválido. Valores permitidos: {string.Join(", ", tiposValidos)}");
                }

                // Obter access token
                var accessToken = await GetAccessTokenAsync();

                // Construir endpoint
                var endpoint = $"/collection_bill_management/v2/bills/{billId}?tipoConsulta={tipoConsulta}";
                _logger.LogInformation("📍 Endpoint de consulta: {BaseUrl}{Endpoint}", _baseUrl, endpoint);

                var requestMessage = new HttpRequestMessage(HttpMethod.Get, endpoint);
                requestMessage.Headers.Add("Authorization", $"Bearer {accessToken}");
                requestMessage.Headers.Add("X-Application-Key", _clientId);

                _logger.LogInformation("📤 Enviando requisição GET para consultar status do boleto por tipo...");
                var response = await _httpClientWithCertificate.SendAsync(requestMessage);
                var responseContent = await response.Content.ReadAsStringAsync();

                _logger.LogInformation("📥 Response Status: {StatusCode}", response.StatusCode);
                _logger.LogInformation("📥 Response Content: {Content}", responseContent.Length > 500 ? responseContent.Substring(0, 500) + "..." : responseContent);

                if (response.IsSuccessStatusCode)
                {
                    var santanderResponse = JsonSerializer.Deserialize<SantanderBillStatusResponse>(responseContent,
                        new JsonSerializerOptions { PropertyNamingPolicy = JsonNamingPolicy.CamelCase });

                    var statusResponse = MapearStatusResponse(santanderResponse, tipoConsulta);

                    _logger.LogInformation("✅ Status do boleto consultado com sucesso. Status: {Status}", statusResponse.Status);
                    return statusResponse;
                }
                else
                {
                    var errorResponse = JsonSerializer.Deserialize<SantanderErrorResponse>(responseContent,
                        new JsonSerializerOptions { PropertyNamingPolicy = JsonNamingPolicy.CamelCase });

                    _logger.LogError("❌ Erro ao consultar status do boleto. Status: {StatusCode}, Error: {Error}",
                        response.StatusCode, errorResponse?._message);
                    throw new InvalidOperationException($"Erro na API Santander: {errorResponse?._message} - {errorResponse?._details}");
                }
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "❌ Erro ao consultar status por Tipo - BillId: {BillId}, TipoConsulta: {TipoConsulta}",
                    billId, tipoConsulta);
                throw;
            }
        }

        private BoletoStatusResponseDTO MapearStatusResponse(SantanderBillStatusResponse? santanderResponse, string tipoConsulta)
        {
            if (santanderResponse == null || santanderResponse._content == null || !santanderResponse._content.Any())
            {
                _logger.LogWarning("⚠️ Resposta da API Santander está vazia ou sem conteúdo");
                return new BoletoStatusResponseDTO
                {
                    ConsultaRealizadaEm = DateTime.UtcNow,
                    TipoConsulta = tipoConsulta
                };
            }

            // ✅ Pegar o primeiro item do array _content
            var billData = santanderResponse._content.First();

            _logger.LogInformation("📊 Dados do boleto - Status: {Status}, Valor Pago: {PaidValue}, Valor Nominal: {NominalValue}",
                billData.status, billData.paidValue, billData.nominalValue);

            var response = new BoletoStatusResponseDTO
            {
                // Informações básicas
                BeneficiaryCode = billData.beneficiaryCode?.ToString(),
                BankNumber = billData.bankNumber?.ToString(),
                ClientNumber = billData.clientNumber,
                NsuCode = billData.nsuCode,
                NsuDate = billData.nsuDate,

                // Status
                Status = billData.status?.ToUpper(), // ✅ Converter para maiúsculo (API retorna "Liquidado", queremos "LIQUIDADO")
                StatusDescription = ObterDescricaoStatus(billData.status),

                // Datas
                DueDate = billData.dueDate,
                IssueDate = billData.issueDate,
                EntryDate = billData.entryDate,
                SettlementDate = billData.settlementDate,

                // Valores - agora já são decimal
                NominalValue = billData.nominalValue,
                PaidValue = billData.paidValue,
                DiscountValue = billData.discountValue,
                FineValue = billData.fineValue,
                InterestValue = billData.interestValue,

                // Pagador
                Payer = billData.payer != null ? new PayerInfoDTO
                {
                    Name = billData.payer.name,
                    DocumentType = billData.payer.documentType,
                    DocumentNumber = billData.payer.documentNumber,
                    Address = billData.payer.address,
                    Neighborhood = billData.payer.neighborhood,
                    City = billData.payer.city,
                    State = billData.payer.state,
                    ZipCode = billData.payer.zipCode
                } : null,

                // PIX
                QrCodePix = billData.qrCodePix,
                QrCodeUrl = billData.qrCodeUrl,

                // Código de barras
                BarCode = billData.barCode,
                DigitableLine = billData.digitableLine,

                // Outros
                DocumentKind = billData.documentKind,
                Messages = billData.messages,

                // Liquidações (se houver)
                Settlements = billData.settlements?.Select(s => new SettlementInfoDTO
                {
                    SettlementType = s.settlementType,
                    SettlementDate = s.settlementDate,
                    SettlementValue = s.settlementValue != null ? decimal.Parse(s.settlementValue) : null,
                    SettlementOrigin = s.settlementOrigin,
                    BankCode = s.bankCode,
                    BankBranch = s.bankBranch
                }).ToList(),

                // Cartório (se houver)
                RegistryInfo = billData.registryInfo != null ? new RegistryInfoDTO
                {
                    RegistryDate = billData.registryInfo.registryDate,
                    RegistryNumber = billData.registryInfo.registryNumber,
                    NotaryOffice = billData.registryInfo.notaryOffice,
                    RegistryCost = billData.registryInfo.registryCost != null ? decimal.Parse(billData.registryInfo.registryCost) : null
                } : null,

                // Metadados
                ConsultaRealizadaEm = DateTime.UtcNow,
                TipoConsulta = tipoConsulta
            };

            return response;
        }

        private string ObterDescricaoStatus(string? status)
        {
            if (string.IsNullOrEmpty(status))
                return "Status não informado";

            // ✅ Normalizar status para maiúsculo para comparação
            var statusNormalizado = status.ToUpper().Trim();

            return statusNormalizado switch
            {
                "ATIVO" => "Boleto em aberto (vencido ou a vencer)",
                "BAIXADO" => "Boleto baixado (pagamento via PIX ou baixa manual)",
                "LIQUIDADO" => "Boleto liquidado (pagamento via linha digitável/código de barras)",
                "LIQUIDADO PARCIALMENTE" => "Boleto com pagamento parcial",
                "LIQUIDADO PARCIAL" => "Boleto com pagamento parcial",
                "CANCELADO" => "Boleto cancelado",
                "REGISTRADO" => "Boleto registrado, aguardando pagamento",
                _ => status
            };
        }


        public async Task<string> BaixarPdfBoletoAsync(string bankNumber, string covenantCode, string payerDocumentNumber)
        {
            try
            {
                _logger.LogInformation("📄 Iniciando download do PDF do boleto. BankNumber: {BankNumber}, CovenantCode: {CovenantCode}", bankNumber, covenantCode);

                // ⚠️ Modo simulação: retornar link de exemplo
                var modoSimulacao = _configuration["SantanderAPI:ModoSimulacao"]?.ToLower() == "true";
                if (modoSimulacao)
                {
                    _logger.LogWarning("⚠️ MODO SIMULAÇÃO: Retornando link de PDF de exemplo");
                    // Retornar um link de PDF de exemplo válido
                    return "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf";
                }

                // Obter access token
                var accessToken = await GetAccessTokenAsync();

                var endpoint = $"/collection_bill_management/v2/bills/{bankNumber}.{covenantCode}/bank_slips";
                _logger.LogInformation("📍 Chamando API Santander para download PDF: {BaseUrl}{Endpoint}", _baseUrl, endpoint);
                _logger.LogInformation("🔍 Endpoint construído: {Endpoint}", endpoint);
                _logger.LogInformation("🔍 BankNumber: {BankNumber}, CovenantCode: {CovenantCode}", bankNumber, covenantCode);

                // Criar body JSON com documento do pagador
                var requestBody = new
                {
                    payerDocumentNumber = payerDocumentNumber
                };

                var jsonContent = JsonSerializer.Serialize(requestBody, new JsonSerializerOptions
                {
                    PropertyNamingPolicy = JsonNamingPolicy.CamelCase,
                    WriteIndented = true
                });

                _logger.LogInformation("📤 Request Body para download PDF: {RequestBody}", jsonContent);

                var content = new StringContent(jsonContent, Encoding.UTF8, "application/json");

                var requestMessage = new HttpRequestMessage(HttpMethod.Post, endpoint)
                {
                    Content = content
                };
                requestMessage.Headers.Add("Authorization", $"Bearer {accessToken}");
                requestMessage.Headers.Add("X-Application-Key", _clientId); // Header necessário para API Santander

                var response = await _httpClientWithCertificate.SendAsync(requestMessage);
                var responseContent = await response.Content.ReadAsStringAsync();

                _logger.LogInformation("📥 Response Status: {StatusCode}", response.StatusCode);
                _logger.LogInformation("📥 Response Content Type: {ContentType}", response.Content.Headers.ContentType?.MediaType);
                _logger.LogInformation("📥 Response Content Length: {Length}", responseContent.Length);
                _logger.LogInformation("📥 Response Content: {Content}", responseContent.Length > 500 ? responseContent.Substring(0, 500) + "..." : responseContent);

                if (response.IsSuccessStatusCode)
                {
                    // Verificar se a resposta está vazia
                    if (string.IsNullOrWhiteSpace(responseContent))
                    {
                        _logger.LogError("❌ Resposta da API está vazia");
                        throw new InvalidOperationException("API Santander retornou resposta vazia para download do PDF");
                    }

                    // Verificar se é JSON válido
                    if (!response.Content.Headers.ContentType?.MediaType?.Contains("json") ?? true)
                    {
                        _logger.LogError("❌ API Santander retornou {ContentType} ao invés de JSON para download PDF",
                            response.Content.Headers.ContentType?.MediaType ?? "unknown");
                        throw new InvalidOperationException($"API Santander retornou formato inválido para download PDF: {response.Content.Headers.ContentType?.MediaType}");
                    }

                    try
                    {
                        _logger.LogInformation("🔍 Tentando deserializar JSON. Conteúdo: '{Content}'", responseContent);
                        var pdfResponse = JsonSerializer.Deserialize<Dictionary<string, JsonElement>>(responseContent);

                        if (pdfResponse != null && pdfResponse.ContainsKey("link"))
                        {
                            var pdfLink = pdfResponse["link"].GetString();
                            _logger.LogInformation("✅ Link do PDF gerado com sucesso: {PdfLink}", pdfLink);
                            return pdfLink ?? "";
                        }
                        else
                        {
                            _logger.LogError("❌ Resposta da API não contém 'link' para download do PDF. Chaves disponíveis: {Keys}",
                                pdfResponse?.Keys != null ? string.Join(", ", pdfResponse.Keys) : "null");
                            throw new InvalidOperationException("Resposta da API não contém link para download do PDF");
                        }
                    }
                    catch (JsonException jsonEx)
                    {
                        _logger.LogError(jsonEx, "❌ Erro ao parsear JSON da resposta de download PDF");
                        _logger.LogError("❌ Conteúdo recebido: {Content}", responseContent);
                        throw new InvalidOperationException("Erro ao processar resposta da API para download do PDF", jsonEx);
                    }
                }
                else
                {
                    _logger.LogError("❌ Erro ao baixar PDF do boleto. Status: {StatusCode}, Response: {Response}",
                        response.StatusCode, responseContent);
                    throw new InvalidOperationException($"Erro ao baixar PDF do boleto: {response.StatusCode} - {responseContent}");
                }
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "❌ Erro ao baixar PDF do boleto. BankNumber: {BankNumber}", bankNumber);
                throw;
            }
        }
    }
}
