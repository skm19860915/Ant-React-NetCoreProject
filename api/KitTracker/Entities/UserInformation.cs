using KitTracker.CustomProvider;
using KitTracker.Entities.Portal;
using KitTracker.Entities.Portal.OMC;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Text.Json.Serialization;
using System.Threading.Tasks;

namespace KitTracker.Entities
{
    public class UserInformation
    {
        [JsonIgnore]
        public tUser User { get; set; }
        [JsonIgnore]
        public ApplicationUser ApplicationUser { get; set; }
        public string Username { get; set; }
        public int CompanyId { get; set; }
        public bool HasAdminAccess { get; set; }
        public bool HasManagerAccess { get; set; }
        public bool HasOperationsAccess { get; set; }
        public bool HasMediaContentAccess { get; set; }
        public bool HasInventoryAccess { get; set; }
        public bool HasOrdersAccess { get; set; }
        public bool HasDesignRequestsAccess { get; set; }
        public bool HasShippingAccess { get; set; }
        public bool HasScanningAccess { get; set; }
        public IEnumerable<tPermissionMediaContentUserRetailer> MediaContentRetailerPermissions { get; set; }
    }
}
