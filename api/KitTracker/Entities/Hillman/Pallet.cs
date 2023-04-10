using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Text.Json.Serialization;
using System.Threading.Tasks;

namespace KitTracker.Entities.Hillman
{
    public class Pallet
    {
        public int WorkOrderId { get; set; }
        public string HWONumber { get; set; }
        public string PalletNumber { get; set; }
        [JsonIgnore]
        public int PalletStatusId { get; set; }
        public string PalletStatusName { get; set; }
        [JsonIgnore]
        public DateTime? ShipDate { get; set; }
        public string ShipDateString { get; set; }
        public string PalletPO { get; set; }
        public int LastCrewSize { get; set; }
        [JsonIgnore]
        public int? StopReasonId { get; set; }
        public string StopReasonName { get; set; }
        public string LastQANotes { get; set; }
        public string ASNID { get; set; }
    }
}
