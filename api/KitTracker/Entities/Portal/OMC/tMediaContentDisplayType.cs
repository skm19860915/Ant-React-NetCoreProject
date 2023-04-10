namespace KitTracker.Entities.Portal.OMC
{
    public class tMediaContentDisplayType
    {
        public int MediaContentDisplayTypeID { get; set; }
        public tMediaContentRetailer MediaContentRetailer { get; set; }
        public string DisplayName { get; set; }
        public int? PlayerMapFile_UploadedFileID { get; set; }
        public bool RGBW { get; set; }
    }
}
