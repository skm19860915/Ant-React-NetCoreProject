using Dapper;
using KitTracker.CustomProvider;
using KitTracker.Entities;
using KitTracker.Entities.Portal;
using KitTracker.Entities.Portal.OMC;
using KitTracker.Extensions;
using KitTracker.Settings;
using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;
using System;
using System.Collections.Generic;
using System.Data;
using System.Data.SqlClient;
using System.IO;
using System.Linq;
using System.Security.Cryptography;
using System.Text;
using System.Threading.Tasks;

namespace KitTracker.Repositories
{
	public class OMCRepository
	{
		private readonly ILogger<OMCRepository> _logger;
		private readonly string _connectionString;
		private readonly FTPService _ftpService;
		public OMCRepository(ILogger<OMCRepository> logger,
			FTPService ftpService,
			IOptions<PortalSettings> settings)
		{
			_logger = logger;
			_connectionString = settings.Value.ConnectionString;
			_ftpService = ftpService;
		}

		public class AuthenticationParameters : PlayerKey
		{
			public long TimestampMillis { get; set; }
			public string Sha512Hash { get; set; }
		}

		public static bool AuthenticateAnonymousRequest(AuthenticationParameters parameters)
		{
			var utcTimestamp = new DateTime(parameters.TimestampMillis);
			if (utcTimestamp > DateTime.UtcNow.AddSeconds(60)) // Timestamp not within 1 minute of supposed request
				return false;

			using (HMACSHA512 shaM = new HMACSHA512(Encoding.UTF8.GetBytes("v)+eF)YgGaZ\"KI?:t...y}!Ly)kh<u9([yb:bOXGL9;V<-fu(f.eUuudr}HN_X<")))
			{
				string msg = $"{parameters.MediaContentStoreId}_{parameters.DisplayLocationIndex}_{parameters.TimestampMillis}";
				string hash = shaM.ComputeHash(Encoding.UTF8.GetBytes(msg)).ToHexString();

				return parameters.Sha512Hash == hash;
			}
		}

		public async Task<tMediaContentPlayer> GetPlayer(PlayerKey playerKey)
		{
			using (IDbConnection conn = new SqlConnection(_connectionString))
			{
				if (conn.State == ConnectionState.Closed)
					conn.Open();

				using (IDbTransaction trans = conn.BeginTransaction())
				{
					return await GetPlayer(playerKey, trans);
				}
			}
		}

