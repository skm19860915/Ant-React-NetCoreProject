﻿using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace KitTracker.Settings
{
    public interface IDatabaseSettings
    {
        public string ConnectionString { get; set; }
    }
}
