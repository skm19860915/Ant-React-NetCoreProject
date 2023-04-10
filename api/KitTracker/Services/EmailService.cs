using System;
using System.Collections.Generic;
using System.Linq;
using System.Net;
using System.Net.Mail;
using System.Text;
using System.Threading.Tasks;
using KitTracker.Settings;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Options;

namespace KitTracker.Services
{
    public class EmailService
    {
        private readonly SMTPSettings _smtpSettings;

        public EmailService(IOptionsSnapshot<SMTPSettings> smtpSettings)
        {
            _smtpSettings = smtpSettings.Value;
        }

        public void SendEmail(MailMessage message)
        {
            using (SmtpClient client = new SmtpClient())
            {

                client.Port = _smtpSettings.Port;
                client.Host = _smtpSettings.Host;
                client.EnableSsl = _smtpSettings.EnableSsl;
                client.Credentials = new NetworkCredential(_smtpSettings.FromEmail, _smtpSettings.Password);

                client.Send(message);
            }
        }

        public MailMessage GetBasicMessage(string[] toEmails, string subject, string body, string[] ccEmails = null, string[] bccEmails = null)
        {
            MailMessage message = new MailMessage();
            message.From = new MailAddress(_smtpSettings.FromEmail);

            if (toEmails != null)
                foreach (string email in toEmails)
                    if (!string.IsNullOrEmpty(email))
                        message.To.Add(email.Trim());

            if (ccEmails != null)
                foreach (string email in ccEmails)
                    if (!string.IsNullOrEmpty(email))
                        message.CC.Add(email.Trim());

            if (bccEmails != null)
                foreach (string email in bccEmails)
                    if (!string.IsNullOrEmpty(email))
                        message.Bcc.Add(email.Trim());

            message.Subject = subject;
            message.Body = body;
            message.IsBodyHtml = true;

            return message;
        }
    }

}
