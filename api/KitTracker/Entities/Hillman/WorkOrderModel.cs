using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace KitTracker.Entities.Hillman
{
	public class WorkOrderModel
	{
		public string HWONumber { get; set; }
		public int PGAWONumber { get; set; }
		public string ItemNumber { get; set; }
		public string BulkPartNumber { get; set; }
		public string BulkPartName { get; set; }
		public int ExpectedQuantity { get; set; }
		public string Rework { get; set; }
		public string CountryOfOrigin { get; set; }
	}
}
