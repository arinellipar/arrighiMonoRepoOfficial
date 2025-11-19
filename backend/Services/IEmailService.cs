namespace CrmArrighi.Services
{
    public interface IEmailService
    {
        Task<bool> SendPasswordResetEmail(string toEmail, string userName, string resetLink);
        Task<bool> SendEmail(string toEmail, string subject, string htmlBody);
    }
}

