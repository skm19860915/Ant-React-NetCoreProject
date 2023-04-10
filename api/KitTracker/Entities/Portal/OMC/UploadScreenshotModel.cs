using Microsoft.AspNetCore.Http;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace KitTracker.Entities.Portal.OMC
{
    public class UploadScreenshotModel
    {
        public IFormFile File { get; set; }
        public int StoreId { get; set; }
        public int DisplayLocationIndex { get; set; }
        public long TimestampMillis { get; set; }
        public string Sha512Hash { get; set; }
    }
}