		public async Task<tMediaContentPlayer> GetPlayer(PlayerKey playerKey, IDbTransaction trans)
		{
			return await trans.Connection.QuerySingleOrDefaultAsync<tMediaContentPlayer>(@"
select * from tMediaContentPlayer
where MediaContentStoreId = @MediaContentStoreId
	and DisplayLocationIndex = @DisplayLocationIndex
", playerKey, trans);
		}

		public async Task<IEnumerable<tMediaContentPlayer>> GetStorePlayers(int mediaContentStoreId, IDbTransaction trans)
		{
			return await trans.Connection.QueryAsync<tMediaContentPlayer>(@"
select * from tMediaContentPlayer p
where p.MediaContentStoreId = @mediaContentStoreId
", new { mediaContentStoreId }, trans);
		}

		public async Task<tMediaContentStore> GetStore(int mediaContentStoreId, IDbTransaction trans)
		{
			return await trans.Connection.QuerySingleOrDefaultAsync<tMediaContentStore>(@"
select * from tMediaContentStore where MediaContentStoreId = @MediaContentStoreId
", new { mediaContentStoreId }, trans);
		}

		public async Task<IEnumerable<tMediaContentRetailer>> GetRetailers()
		{
			using (IDbConnection conn = new SqlConnection(_connectionString))
			{
				string sql = @"
select * from tMediaContentRetailer
";
				var result = await conn.QueryAsync<tMediaContentRetailer>(sql);
				return result;
			}
		}

		private class StoreStatusesMapper
		{
			public StoreStatusesMapper()
			{
				StoreStatusesDict = new Dictionary<int, StoreStatus>();
				MapStoreStatusesAndPlayerStatuses = (storeStatus, playerStatus) =>
				{
					if (!StoreStatusesDict.TryGetValue(storeStatus.MediaContentStoreId, out StoreStatus storeStatusEntry))
					{
						storeStatusEntry = storeStatus;
						storeStatusEntry.PlayerStatuses = new List<PlayerStatus>();

						StoreStatusesDict.Add(storeStatusEntry.MediaContentStoreId, storeStatusEntry);
					}

					storeStatusEntry.PlayerStatuses.Add(playerStatus);
					return storeStatusEntry;
				};
			}

			public Dictionary<int, StoreStatus> StoreStatusesDict { get; set; }
			public Func<StoreStatus, PlayerStatus, StoreStatus> MapStoreStatusesAndPlayerStatuses { get; set; }
		}

		public async Task<IEnumerable<StoreStatus>> GetStoreStatuses(int[] retailerIds)
		{
			using (IDbConnection conn = new SqlConnection(_connectionString))
			{
				string sql = @"
declare @PollInterval int = CONVERT(int, CONVERT(VARCHAR(MAX), (select [Value] from tGlobalParameter where [Name] = 'OMCAndroidAppUpdateTimerDelaySeconds')))

select * from
(select
	s.MediaContentStoreId
	,rt.RetailerName
	,r.RegionName
	,s.StoreNumber
	,s.StoreName
	,d.DisplayName
	,s.Street1
	,s.Street2
	,s.City
	,s.State
	,s.PostalCode as ZipCode
	,p.MediaContentPlayerId
	,p.DisplayLocationIndex
	,u.UploadedFileId
	,u.FileName
	,p.UpdatingContent
	,p.UpdatingSoftware
	,case when CAST(DATEDIFF(SS, p.LastResponse, GETDATE()) as int) > @PollInterval * 3 or p.LastResponse is null then 0 else 1 end as [Online]
	,ROW_NUMBER() OVER(PARTITION BY p.MediaContentPlayerId ORDER BY StartDateTime desc) AS player_order
from tMediaContentPlayer as p
join tMediaContentStore as s on p.MediaContentStoreID = s.MediaContentStoreID
left join tMediaContentScheduleLibraryItem as sli on p.MediaContentPlayerID = sli.MediaContentPlayerID
left join tMediaContentLibraryItem as li on sli.MediaContentLibraryItemID = li.MediaContentLibraryItemID
left join tMediaContentLibraryItemPlayItem as lipi on li.MediaContentLibraryItemID = lipi.MediaContentLibraryItemID
left join tUploadedFile as u on lipi.UploadedFileID = u.UploadedFileID
join tMediaContentRegion as r on s.MediaContentRegionID = r.MediaContentRegionID
join tMediaContentDisplayType as d on s.MediaContentDisplayTypeID = d.MediaContentDisplayTypeID
join tMediaContentRetailer as rt on d.MediaContentRetailerID = rt.MediaContentRetailerID
where rt.MediaContentRetailerId in @RetailerIds
) as t
where player_order = 1
";
				var mapper = new StoreStatusesMapper();
				await conn.QueryAsync(sql,
					mapper.MapStoreStatusesAndPlayerStatuses,
					splitOn: "MediaContentPlayerId",
					param: new { retailerIds }
				);
				var result = mapper.StoreStatusesDict.Values;
				return result;
			}
		}

		public async Task<tMediaContentDisplayType> GetStoreDisplayType(int mediaContentDisplayTypeId, IDbTransaction trans)
		{
			return await trans.Connection.QuerySingleOrDefaultAsync<tMediaContentDisplayType>(@"
select * from tMediaContentDisplayType where MediaContentDisplayTypeId = @MediaContentDisplayTypeId
", new { mediaContentDisplayTypeId }, trans);
		}

		public async Task<int?> GetPlayerScheduledContentId(PlayerKey playerKey, IDbTransaction trans)
		{
			int uploadedFileId = (await trans.Connection.QueryAsync<int>(@"
select lipi.UploadedFileId from tMediaContentScheduleLibraryItem as sli
join tMediaContentPlayer p on sli.MediaContentPlayerId = p.MediaContentPlayerId
join tMediaContentLibraryItem li on sli.MediaContentLibraryItemId = li.MediaContentLibraryItemId
join tMediaContentLibraryItemPlayItem lipi on li.MediaContentLibraryItemId = lipi.MediaContentLibraryItemId
join tUploadedFile u on lipi.UploadedFileId = u.UploadedFileId
where p.MediaContentStoreId = @MediaContentStoreId
	and p.DisplayLocationIndex = @DisplayLocationIndex
	and sli.StartDateTime < GETDATE()
	and u.FinishedUploading = 1
order by sli.StartDateTime desc, sli.MediaContentScheduleLibraryItemId desc
", playerKey, trans)).FirstOrDefault();
			if (uploadedFileId == 0)
				return null;

			return uploadedFileId;
		}

		public async Task<tMediaContentLEDColor> GetStoreScheduledColor(int mediaContentStoreId, IDbTransaction trans)
		{
			return (await trans.Connection.QueryAsync<tMediaContentLEDColor>(@"
select lc.* from tMediaContentScheduleLEDColor slc
join tMediaContentLEDColor lc on slc.MediaContentLEDColorId = lc.MediaContentLEDColorId
join tMediaContentStore s on slc.MediaContentStoreId = s.MediaContentStoreId
where s.MediaContentStoreId = @MediaContentStoreId and slc.StartDateTime < GETDATE()
order by slc.StartDateTime desc, slc.MediaContentScheduleLEDColorId desc
", new { mediaContentStoreId }, trans)).FirstOrDefault();
		}

		public class AddPlayerLogParameters
		{
			public PlayerKey PlayerKey { get; set; }
			public string LogMessage { get; set; }
		}

		public async Task AddPlayerLogMessage(AddPlayerLogParameters parameters)
		{
			using (IDbConnection conn = new SqlConnection(_connectionString))
			{
				if (conn.State == ConnectionState.Closed)
					conn.Open();

				using (IDbTransaction trans = conn.BeginTransaction())
				{
					try
					{
						var player = await GetPlayer(parameters.PlayerKey, trans);

						if (player == null)
							throw new Exception($@"Player at location index {
								parameters.PlayerKey.DisplayLocationIndex} in store ID {
								parameters.PlayerKey.MediaContentStoreId} not found."
							);

						await conn.ExecuteAsync(@"
insert into tMediaContentPlayerLog (MediaContentPlayerId, LogMessage)
values (@MediaContentPlayerId, @LogMessage)
", new { player.MediaContentPlayerId, parameters.LogMessage }, trans);

						trans.Commit();
					}
					catch
					{
						trans.Rollback();

						throw;
					}
				}
			}
		}

		public async Task<IEnumerable<DmxChannelSetting>> GetStoreScheduledDmxSettings(int mediaContentStoreId, IDbTransaction trans)
		{
			var scheduleColor = await GetStoreScheduledColor(mediaContentStoreId, trans);

			int ledColorR = 0;
			int ledColorG = 0;
			int ledColorB = 0;
			int ledColorW = 0;
			if (scheduleColor != null)
			{
				ledColorR = scheduleColor.R;
				ledColorG = scheduleColor.G;
				ledColorB = scheduleColor.B;
				ledColorW = scheduleColor.W;
			}

			DmxChannelSetting[] result = new DmxChannelSetting[16];
			for (int i = 0; i < result.Length; i++)
				result[i] = new DmxChannelSetting
				{
					Start = i,
					R = ledColorR,
					G = ledColorG,
					B = ledColorB,
					W = ledColorW,
					FadeMillis = 0
				};

			return result;
		}

		public async Task<PlayerState> GetPlayerState(PlayerKey playerKey)
		{
			using (IDbConnection conn = new SqlConnection(_connectionString))
			{
				if (conn.State == ConnectionState.Closed)
					conn.Open();

				using (IDbTransaction trans = conn.BeginTransaction())
				{
					try
					{
						var player = await GetPlayer(playerKey, trans);

						if (player == null)
						{
							return null;
						}
						else
						{
							player.LastResponse = DateTime.UtcNow;

							bool rebootRequest = player.RebootRequest;
							var store = await GetStore(player.MediaContentStoreId, trans);
							var display = await GetStoreDisplayType(store.MediaContentDisplayTypeId, trans);
							bool isRGBW = display.RGBW;
							player.RebootRequest = false;
							player.UpdatingContent = false;
							player.UpdatingSoftware = false;

							string systemCommand = player.SystemCommand;
							player.SystemCommand = null;

							var dmxSettings = await GetStoreScheduledDmxSettings(store.MediaContentStoreId, trans);

							int? contentId = await GetPlayerScheduledContentId(playerKey, trans);

							string appVersion = player.AppVersion;

							DateTime now = DateTime.UtcNow;
							var storePlayers = await GetStorePlayers(store.MediaContentStoreId, trans);
							List<OutletState> outletStates = new();

							if (store.RequestReboot)
							{
								outletStates.Add(new OutletState { Index = 7, Command = OutletCommands.Off });
								if (store.LastBootCycle != null && (now - (store.LastBootCycle ?? now)).TotalSeconds > 60)
								{
									store.LastBootCycle = now;
									store.RequestReboot = false;
								}
							}

							int timeoutSeconds = 180;
							foreach (var storePlayer in storePlayers)
							{
								if (storePlayer.PowerOn)
								{
									if ((storePlayer.LastResponse != null // Has been online at least once
										&& ((now - (storePlayer.LastResponse ?? now)).TotalSeconds > timeoutSeconds) // Player has been timed out and needs power cycled...
										&& (storePlayer.LastPowerCycle == null || (now - (storePlayer.LastPowerCycle ?? now)).TotalSeconds > timeoutSeconds) // Never been power cycled before or timeout has been reset
										&& storePlayer.PowerOn) // Should be powered on
										|| storePlayer.RebootRequest)
									{
										outletStates.Add(new OutletState { Index = storePlayer.OutletIndex, Command = OutletCommands.Cycle });
										storePlayer.LastPowerCycle = now;
										storePlayer.UpdatingContent = false;
										storePlayer.UpdatingSoftware = false;
										storePlayer.RebootRequest = false;
									}
									else
									{
										outletStates.Add(new OutletState { Index = storePlayer.OutletIndex, Command = OutletCommands.On });
									}
								}
								else
								{
									outletStates.Add(new OutletState { Index = storePlayer.OutletIndex, Command = OutletCommands.Off });
								}
							}

							// Update player state
							await trans.Connection.ExecuteAsync(@"
UPDATE [dbo].[tMediaContentPlayer]
   SET [ScreenshotRequest] = @ScreenshotRequest
      ,[LastResponse] = @LastResponse
      ,[RebootRequest] = @RebootRequest
      ,[UpdatingContent] = @UpdatingContent
      ,[UpdatingSoftware] = @UpdatingSoftware
      ,[AppVersion] = @AppVersion
      ,[LastPowerCycle] = @LastPowerCycle
      ,[PowerOn] = @PowerOn
	  ,[SystemCommand] = @SystemCommand
 WHERE MediaContentPlayerId = @MediaContentPlayerId
", player, trans);

							// Update store state
							await trans.Connection.ExecuteAsync(@"
UPDATE [dbo].[tMediaContentStore]
   SET [RequestReboot] = @RequestReboot
      ,[LastBootCycle] = @LastBootCycle
 WHERE MediaContentStoreId = @MediaContentStoreId
", store, trans);

							trans.Commit();

							return new PlayerState
							{
								ContentId = contentId,
								IsRGBW = isRGBW,
								DmxChannelSettings = dmxSettings,
								AppVersion = appVersion,
								ScreenshotRequest = player.ScreenshotRequest,
								RebootRequest = rebootRequest,
								PollIntervalSeconds = player.PollingIntervalSeconds,
								OutletStates = outletStates,
								SystemCommand = systemCommand
							};
						}
					}
					catch
					{
						trans.Rollback();

						throw;
					}
				}
			}
		}

		public FileResultData GetContentFileResult(int contentId)
		{
			return new FileResultData()
			{
				MimeType = "video/mp4",
				Bytes = _ftpService.DownloadFile($"UploadedFiles/tUploadedFile/{contentId}.bin")
			};
		}

		public async Task<FileResultData> GetPlayerAppZipFileResult(PlayerKey playerKey)
		{
			var player = await GetPlayer(playerKey);

			return new FileResultData()
			{
				MimeType = "application/zip",
				Bytes = _ftpService.DownloadFile($"UploadedFiles/OMC2Releases/omcapp-v{player.AppVersion}.zip")
			};
		}

		public async Task<FileResultData> RequestPlayerContent(PlayerKey playerKey)
		{
			using (IDbConnection conn = new SqlConnection(_connectionString))
			{
				if (conn.State == ConnectionState.Closed)
					conn.Open();

				using (IDbTransaction trans = conn.BeginTransaction())
				{
					try
					{
						var player = await GetPlayer(playerKey, trans);

						if (player == null)
						{
							return null;
						}
						else
						{
							FileResultData result = null;

							player.LastResponse = DateTime.Now;

							var contentId = await GetPlayerScheduledContentId(playerKey, trans);

							if (contentId == null)
								return null;

							DateTime currentDate = DateTime.UtcNow.Date;
							bool isDisabled = player.DisableDownload;
							player.DateWhenDownloadRequested = currentDate;

							// Reset download count for today
							var lastDownloadRequestDate = player.DateWhenDownloadRequested;
							if (!currentDate.Equals((lastDownloadRequestDate ?? DateTime.Now.Date)))
							{
								player.DownloadRequestCount = 0;
							}
							player.DownloadRequestCount += 1;

							if (!isDisabled)
							{
								int maxDownloads = 9999;

								if (player.DownloadRequestCount <= maxDownloads)
								{
									player.UpdatingContent = true;

									result = GetContentFileResult(contentId.Value);
								}
								else
								{
									player.DisableDownload = true;
								}
							}

							await trans.Connection.ExecuteAsync(@"
UPDATE [dbo].[tMediaContentPlayer]
   SET [LastResponse] = @LastResponse
      ,[DateWhenDownloadRequested] = @DateWhenDownloadRequested
      ,[UpdatingContent] = @UpdatingContent
      ,[DownloadRequestCount] = @DownloadRequestCount
      ,[DisableDownload] = @DisableDownload
 WHERE MediaContentPlayerId = @MediaContentPlayerId
", player, trans);

							trans.Commit();

							return result;
						}
					}
					catch
					{
						trans.Rollback();

						throw;
					}
				}
			}
		}

		public class UploadScreenshotParameters
		{
			public PlayerKey PlayerKey { get; set; }
			public IFormFile Screenshot { get; set; }
		}

		public async Task UploadScreenshot(UploadScreenshotParameters parameters)
		{
			using (IDbConnection conn = new SqlConnection(_connectionString))
			{
				if (conn.State == ConnectionState.Closed)
					conn.Open();

				using (IDbTransaction trans = conn.BeginTransaction())
				{
					try
					{
						var player = await GetPlayer(parameters.PlayerKey, trans);

						if (player == null)
							throw new Exception($@"Player at location index {
								parameters.PlayerKey.DisplayLocationIndex} in store ID {
								parameters.PlayerKey.MediaContentStoreId} not found."
							);

						var updateParams = new
						{
							player.MediaContentPlayerId,
							parameters.Screenshot.FileName,
							FileDescription = $"Uploaded screenshot for MediaContentPlayerId {player.MediaContentPlayerId}",
							CreatedDateTime = DateTime.UtcNow,
							Creator_UserID = ApplicationUser.SystemUserId,
							LastUpdatedDateTime = DateTime.UtcNow,
							LastUpdater_UserID = ApplicationUser.SystemUserId,
							FinishedUploading = true
						};

						int uploadedFileId = await trans.Connection.QuerySingleAsync<int>(@"
declare @ScreenshotFile_UploadedFileId int = (select ScreenshotFile_UploadedFileId from dbo.tMediaContentPlayer where MediaContentPlayerId = @MediaContentPlayerId)
if (@ScreenshotFile_UploadedFileId is null)
	begin
		INSERT INTO [dbo].[tUploadedFile]
			([FileName]
			,[FileDescription]
			,[CreatedDateTime]
			,[Creator_UserID]
			,[LastUpdatedDateTime]
			,[LastUpdater_UserID]
			,[FinishedUploading])
		VALUES
			(@FileName
			,@FileDescription
			,@CreatedDateTime
			,@Creator_UserId
			,@LastUpdatedDateTime
			,@LastUpdater_UserId
			,@FinishedUploading)
		set @ScreenshotFile_UploadedFileId = (CAST(SCOPE_IDENTITY() as int))
	end
else
	begin
		UPDATE [dbo].[tUploadedFile]
		SET [FileName] = @FileName
			,[FileDescription] = @FileDescription
			,[CreatedDateTime] = @CreatedDateTime
			,[Creator_UserID] = @Creator_UserID
			,[LastUpdatedDateTime] = @LastUpdatedDateTime
			,[LastUpdater_UserID] = @LastUpdater_UserID
			,[FinishedUploading] = @FinishedUploading
		WHERE UploadedFileId = @ScreenshotFile_UploadedFileId
	end

UPDATE [dbo].[tMediaContentPlayer]
   SET [ScreenshotRequest] = 0, ScreenshotFile_UploadedFileId = @ScreenshotFile_UploadedFileId
 WHERE MediaContentPlayerId = @MediaContentPlayerId

select @ScreenshotFile_UploadedFileId
", updateParams, trans);

						using var memoryStream = new MemoryStream();
						await parameters.Screenshot.CopyToAsync(memoryStream);
						var binary = memoryStream.ToArray();
						_ftpService.UploadFile($"UploadedFiles/tUploadedFile/{uploadedFileId}.bin", binary);

						trans.Commit();
					}
					catch
					{
						trans.Rollback();

						throw;
					}
				}
			}
		}
	}
}

