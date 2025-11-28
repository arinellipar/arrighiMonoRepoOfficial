using System.Net;
using System.Net.Mail;

namespace CrmArrighi.Services
{
    public class EmailService : IEmailService
    {
        private readonly IConfiguration _configuration;
        private readonly ILogger<EmailService> _logger;

        public EmailService(IConfiguration configuration, ILogger<EmailService> logger)
        {
            _configuration = configuration;
            _logger = logger;
        }

        public async Task<bool> SendPasswordResetEmail(string toEmail, string userName, string resetLink)
        {
            string subject = "Reset de Senha - CRM Arrighi Tributário";
            string htmlBody = $@"
                <!DOCTYPE html>
                <html lang='pt-BR'>
                <head>
                    <meta charset='UTF-8'>
                    <meta name='viewport' content='width=device-width, initial-scale=1.0'>
                    <style>
                        * {{ margin: 0; padding: 0; box-sizing: border-box; }}
                        body {{
                            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
                            line-height: 1.6;
                            color: #e5e5e5;
                            background-color: #0a0a0a;
                            padding: 20px;
                        }}
                        .email-container {{
                            max-width: 600px;
                            margin: 0 auto;
                            background-color: #171717;
                            border-radius: 16px;
                            overflow: hidden;
                            box-shadow: 0 20px 60px rgba(0, 0, 0, 0.5);
                        }}
                        .header {{
                            background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%);
                            padding: 32px 24px;
                            text-align: center;
                            border-bottom: 2px solid #f59e0b;
                        }}
                        .header h1 {{
                            color: #0a0a0a;
                            font-size: 28px;
                            font-weight: 700;
                            margin: 0;
                            letter-spacing: -0.5px;
                        }}
                        .header p {{
                            color: #1c1917;
                            font-size: 14px;
                            margin-top: 8px;
                            opacity: 0.9;
                        }}
                        .content {{
                            background-color: #171717;
                            padding: 40px 32px;
                            border-top: 1px solid #262626;
                        }}
                        .greeting {{
                            color: #f59e0b;
                            font-size: 18px;
                            font-weight: 600;
                            margin-bottom: 24px;
                        }}
                        .content p {{
                            color: #d4d4d4;
                            font-size: 15px;
                            margin-bottom: 16px;
                            line-height: 1.7;
                        }}
                        .content strong {{
                            color: #f59e0b;
                            font-weight: 600;
                        }}
                        .button-container {{
                            text-align: center;
                            margin: 32px 0;
                        }}
                        .button {{
                            display: inline-block;
                            padding: 16px 40px;
                            background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%);
                            color: #0a0a0a !important;
                            text-decoration: none;
                            border-radius: 12px;
                            font-weight: 600;
                            font-size: 16px;
                            box-shadow: 0 4px 14px rgba(245, 158, 11, 0.3);
                            transition: all 0.3s ease;
                            letter-spacing: 0.3px;
                        }}
                        .button:hover {{
                            background: linear-gradient(135deg, #d97706 0%, #b45309 100%);
                            box-shadow: 0 6px 20px rgba(245, 158, 11, 0.4);
                            transform: translateY(-2px);
                        }}
                        .link-box {{
                            background-color: #262626;
                            border: 1px solid #404040;
                            border-radius: 8px;
                            padding: 16px;
                            margin: 24px 0;
                            word-break: break-all;
                            font-family: 'Courier New', monospace;
                            font-size: 13px;
                            color: #f59e0b;
                            text-align: center;
                            line-height: 1.6;
                        }}
                        .warning-box {{
                            background-color: rgba(245, 158, 11, 0.1);
                            border-left: 4px solid #f59e0b;
                            padding: 16px;
                            margin: 24px 0;
                            border-radius: 8px;
                        }}
                        .warning-box p {{
                            color: #fbbf24;
                            font-size: 14px;
                            margin: 0;
                        }}
                        .info-box {{
                            background-color: rgba(100, 100, 100, 0.1);
                            border-left: 4px solid #737373;
                            padding: 16px;
                            margin: 24px 0;
                            border-radius: 8px;
                        }}
                        .info-box p {{
                            color: #a3a3a3;
                            font-size: 14px;
                            margin: 0;
                        }}
                        .footer {{
                            text-align: center;
                            padding: 24px 32px;
                            background-color: #0a0a0a;
                            border-top: 1px solid #262626;
                            font-size: 12px;
                            color: #737373;
                        }}
                        .footer p {{
                            margin: 4px 0;
                            color: #737373;
                        }}
                        .logo {{
                            display: inline-block;
                            width: 48px;
                            height: 48px;
                            background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%);
                            border-radius: 12px;
                            margin-bottom: 16px;
                            line-height: 48px;
                            font-size: 24px;
                            color: #0a0a0a;
                            font-weight: bold;
                        }}
                        @media only screen and (max-width: 600px) {{
                            .email-container {{
                                border-radius: 0;
                            }}
                            .content {{
                                padding: 24px 20px;
                            }}
                            .header {{
                                padding: 24px 20px;
                            }}
                            .button {{
                                padding: 14px 32px;
                                font-size: 15px;
                            }}
                        }}
                    </style>
                </head>
                <body>
                    <div class='email-container'>
                        <div class='header'>
                            <div class='logo'>⚖</div>
                            <h1>Reset de Senha</h1>
                            <p>CRM Arrighi Tributário</p>
                        </div>
                        <div class='content'>
                            <p class='greeting'>Olá, <strong>{userName}</strong>!</p>
                            <p>Recebemos uma solicitação para redefinir a senha da sua conta no <strong>CRM Arrighi Tributário</strong>.</p>
                            <p>Para criar uma nova senha, clique no botão abaixo:</p>
                            <div class='button-container'>
                                <a href='{resetLink}' class='button'>✨ Redefinir Senha</a>
                            </div>
                            <div class='info-box'>
                                <p><strong>Ou copie e cole o link abaixo no seu navegador:</strong></p>
                            </div>
                            <div class='link-box'>
                                {resetLink}
                            </div>
                            <div class='warning-box'>
                                <p><strong>⏰ Importante:</strong> Este link expira em 24 horas.</p>
                            </div>
                            <div class='info-box'>
                                <p>Se você não solicitou esta redefinição de senha, ignore este e-mail. Sua senha permanecerá inalterada.</p>
                            </div>
                        </div>
                        <div class='footer'>
                            <p><strong>© 2025 Arrighi Advogados</strong></p>
                            <p>CRM Judiciário v2.0</p>
                            <p style='margin-top: 12px; font-size: 11px; color: #525252;'>Este é um e-mail automático, por favor não responda.</p>
                        </div>
                    </div>
                </body>
                </html>
            ";

