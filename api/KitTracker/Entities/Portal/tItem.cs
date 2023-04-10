using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace KitTracker.Entities.Portal
{
    public class tItem
    {
        public int ItemId { get; set; }
        public int CompanyId { get; set; }
        public string ItemName { get; set; }
        public string ItemDescription { get; set; }
        public int ProjectPAK_JobItemID { get; set; }
        public DateTime CreatedDateTime { get; set; }
        public DateTime LastUpdatedDateTime { get; set; }
        public int ItemSize_Width { get; set; }
        public int ItemSize_Depth { get; set; }
        public int ItemSize_Height { get; set; }
        public int ItemSize_UOMID { get; set; }
        public int NumberOfFacings { get; set; }
        public bool HasStorageAreas { get; set; }
        public int PackageWeight { get; set; }
        public int PackageWeight_UOMID { get; set; }
        public int PackageSize_Width { get; set; }
        public int PackageSize_Length { get; set; }
        public int PackageSize_Height { get; set; }
        public int PackageSize_UOMID { get; set; }
        public int ShopPAK_InvNbr { get; set; }
        public string ProductImage_FileExtension { get; set; }
        public string PackageImage_FileExtension { get; set; }
        public string ShopPAK_ShipTicketItemNotes { get; set; }
        public int FreightClass { get; set; }
        public int? SetQuantity { get; set; }
        public bool IsActive { get; set; }
        public decimal? PackageWeight_Decimal { get; set; }
        public int HardwareKitBoxCount { get; set; }
        public int HardwareKitsPerUnitCount { get; set; }
        public int QtyInStock { get; set; }
        public int QtyOnOrder { get; set; }
        public int QtyAvailable
        {
            get
            {
                return QtyInStock - QtyOnOrder;
            }
        }
    }
}
