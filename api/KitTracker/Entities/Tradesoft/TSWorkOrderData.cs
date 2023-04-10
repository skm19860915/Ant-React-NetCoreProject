using static KitTracker.Extensions.RegexHelpers;

namespace KitTracker.Entities.Tradesoft
{
    public class TSWorkOrderData
    {
        public int WoNbr { get; set; }
        public int JobNbr { get; set; }
        public string WoDescr { get; set; }
        public int OrderQty { get; set; }
        public int Job_Tag { get; set; }
        public string JobDescr { get; set; }
        public string Instructions { get; set; }

        public string GetHWONumber() => GetFirstPatternMatch(WoDescr, @"WO[\t\n\r ]*#(\d{8})");
        public string GetHItemNumber() => GetFirstPatternMatch(Instructions, @"ITEM[\t\n\r ]*#(\d{6})");
        public string GetHPartNumber() => GetFirstPatternMatch(Instructions, @"PART[\t\n\r ]*#(\d{7})");
        public string GetHPartName() => GetFirstPatternMatch(WoDescr, @"WO[\t\n\r ]*#\d{8}[\t\n\r ]*(.+)$");
        public int GetHQuantity()
        {
            string qtyStr = GetFirstPatternMatch(Instructions, @"HQTY:[\t\n\r ]*(\d+)");
            if (int.TryParse(qtyStr, out int qty))
                return qty;
            else
                return 0;
        }
        public string GetCountryOfOrigin() => GetFirstPatternMatch(Instructions, @"COO:[\t\n\r ]*(\w+)");
    }
}
