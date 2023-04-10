using System;
using System.Collections.Generic;

namespace KitTracker.Entities.Portal
{
    public class OrderModel: BaseModel
    {
        public int OrderId { get; set; }
        public int CompanyID { get; set; }
        public string OrderNumber { get; set; }
        public string BillToAddress_LocationName { get; set; }
        public string BillToAddress_Street1 { get; set; }
        public string BillToAddress_Street2 { get; set; }
        public string BillToAddress_City { get; set; }
        public string BillToAddress_State { get; set; }
        public string BillToAddress_PostalCode { get; set; }
        public string BillToAddress_Country { get; set; } = "US";
        public string OrderComments { get; set; }
        public string AdditionalEmailsList { get; set; }
        public List<OrderShipToLocationModel> OrderShipToLocations { get; set; }
    }



}
