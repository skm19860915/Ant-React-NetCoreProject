using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace KitTracker.Entities.Portal
{
    public abstract class BaseModel
    {
        public string Creator_UserID { get; set; } = "1ce484ad-03f4-42d7-84ab-c1f37cb90549"; // to be removed
        public DateTime CreatedDateTime { get; set; } = DateTime.UtcNow;
        public string LastUpdater_UserID { get; set; } ="1ce484ad-03f4-42d7-84ab-c1f37cb90549"; // to be removed
        public DateTime LastUpdatedDateTime { get; set; } = DateTime.UtcNow;
    }
}
