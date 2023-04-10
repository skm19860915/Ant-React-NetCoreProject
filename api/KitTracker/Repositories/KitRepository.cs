using System;
using System.Collections.Generic;
using System.Data;
using System.Data.SqlClient;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using KitTracker.Settings;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;
using Dapper;
using KitTracker.Entities;
using Microsoft.AspNetCore.Mvc;
using System.Text.RegularExpressions;
using KitTracker.Entities.Albertson;

namespace KitTracker.Repositories
{
    public class KitRepository
    {
        private readonly ILogger<KitRepository> _logger;
        private readonly string _sqlConnectionString;
        private readonly AlbertsonSettings settings;

        public KitRepository(ILogger<KitRepository> logger,
            IOptions<KitTrackerSettings> kitTrackerSettings,
            IOptionsSnapshot<AlbertsonSettings> settings)
        {
            _logger = logger;
            _sqlConnectionString = kitTrackerSettings.Value.ConnectionString;
            this.settings = settings.Value;
        }

        public async Task<IEnumerable<string>> GetStageNames()
        {
            using (IDbConnection conn = new SqlConnection(_sqlConnectionString))
            {
                var stages = await conn.QueryAsync<string>("select StageName from dbo.Stage order by StageId asc");
                return stages;
            }
        }

        public async Task<Stage> GetStage(string stageName)
        {
            using (IDbConnection conn = new SqlConnection(_sqlConnectionString))
            {
                var stage = await conn.QueryAsync<Stage>("select * from dbo.Stage where StageName = @StageName", new { stageName });
                return stage.FirstOrDefault();
            }
        }

        public async Task<Kit> GetKit(string kitNumber)
        {
            using (IDbConnection conn = new SqlConnection(_sqlConnectionString))
            {
                var kit = await conn.QueryAsync<Kit>("select * from dbo.Kit where KitNumber = @KitNumber", new { kitNumber });
                return kit.FirstOrDefault();
            }
        }

        public async Task<Item> GetItem(string serialNumber)
        {
            using (IDbConnection conn = new SqlConnection(_sqlConnectionString))
            {
                var kit = await conn.QueryAsync<Item>(@"
select * from dbo.Item as i
join dbo.Stage as s on i.StageId = s.StageId
join dbo.Kit as k on i.KitId = k.KitId
where SerialNumber = @SerialNumber
", new { serialNumber });
                return kit.FirstOrDefault();
            }
        }

        public async Task<IEnumerable<Item>> GetItems()
        {
            using (IDbConnection conn = new SqlConnection(_sqlConnectionString))
            {
                var kits = await conn.QueryAsync<Item>(@"
select * from dbo.Item as i
join dbo.Stage as s on i.StageId = s.StageId
join dbo.Kit as k on i.KitId = k.KitId
");
                return kits;
            }
        }

        public async Task UpdateItem(string serialNumber, string kitNumber, string weekOf, string stageName)
        {
            serialNumber = serialNumber.ToUpper();
            if (kitNumber != null)
                kitNumber = kitNumber.ToUpper();
            if (weekOf != null)
                weekOf = weekOf.ToUpper();

            if (!Regex.IsMatch(serialNumber, settings.SerialNumberRegex))
                throw new InvalidOperationException("Invalid serial number");

            using (IDbConnection conn = new SqlConnection(_sqlConnectionString))
            {
                int? kitId = null;
                var stage = await GetStage(stageName);
                if (stage == null)
                    throw new InvalidOperationException("Stage name does not exist");

                var item = await GetItem(serialNumber);
                if (item?.KitId == null)
                {
                    if (stage.StageId >= 4)
                    {
                        if (string.IsNullOrWhiteSpace(kitNumber))
                            throw new InvalidOperationException($"Kit number field missing");
                        if (!Regex.IsMatch(kitNumber, settings.KitNumberRegex))
                            throw new InvalidOperationException("Invalid kit number");
                        var kit = await GetKit(kitNumber);
                        if (kit == null)
                            throw new InvalidOperationException($"Kit number {kitNumber} does not exist");
                        kitId = kit.KitId;
                    }
                }
                else
                    kitId = item.KitId;

                if (item?.WeekOf == null)
                {
                    if (stage.StageId >= 4)
                    {
                        if (!Regex.IsMatch(weekOf, settings.WeekOfRegex))
                            throw new InvalidOperationException("Invalid week of");
                        if (string.IsNullOrWhiteSpace(weekOf))
                            throw new InvalidOperationException($"WeekOf field missing");
                    }
                }
                else
                    weekOf = item.WeekOf;

                await conn.ExecuteAsync(@"
if exists(select * from dbo.Item where SerialNumber = @SerialNumber)
begin
	update dbo.Item set
		KitId = @KitId
		,StageId = @StageId
		,WeekOf = @WeekOf
		,LastUpdated = GETDATE()
	where SerialNumber = @SerialNumber
end
else
begin
	insert into dbo.Item (SerialNumber, KitId, StageId, WeekOf)
	values (
		@SerialNumber
		,@KitId
		,@StageId
		,@WeekOf
	)
end
			    ", new { serialNumber, kitId, weekOf, stage.StageId });
            }
        }

        public async Task<IEnumerable<StageCount>> GetStageCounts()
        {
            using (IDbConnection conn = new SqlConnection(_sqlConnectionString))
            {
                var items = await GetItems();
                return items.GroupBy(i => new { i.StageId, i.StageName })
                    .Select(s => new StageCount()
                    {
                        StageId = s.Key.StageId,
                        StageName = s.Key.StageName,
                        KitCounts = s.GroupBy(i => new { i.KitId, i.KitNumber, i.KitName })
                            .Select(k => new KitCount()
                            {
                                KitName = k.Key.KitName,
                                KitNumber = k.Key.KitNumber,
                                Count = k.Count()
                            })
                            .OrderBy(k => k.KitName)
                    })
                    .OrderBy(s => s.StageId);
            }
        }

        public async Task<IEnumerable<Item>> GetItemsMovedToStageToday(int stageId)
        {
            using (IDbConnection conn = new SqlConnection(_sqlConnectionString))
            {
                return await conn.QueryAsync<Item>(@"
select * from dbo.AuditLog_ItemHistory as h
join dbo.Item as i on h.ItemId = i.ItemId
join dbo.Stage as s on h.StageId = s.StageId
join dbo.Kit as k on h.KitId = k.KitId
where convert(varchar(10), TimeOfUpdate, 102)
    = convert(varchar(10), getdate(), 102)
	and s.StageId = @StageId
", new { stageId });
            }
        }

        public async Task<ReportData> GetReportData()
        {
            var result = new ReportData();

            using (IDbConnection conn = new SqlConnection(_sqlConnectionString))
            {
                result.StageCounts = await GetStageCounts();
                result.KitsByWeekCounts = await conn.QueryAsync<KitsByWeekCount>(@"
select WeekOf, KitNumber, KitName, s.StageId, StageName, COUNT(*) as Count from dbo.Item as i
join dbo.Stage as s on i.StageId = s.StageId
join dbo.Kit as k on i.KitId = k.KitId
group by WeekOf, KitNumber, KitName, s.StageId, StageName
");
                result.ItemsMovedToPackingToday = await GetItemsMovedToStageToday(6);
                result.ItemsMovedToShippedToday = await GetItemsMovedToStageToday(8);
            }

            return result;
        }
    }
}
