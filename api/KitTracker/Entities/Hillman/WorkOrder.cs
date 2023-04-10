using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Text.Json.Serialization;
using System.Threading.Tasks;

namespace KitTracker.Entities.Hillman
{
    public class WorkOrder
    {
        public int WorkOrderId { get; set; }
        public string HWONumber { get; set; }
        public string ItemNumber { get; set; }
        public string BulkPartNumber { get; set; }
        public string BulkPartName { get; set; }
        public int ExpectedQuantity { get; set; }
        [JsonIgnore]
        public int? MethodId { get; set; }
        public string MethodName { get; set; }
        [JsonIgnore]
        public int? MaterialSizeId { get; set; }
        public string MaterialSizeName { get; set; }
        public bool LabelCSVExported { get; set; }
        public bool Rework { get; set; }
        public bool Complete { get; set; }
        public decimal? AverageLaborRate { get; set; }
        public string CountryOfOrigin { get; set; }
        public bool Archived { get; set; }
    }
}
