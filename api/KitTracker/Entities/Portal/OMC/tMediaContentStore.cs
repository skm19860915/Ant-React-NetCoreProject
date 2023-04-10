using System;
using System.Collections.Generic;

namespace KitTracker.Entities.Portal.OMC
{
    public class tMediaContentStore
    {
        public int MediaContentStoreId { get; set; }
        public int MediaContentDisplayTypeId { get; set; }
        public tMediaContentRegion MediaContentRegion { get; set; }
        public tMediaContentDisplayType MediaContentDisplayType { get; set; }
        public int StoreNumber { get; set; }
        public string StoreName { get; set; }
        public string Street1 { get; set; }
        public string Street2 { get; set; }
        public string City { get; set; }
        public string State { get; set; }
        public string PostalCode { get; set; }
        public string Country { get; set; }
		public DateTime? LastColorChange { get; set; }
		public bool RequestReboot { get; set; }
		public DateTime? LastBootCycle { get; set; }
		public string PhoneNumber { get; set; }
		public string StoreSPOC { get; set; }
		public List<tMediaContentPlayer> Players { get; set; }
        public string LEDColor { get; set; }
    }
}
