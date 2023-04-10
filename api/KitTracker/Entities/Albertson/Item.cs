using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace KitTracker.Entities.Albertson
{
    public class Item
    {
        public int ItemId { get; set; }
        public string SerialNumber { get; set; }
        public int StageId { get; set; }
        public string StageName { get; set; }
        public int? KitId { get; set; }
        public string KitNumber { get; set; }
        public string KitName { get; set; }
        public string WeekOf { get; set; }
        public DateTime LastUpdated { get; set; }
    }
}
