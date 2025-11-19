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
            string subject = "Reset de Senha - CRM Arrighi";
            string htmlBody = $@"
                <!DOCTYPE html>
                <html>
                <head>
                    <style>
                        body {{ font-family: Arial, sans-serif; line-height: 1.6; color: #333; }}
                        .container {{ max-width: 600px; margin: 0 auto; padding: 20px; }}
                        .header {{ background-color: #4F46E5; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }}
                        .content {{ background-color: #f9f9f9; padding: 30px; border-radius: 0 0 8px 8px; }}
                        .button {{ display: inline-block; padding: 12px 30px; background-color: #4F46E5; color: white; text-decoration: none; border-radius: 6px; margin: 20px 0; }}
                        .footer {{ text-align: center; margin-top: 20px; font-size: 12px; color: #666; }}
                    </style>
                </head>
                <body>
                    <div class='container'>
                        <div class='header'>
                            <h1>Reset de Senha</h1>
                        </div>
                        <div class='content'>
                            <p>Olá, <strong>{userName}</strong>,</p>
                            <p>Recebemos uma solicitação para redefinir a senha da sua conta no CRM Arrighi.</p>
                            <p>Para criar uma nova senha, clique no botão abaixo:</p>
                            <p style='text-align: center;'>
                                <a href='{resetLink}' class='button'>Redefinir Senha</a>
                            </p>
                            <p>Ou copie e cole o link abaixo no seu navegador:</p>
                            <p style='word-break: break-all; background-color: #fff; padding: 10px; border-radius: 4px;'>{resetLink}</p>
                            <p><strong>Este link expira em 1 hora.</strong></p>
                            <p>Se você não solicitou esta redefinição de senha, ignore este e-mail. Sua senha permanecerá inalterada.</p>
                        </div>
                        <div class='footer'>
                            <p>© 2024 CRM Arrighi. Todos os direitos reservados.</p>
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

