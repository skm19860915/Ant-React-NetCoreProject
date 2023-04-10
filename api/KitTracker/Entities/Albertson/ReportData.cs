using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace KitTracker.Entities.Albertson
{
    public class KitCount
    {
        public string KitNumber { get; set; }
        public string KitName { get; set; }
        public int Count { get; set; }
    }

    public class StageCount
    {
        public int StageId { get; set; }
        public string StageName { get; set; }
        public IEnumerable<KitCount> KitCounts { get; set; }
    }

    public class KitsByWeekCount
    {
        public string WeekOf { get; set; }
        public string KitNumber { get; set; }
        public string KitName { get; set; }
        public int StageId { get; set; }
        public string StageName { get; set; }
        public int Count { get; set; }
    }

    public class ReportData
    {
        public IEnumerable<StageCount> StageCounts { get; set; }
        public IEnumerable<KitsByWeekCount> KitsByWeekCounts { get; set; }
        public IEnumerable<Item> ItemsMovedToPackingToday { get; set; }
        public IEnumerable<Item> ItemsMovedToShippedToday { get; set; }
    }
}
