using System;

namespace KitTracker.Entities.Portal.OMC
{
    public class tMediaContentScheduleLEDColor
    {
        public int MediaContentScheduleLEDColorID { get; set; }
        public tMediaContentLEDColor MediaContentLEDColor { get; set; }
        public int MediaContentStoreID { get; set; }
        public DateTime StartDateTime { get; set; }
        public DateTime? EndDateTime { get; set; }
        public int IntervalSeconds { get; set; }
    }
}
