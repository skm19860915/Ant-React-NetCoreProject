using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace KitTracker.Entities.Tradesoft
{
    public class vGetShipTicketItemInfo
    {
        public string Code { get; set; }
        public DateTime? ShipDt { get; set; }
        public decimal? OrderQty { get; set; }
        public decimal? ShipQty { get; set; }
        public int? ShipStatusNbr { get; set; }
        public string ShipToAddr { get; set; }
        public int ShipTicketItemNbr { get; set; }
        public int? ItemNbr { get; set; }
        public int ShipTicketNbr { get; set; }
        public int? InvNbr { get; set; }
        public int? ShipViaNbr { get; set; }
        public string Notes { get; set; }
        public string PoNbr { get; set; }
        public string Descr { get; set; }
    }
}
