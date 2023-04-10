using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace KitTracker.Settings
{
    public class PortalSettings : IDatabaseSettings
    {
        public string ConnectionString { get; set; }
        public string FTPUrl { get; set; }
        public string FTPUsername { get; set; }
        public string FTPPassword { get; set; }
    }
}
