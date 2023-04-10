using System.Collections.Generic;
using System.Data;
using System.Data.SqlClient;
using System.Linq;
using System.Threading.Tasks;
using Dapper;
using KitTracker.Entities.Portal;
using KitTracker.Settings;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;

namespace KitTracker.Repositories
{
	public class InventoryRepository
	{
		private readonly ILogger<InventoryRepository> _logger;
		private readonly string _connectionString;
		private readonly ITradesoftRepository _tradesoftRepository;
		private readonly FTPService _ftpService;

		public InventoryRepository(ILogger<InventoryRepository> logger,
			IOptions<PortalSettings> portalSettings,
			ITradesoftRepository tradesoftRepository,
			FTPService ftpService)
		{
			_logger = logger;
			_connectionString = portalSettings.Value.ConnectionString;
			_tradesoftRepository = tradesoftRepository;
			_ftpService = ftpService;
		}

		private async Task PopulateShoppakData(params tItem[] items)
		{
			using (IDbConnection conn = new SqlConnection(_connectionString))
			{
				var invNbrs = items.Select(i => i.ShopPAK_InvNbr);
				var spItemsDict = await _tradesoftRepository.GetInventoryItems(invNbrs);

				foreach (tItem item in items)
				{
					var itemsOnOrder = await conn.QueryAsync<tOrderItem>(@"
select * from dbo.tOrderItem
where StatusId < @ShippedStatusId
    and ItemId = @ItemId
", new { ShippedStatusId = (int)OrderStatuses.Shipped, item.ItemId });

					if (itemsOnOrder.Any())
						item.QtyOnOrder = itemsOnOrder.Sum(oi => oi.QuantityOrdered);

					if (spItemsDict.ContainsKey(item.ShopPAK_InvNbr))
						item.QtyInStock = (int)(spItemsDict[item.ShopPAK_InvNbr].QtyOnHand);
					else
						item.QtyInStock = 0;
				}
			}
		}

		public async Task<IEnumerable<tItem>> GetInventoryItems(int companyId, string searchValue = null, bool available = false)
		{
			using (IDbConnection conn = new SqlConnection(_connectionString))
			{
				var inventoryItems = await conn.QueryAsync<tItem>(@"
select * from dbo.tItem
where CompanyId = @CompanyId
	and ProjectPak_JobItemId > -1
	and (@SearchValue is null or ItemName like CONCAT('%', @SearchValue, '%'))
order by ItemName
", new { companyId, searchValue });
				await PopulateShoppakData(inventoryItems.ToArray());

				if (available)
					inventoryItems = inventoryItems.Where(i => i.QtyAvailable > 0);

				return inventoryItems;
			}
		}

		public async Task<tItem> GetInventoryItem(int itemId)
		{
			using (IDbConnection conn = new SqlConnection(_connectionString))
			{
				var item = await conn.QuerySingleOrDefaultAsync<tItem>(@"
						select * from dbo.tItem where ItemID = @itemId
						", new { itemId });
				if (item == null)
					return null;

				await PopulateShoppakData(item);

				return item;
			}
		}

		public async Task<tItem> GetInventoryItem(string itemName)
		{
			using (IDbConnection conn = new SqlConnection(_connectionString))
			{
				var item = await conn.QuerySingleOrDefaultAsync<tItem>(@"
						select * from dbo.tItem where ItemName = @ItemName
						", new { itemName });
				if (item == null)
					return null;

				await PopulateShoppakData(item);

				return item;
			}
		}

		public async Task<FileResultData> GetProductImage(int itemId)
		{
			using (IDbConnection conn = new SqlConnection(_connectionString))
			{
				var inventoryItem = await GetInventoryItem(itemId);

				if (inventoryItem.ProductImage_FileExtension == null)
					return null;
				else
					return new FileResultData()
					{
						MimeType = "image/" + inventoryItem.ProductImage_FileExtension,
						Bytes = _ftpService.DownloadFile($"UploadedFiles/tItem/{inventoryItem.ItemId}_ProductFullImage.{inventoryItem.ProductImage_FileExtension}")
					};
			}
		}

		public async Task<FileResultData> GetProductImageThumbnail(int itemId)
		{
			using (IDbConnection conn = new SqlConnection(_connectionString))
			{
				var inventoryItem = await GetInventoryItem(itemId);

				if (inventoryItem.ProductImage_FileExtension == null)
					return null;
				return new FileResultData()
				{
					MimeType = "image/png",
					Bytes = _ftpService.DownloadFile($"UploadedFiles/tItem/{inventoryItem.ItemId}_ProductThumbnailImage.png")
				};
			}
		}

		public async Task<FileResultData> GetPackageImage(int itemId)
		{
			using (IDbConnection conn = new SqlConnection(_connectionString))
			{
				var inventoryItem = await GetInventoryItem(itemId);

				if (inventoryItem.PackageImage_FileExtension == null)
					return null;
				return new FileResultData()
				{
					MimeType = "image/" + inventoryItem.PackageImage_FileExtension,
					Bytes = _ftpService.DownloadFile($"UploadedFiles/tItem/{inventoryItem.ItemId}_PackageFullImage.{inventoryItem.PackageImage_FileExtension}")
				};
			}
		}

		public async Task<FileResultData> GetPackageImageThumbnail(int itemId)
		{
			using (IDbConnection conn = new SqlConnection(_connectionString))
			{
				var inventoryItem = await GetInventoryItem(itemId);

				if (inventoryItem.PackageImage_FileExtension == null)
					return null;
				return new FileResultData()
				{
					MimeType = "image/png",
					Bytes = _ftpService.DownloadFile($"UploadedFiles/tItem/{inventoryItem.ItemId}_PackageThumbnailImage.png")
				};
			}
		}
		public async Task<bool> VerifyQuantity(int itemId)
		{
			using (IDbConnection conn = new SqlConnection(_connectionString))
			{
				return await conn.ExecuteScalarAsync<bool>(@"select top 1 ItemID from tOrderItem where ItemId = @ItemId", new { itemId });
			}
		}

		public async Task<List<tItem>> SearchItemNames(string searchValue)
		{
			using (IDbConnection conn = new SqlConnection(_connectionString))
			{
				var items = await conn.QueryAsync<tItem>(@"
select ItemName from tItem where  ItemName Like '%' + @ItemName + '%' ", new { searchValue });
				return items.ToList();
			}
		}
	}
}
