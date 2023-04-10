using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace KitTracker.Entities.Tradesoft
{
    public class vINVENTORY_ITEM
    {
        public int InvNbr { get; set; }
        public short? LibDivRef { get; set; }
        public short? LibSubDivRef { get; set; }
        public short? LibItemRef { get; set; }
        public string LeadTime { get; set; }
        public decimal? ReorderPoint { get; set; }
        public decimal? ReorderQty { get; set; }
        public short? OrdUomRef { get; set; }
        public decimal? QtyOnHand { get; set; }
        public decimal? QtyOnOrder { get; set; }
        public decimal? QtyOnHandReserved { get; set; }
        public decimal? QtyOnOrderReserved { get; set; }
        public string Notes { get; set; }
        public int? InvTypeNbr { get; set; }
        public decimal? MatCost { get; set; }
        public decimal? LaborCost { get; set; }
        public decimal? Price { get; set; }
        public decimal? AvgUnitCost { get; set; }
        public decimal? ItemValue { get; set; }
        public string Code { get; set; }
        public int? Pick1Nbr { get; set; }
        public int? Pick2Nbr { get; set; }
        public string Size { get; set; }
        public int? Weight { get; set; }
        public decimal? OverheadMarkup { get; set; }
        public string Descr { get; set; }
        public string IDescr2 { get; set; }
        public string IDescr3 { get; set; }
        public string IDescr4 { get; set; }
        public string IDescr5 { get; set; }
        public int? TrackByThePiece { get; set; }
        public short? StockUOMRef { get; set; }
        public int? InvConvNbr { get; set; }
        public short? FinGoodGLacct { get; set; }
        public int? FinGoodTaxInd { get; set; }
        public short? GLacct { get; set; }
        public int? BoxQty { get; set; }
        public int? Inactive { get; set; }
        public int Width
        {
            get { return int.Parse(IDescr2 ?? "0"); }
            set { IDescr2 = value.ToString(); }
        }
        public int Depth
        {
            get { return int.Parse(IDescr3 ?? "0"); }
            set { IDescr3 = value.ToString(); }
        }
        public int Height
        {
            get { return int.Parse(IDescr4 ?? "0"); }
            set { IDescr4 = value.ToString(); }
        }
        public decimal QtyAvailable
        {
            get { return ItemValue ?? 0; }
            set { ItemValue = value; }
        }
        public int InvLocNbr { get; set; }
    }
}
