using System;
using System.ComponentModel.DataAnnotations.Schema;

namespace KitTracker.Entities.Portal.OMC
{
    public class tMediaContentPlayer
    {
        public int MediaContentPlayerId { get; set; }
        public int MediaContentStoreId { get; set; }
        public int DisplayLocationIndex { get; set; }
        public long UUID { get; set; }
        public bool ScreenshotRequest { get; set; }
        public tUploadedFile? UploadedFile { get; set; }
        public DateTime? LastResponse { get; set; }
        public bool RebootRequest { get; set; }
        public bool UpdatingContent { get; set; }
        public bool UpdatingSoftware { get; set; }
        public string AppVersion { get; set; }
        public DateTime? LastPowerCycle { get; set; }
        public bool PowerOn { get; set; }
		public DateTime? DateWhenDownloadRequested { get; set; }
		public int DownloadRequestCount { get; set; }
		public bool DisableDownload { get; set; }
		public int PollingIntervalSeconds { get; set; }
		public string SystemCommand { get; set; }

		public int OutletIndex
		{
			get
			{
				switch (DisplayLocationIndex)
				{
					case 1: return 0;
					case 2: return 1;
					// 2 Disconnected
					case 3: return 3;
					case 4: return 4;
					// 5 Enttec
					case 5: return 6;
						// 7 4G router
				}

				return 0;
			}
		}
	}
}
