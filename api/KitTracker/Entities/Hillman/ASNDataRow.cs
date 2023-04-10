using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace KitTracker.Entities.Hillman
{
    public class ASNDataRow
    {
        public string HWONumber { get; set; }
        public string ItemNumber { get; set; }
        public int CartonQuantity { get; set; }
        public string CaseNumber { get; set; }
        public string PalletNumber { get; set; }
        public string PGADateString { get; set; }
    }
}
