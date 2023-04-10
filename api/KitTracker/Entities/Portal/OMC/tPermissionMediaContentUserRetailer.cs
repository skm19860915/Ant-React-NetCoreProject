using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace KitTracker.Entities.Portal.OMC
{
    public class tPermissionMediaContentUserRetailer
    {
        public int PermissionMediaContentUserRetailerId { get; set; }

        public int MediaContentRetailerId { get; set; }
        public int UserId { get; set; }
    }
}
