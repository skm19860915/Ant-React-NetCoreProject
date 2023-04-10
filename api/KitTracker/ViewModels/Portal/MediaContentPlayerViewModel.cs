using System;

namespace KitTracker.ViewModels.Portal
{
    public class MediaContentPlayerViewModel
    {
        public int MediaContentPlayerId { get; set; }
        public int DisplayLocationIndex { get; set; }
        public long UUID { get; set; }
        public bool ScreenshotRequest { get; set; }
        public UploadedFileViewModel? UploadedFile { get; set; }
        public DateTime? LastResponse { get; set; }
        public string AppVersion { get; set; }
        public DateTime? LastPowerCycle { get; set; }
        public bool PowerOn { get; set; }
        public DateTime? DateWhenDownloadRequested { get; set; }
        public int DownloadRequestCount { get; set; }
        public bool DisableDownload { get; set; }
    }
}
