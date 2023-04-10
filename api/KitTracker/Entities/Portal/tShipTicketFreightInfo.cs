using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace KitTracker.Entities.Portal
{
    public class tShipTicketFreightInfo
    {
        public int ShipTicketFreightInfoID { get; set; }
        public int ShipTicketNbr { get; set; }
        public string TrackingNumber { get; set; }
        public decimal? AmountDue { get; set; }

        public tCarrier Carrier { get; set; }
    }
}
