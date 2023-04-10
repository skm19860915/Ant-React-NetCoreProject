using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace KitTracker.Entities.Portal.OMC
{
    public class tMediaContentLEDColor
    {
        public int MediaContentLEDColorId { get; set; }
        public string ColorName { get; set; }
        public byte R { get; set; }
        public byte G { get; set; }
        public byte B { get; set; }
        public byte W { get; set; }
    }
}
