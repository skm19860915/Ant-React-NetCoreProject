using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace KitTracker.Entities.Portal.OMC
{
    public class PlayerStatus
    {
        public int MediaContentPlayerId { get; set; }
        public int DisplayLocationIndex { get; set; }
        public string UploadedFileId { get; set; }
        public string FileName { get; set; }
        public bool UpdatingContent { get; set; }
        public bool UpdatingSoftware { get; set; }
        public bool Online { get; set; }
    }
}
