using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace KitTracker.Entities.Albertson
{
    public class UpdateItemModel
    {
        public string KitNumber { get; set; }
        public string WeekOf { get; set; }
        public string StageName { get; set; }
    }
}
