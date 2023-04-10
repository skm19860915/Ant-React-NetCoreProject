using System.Collections.Generic;
using System.Data;
using System.Data.SqlClient;
using System.Linq;
using System.Threading.Tasks;
using Dapper;
using KitTracker.Entities.Tradesoft;
using KitTracker.Settings;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;

namespace KitTracker.Repositories
{
	public class FakeTradesoftRepository : ITradesoftRepository
	{
		public FakeTradesoftRepository(ILogger<ITradesoftRepository> logger,
			IOptions<TradesoftSettings> settings)
		{
		}

		public Task Authenticate(IDbConnection conn)
		{
			return Task.FromResult(true);
		}

		public Task<IEnumerable<TSWorkOrderData>> GetWorkOrderByCompany(int companyId)
		{
			return Task.FromResult((IEnumerable<TSWorkOrderData>)new List<TSWorkOrderData>());
		}

		public Task<Dictionary<int, vGetShipTicketItemInfo>> GetShipTicketInfoByShipTicketItemNbrs(IEnumerable<int> shipTicketItemNbrs)
		{
			return Task.FromResult(new Dictionary<int, vGetShipTicketItemInfo>());
		}

		public Task<Dictionary<int, vINVENTORY_ITEM>> GetInventoryItems(IEnumerable<int> invNbrs)
		{
			return Task.FromResult(new Dictionary<int, vINVENTORY_ITEM>());
		}
	}
}

