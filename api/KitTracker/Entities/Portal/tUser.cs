using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace KitTracker.Entities.Portal
{
    public class tUser
    {
        public int UserId { get; set; }
        public int CompanyId { get; set; }
        public string Title { get; set; }
        public bool SecurityUpdated { get; set; }
    }
}
