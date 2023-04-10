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
	public class TradesoftRepository : ITradesoftRepository
	{
		private readonly ILogger<TradesoftRepository> _logger;
		private readonly string _connectionString;

		public TradesoftRepository(ILogger<TradesoftRepository> logger,
			IOptions<TradesoftSettings> settings)
		{
			_logger = logger;
			_connectionString = settings.Value.ConnectionString;
		}

		public async Task Authenticate(IDbConnection conn)
		{
			await conn.ExecuteAsync(@"
EXEC('SET TEMPORARY OPTION Connection_authentication=''Company=TradeSoft, Inc.;Application=ProjectPAK;Signature=000fa55157edb8e14d818eb4fe3db41447146f1571g51adc24e2598a0da16f74dd863bc8ca65db0fc3e''') at sadatabase
");
		}

		public async Task<IEnumerable<TSWorkOrderData>> GetWorkOrderByCompany(int companyId)
		{
			using (IDbConnection conn = new SqlConnection(_connectionString))
			{
				await Authenticate(conn);
				var workOrderData = await conn.QueryAsync<TSWorkOrderData>($@"
select * from OPENQUERY(SADATABASE, '
select dba.wo.*, dba.jobs.jobdescr, dba.job.job_tag from dba.wo
join dba.jobs on dba.wo.JobNbr = dba.jobs.jobnbr
join dba.job on dba.jobs.ppakid = dba.job.job_tag
where dba.job.company_nbr = {companyId}
order by dba.wo.wonbr asc
') AS derivedtbl_1
");
				return workOrderData;
			}
		}

		public async Task<Dictionary<int, vGetShipTicketItemInfo>> GetShipTicketInfoByShipTicketItemNbrs(IEnumerable<int> shipTicketItemNbrs)
		{
			using (IDbConnection conn = new SqlConnection(_connectionString))
			{
				await Authenticate(conn);

				var stis = await conn.QueryAsync<vGetShipTicketItemInfo>(@"
select * from vGetShipTicketItemInfo
where ShipTicketItemNbr in @ShipTicketItemNbrs
", new { shipTicketItemNbrs });
				var result = stis.ToDictionary(sti => sti.ShipTicketItemNbr, sti => sti);

				return result;
			}
		}

		public async Task<Dictionary<int, vINVENTORY_ITEM>> GetInventoryItems(IEnumerable<int> invNbrs)
		{
			using (IDbConnection conn = new SqlConnection(_connectionString))
			{
				var items = await conn.QueryAsync<vINVENTORY_ITEM>(@"
select * from vINVENTORY_ITEM
where InvNbr in @InvNbrs
", new { invNbrs });
				var result = items.ToDictionary(sti => sti.InvNbr, sti => sti);
				return result;
			}
		}
	}
}

