using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace KitTracker.Entities.Portal.OMC
{
    public class StoreStatus
    {
        public int MediaContentStoreId { get; set; }
        public string RetailerName { get; set; }
        public string RegionName { get; set; }
        public int StoreNumber { get; set; }
        public string DisplayName { get; set; }
        public string StoreName { get; set; }
        public string Street1 { get; set; }
        public string Street2 { get; set; }
        public string City { get; set; }
        public string State { get; set; }
        public string ZipCode { get; set; }
        public tMediaContentLEDColor LEDColor { get; set; }
        public List<PlayerStatus> PlayerStatuses { get; set; }
    }
}
