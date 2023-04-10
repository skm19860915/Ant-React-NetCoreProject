using System.Collections.Generic;

namespace KitTracker.ViewModels.Portal
{
    public class MediaContentViewModel
    {
        public int MediaContentStoreId { get; set; }
        public int MediaContentRegionId { get; set; }
        public int MediaContentDisplayTypeId { get; set; }
        public int StoreNumber { get; set; }
        public string StoreName { get; set; }
        public string Street1 { get; set; }
        public string Street2 { get; set; }
        public string City { get; set; }
        public string State { get; set; }
        public string PostalCode { get; set; }
        public string Country { get; set; }
        public string RegionName { get; set; }
        public string DisplayName { get; set; }
        public List<MediaContentPlayerViewModel> Players { get; set; }
    }
}
