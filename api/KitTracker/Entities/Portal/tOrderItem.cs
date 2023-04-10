using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace KitTracker.Entities.Portal
{
    public class tOrderItem
    {
        public int OrderItemId { get; set; }
        public int OrderId { get; set; }
        public int ItemId { get; set; }
        public string ItemName { get; set; }
        public string ItemDescription { get; set; }
        public int AssemblyQuantity { get; set; }
        public int QuantityOrdered { get; set; }
        public string ShipTicketItemNotes { get; set; }
        public int? ShopPAK_ShipTicketItemNbr { get; set; }
        public string ShipToAddress_LocationName { get; set; }
        public string ShipToAddress_Street1 { get; set; }
        public string ShipToAddress_Street2 { get; set; }
        public string ShipToAddress_City { get; set; }
        public string ShipToAddress_State { get; set; }
        public string ShipToAddress_PostalCode { get; set; }
        public string ShipToAddress_Country { get; set; }
        public DateTime InStoreDate { get; set; }
        public DateTime? ExpectedShipDate { get; set; }
        public DateTime? ExpectedArrivalDate { get; set; }
        public int OrderLineNumber { get; set; }
        public int ShopPAK_ShipViaNbr { get; set; }
        public int StatusID { get; set; }
        public string Ariba_ConfirmationRequest_payloadID { get; set; }
        public string Ariba_ShipNoticeRequest_payloadID { get; set; }
        public string ShipToHash { get; set; }
        public int? ShipTicketFreightInfoID { get; set; }
        public string Ariba_UnitOfMeasure { get; set; }
        public bool HasShipTicketItemBeenPrinted { get; set; }
        public DateTime? LastBOLReminder { get; set; }
        public bool Acknowledged { get; set; }
        public string ShipToAddress_ContactName { get; set; }
        public string PackageSize_Length { get; set; }
        public string PackageSize_Width { get; set; }
        public string PackageSize_Height { get; set; }
        public string PackageWeight  { get; set; }
        public int ShipTicketItemLineNumber { get; set; }
        public tShipTicketFreightInfo TrackingInfo { get; set; }
    }
}
