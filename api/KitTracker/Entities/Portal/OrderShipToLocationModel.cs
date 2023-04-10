using System.Collections.Generic;

namespace KitTracker.Entities.Portal
{
    public class OrderShipToLocationModel
    {
        public string ShipToAddress_ContactName { get; set; }
        public string ShipToAddress_LocationName { get; set; }
        public string ShipToAddress_Street1 { get; set; }
        public string ShipToAddress_Street2 { get; set; }
        public string ShipToAddress_City { get; set; }
        public string ShipToAddress_State { get; set; }
        public string ShipToAddress_PostalCode { get; set; }
        public string ShipToAddress_Country { get; set; } = "US";
        public int ShopPAK_ShipViaNbr { get; set; }
        public string ShipToHash { get; set; }
        public List<OrderItemModel> OrderItems { get; set; }
    }
}
