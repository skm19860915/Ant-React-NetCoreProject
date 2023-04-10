using System;
using System.Collections.Generic;
using System.Linq;
using System.Text.Json.Serialization;
using System.Threading.Tasks;

namespace KitTracker.Entities.Portal
{
    public enum OrderStatuses
    {
        Any = -1,
        ConfirmedNotPrinted = -2,
        Error = 0,
        New = 1,
        Changed = 2,
        Hold = 3,
        Confirmed = 4,
        Shipped = 5,
        Cancelled = 6,
        Legacy = 7,
    }

    public class tOrder
    {
        public int OrderId { get; set; }
        public int CompanyId { get; set; }
        public string OrderNumber { get; set; }
        public string OrderComments { get; set; }
        public DateTime CreatedDateTime { get; set; }
        public DateTime LastUpdatedDateTime { get; set; }
        public string BillToAddress_LocationName { get; set; }
        public string BillToAddress_Street1 { get; set; }
        public string BillToAddress_Street2 { get; set; }
        public string BillToAddress_City { get; set; }
        public string BillToAddress_State { get; set; }
        public string BillToAddress_PostalCode { get; set; }
        public string BillToAddress_Country { get; set; }
        public decimal? FreightAndHandlingCostTotal { get; set; }
        public string Ariba_OrderRequest_payloadID { get; set; }
        public decimal Ariba_TotalPrice { get; set; }
        public string AdditionalEmailsList { get; set; }
        [JsonIgnore]
        public string Creator_UserId { get; set; }
        [JsonIgnore]
        public string LastUpdater_UserId { get; set; }
        public List<tOrderItem> OrderItems { get; set; }
    }
   
}
