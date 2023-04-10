using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace KitTracker.Settings
{
    public class SMTPSettings
    {
        public int Port { get; set; }
        public string Host { get; set; }
        public bool EnableSsl { get; set; }
        public string FromEmail { get; set; }
        public string Password { get; set; }
    }
}
