using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace KitTracker.Settings
{
    public class HillmanSettings
    {
        public string HWOSuffix { get; set; }
        public string PalletNumberRegex { get; set; }
        public string CaseNumberRegex { get; set; }
        public string[] QAEmails { get; set; }
        public string[] ASNEmails { get; set; }
    }
}
