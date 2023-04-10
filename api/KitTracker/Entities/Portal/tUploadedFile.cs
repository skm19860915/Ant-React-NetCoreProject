using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace KitTracker.Entities.Portal
{
    public class tUploadedFile
    {
        public int UploadedFileID { get; set; }
        public string FileName { get; set; }
        public string FileDescription { get; set; }
        public bool FinishedUploading { get; set; }
        public string Creator_UserID { get; set; }
        public string LastUpdater_UserID { get; set; }
        public DateTime CreatedDateTime { get; set; }
        public DateTime LastUpdatedDateTime { get; set; }
    }
}
