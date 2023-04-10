using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace KitTracker.Entities.Portal
{
    public class tItemFile
    {
        public int ItemFileID { get; set; }
        public string DirectoryString { get; set; }
        public string FileName { get; set; }
        public string FileDescription { get; set; }
        public DateTime CreatedDateTime { get; set; }
        public DateTime LastUpdatedDateTime { get; set; }
    }
}
