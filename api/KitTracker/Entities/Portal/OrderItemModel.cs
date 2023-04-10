using System;
using System.Text.Json.Serialization;

namespace KitTracker.Entities.Portal
{
    public class OrderItemModel
    {
        public int OrderItemId { get; set; }
        [JsonIgnore]
        public int ItemId { get; set; }
        public string ItemName { get; set; }
        public int StatusID { get; set; }
        public int OrderLineNumber { get; set; }
        public int QuantityOrdered { get; set; }
        public string InStoreDateString { get; set; }
        public DateTime InStoreDate { get; set; }
        public tShipTicketFreightInfo TrackingInfo { get; set; }
    }
}
