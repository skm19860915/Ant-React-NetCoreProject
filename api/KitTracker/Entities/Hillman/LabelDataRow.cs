using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace KitTracker.Entities.Hillman
{
    public class LabelDataRow
    {
        public int SalesNumber { get; set; }
        public string HWONumber { get; set; }
        public string PartNumber { get; set; }
        public string PartName { get; set; }
        public int Quantity { get; set; }
        public string ItemNumber { get; set; }
        public int LabelQuantity { get; set; }
        public bool LabelCSVExported { get; set; }
    }
}