            return await SendEmail(toEmail, subject, htmlBody);
        }

        public async Task<bool> SendEmail(string toEmail, string subject, string htmlBody)
        {
            try
            {
                // Configurações do SMTP (você precisará configurar isso no appsettings.json)
                var smtpHost = _configuration["Email:SmtpHost"] ?? "smtp.gmail.com";
                var smtpPort = int.Parse(_configuration["Email:SmtpPort"] ?? "587");
                var smtpUsername = _configuration["Email:Username"] ?? "";
                var smtpPassword = _configuration["Email:Password"] ?? "";
                var fromEmail = _configuration["Email:FromEmail"] ?? smtpUsername;
                var fromName = _configuration["Email:FromName"] ?? "CRM Arrighi";

                if (string.IsNullOrEmpty(smtpUsername) || string.IsNullOrEmpty(smtpPassword))
                {
                    _logger.LogWarning("⚠️ Email não configurado. Simulando envio para: {Email}", toEmail);
                    _logger.LogInformation("📧 Assunto: {Subject}", subject);
                    _logger.LogInformation("🔗 Link de reset seria enviado para: {Email}", toEmail);
                    // Em desenvolvimento, apenas loga o email
                    return true;
                }

                using var mail = new MailMessage();
                mail.From = new MailAddress(fromEmail, fromName);
                mail.To.Add(toEmail);
                mail.Subject = subject;
                mail.Body = htmlBody;
                mail.IsBodyHtml = true;

                using var smtp = new SmtpClient(smtpHost, smtpPort);
                smtp.EnableSsl = true;
                smtp.Credentials = new NetworkCredential(smtpUsername, smtpPassword);

                await smtp.SendMailAsync(mail);
                _logger.LogInformation("✅ Email enviado com sucesso para: {Email}", toEmail);
                return true;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "❌ Erro ao enviar email para: {Email}", toEmail);
                return false;
            }
        }
    }
}

