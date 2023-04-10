using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace KitTracker.Entities.Hillman
{
    public class WorkOrderLabelExportedStatus
    {
        public int WorkOrderId { get; set; }
        public bool LabelCSVExported { get; set; }
    }

    public class UpdateWorkOrdersLabelExportedStatusModel
    {
        public IEnumerable<WorkOrderLabelExportedStatus> WorkOrderStatuses { get; set; }
    }
}
