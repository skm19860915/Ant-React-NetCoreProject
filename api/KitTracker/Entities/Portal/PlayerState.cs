using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace KitTracker.Entities.Portal
{
	public class DmxChannelSetting
	{
		public int Start { get; set; }
		public int R { get; set; }
		public int G { get; set; }
		public int B { get; set; }
		public int? W { get; set; }
		public int FadeMillis { get; set; }
	}

	public enum OutletCommands { On, Off, Cycle }

	public class OutletState
	{
		public int Index { get; set; } = 0;
		public OutletCommands Command { get; set; } = OutletCommands.On;
	}

	public class PlayerState
	{
		public int? ContentId { get; set; }

		public string AppVersion { get; set; }
		public bool ScreenshotRequest { get; set; }
		public int PollIntervalSeconds { get; set; }
		public bool IsRGBW { get; set; }
		public IEnumerable<DmxChannelSetting> DmxChannelSettings { get; set; }
		public IEnumerable<OutletState> OutletStates { get; set; }
		public bool RebootRequest { get; set; }
		public string SystemCommand { get; set; }
	}
}
