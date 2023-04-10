using KitTracker.Entities.Tradesoft;
using System.Collections.Generic;
using System.Data;
using System.Threading.Tasks;

namespace KitTracker.Repositories
{
	public interface ITradesoftRepository
	{
		Task Authenticate(IDbConnection conn);
		Task<Dictionary<int, vINVENTORY_ITEM>> GetInventoryItems(IEnumerable<int> invNbrs);
		Task<Dictionary<int, vGetShipTicketItemInfo>> GetShipTicketInfoByShipTicketItemNbrs(IEnumerable<int> shipTicketItemNbrs);
		Task<IEnumerable<TSWorkOrderData>> GetWorkOrderByCompany(int companyId);
	}
}