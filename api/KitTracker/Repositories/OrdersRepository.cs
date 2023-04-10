using Dapper;
using KitTracker.Entities;
using KitTracker.Entities.Portal;
using KitTracker.Entities.Tradesoft;
using KitTracker.Extensions;
using KitTracker.Services;
using KitTracker.Settings;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;
using System;
using System.Collections.Generic;
using System.Data;
using System.Data.SqlClient;
using System.IO;
using System.Linq;
using System.Net;
using System.Net.Mail;
using System.Net.Mime;
using System.Text;
using System.Threading.Tasks;

namespace KitTracker.Repositories
{
	public class OrdersRepository
	{
		private readonly ILogger<OrdersRepository> _logger;
		private readonly string _connectionString;
		private readonly ITradesoftRepository _tradesoftRepository;
		private readonly InventoryRepository _inventoryRepository;
		private EmailService _emailService;
		public OrdersRepository(ILogger<OrdersRepository> logger,
			IOptions<PortalSettings> settings,
			ITradesoftRepository tradesoftRepository,
			InventoryRepository inventoryRepository,
			EmailService emailService)
		{
			_logger = logger;
			_connectionString = settings.Value.ConnectionString;
			_tradesoftRepository = tradesoftRepository;
			_emailService = emailService;
			_inventoryRepository = inventoryRepository;
		}

		private async Task PopulateOrderItemTrackingInfo(tOrderItem[] orderItems, Dictionary<int, vGetShipTicketItemInfo> shipTicketItemsDict)
		{
			using (IDbConnection conn = new SqlConnection(_connectionString))
			{
				var trackingInfos = await conn.QueryAsync<tShipTicketFreightInfo, tCarrier, tShipTicketFreightInfo>(@"
select stfi.*, c.* from tShipTicketFreightInfo stfi
join tCarrier c on stfi.CarrierId = c.CarrierId
where ShipTicketNbr in @ShipTicketNbrs
",
					(shipTicket, carrier) =>
					{
						shipTicket.Carrier = carrier;
						return shipTicket;
					},
					splitOn: "CarrierId",
					param: new { shipTicketNbrs = shipTicketItemsDict.Values.GroupBy(i => i.ShipTicketNbr).Select(g => g.Key) });
				foreach (var orderItem in orderItems)
				{
					if (orderItem.ShopPAK_ShipTicketItemNbr != null && shipTicketItemsDict.ContainsKey(orderItem.ShopPAK_ShipTicketItemNbr.Value))
					{
						var shipTicketInfo = shipTicketItemsDict[orderItem.ShopPAK_ShipTicketItemNbr.Value];
						var trackingInfo = trackingInfos.Where(t => t.ShipTicketNbr == shipTicketInfo.ShipTicketNbr).SingleOrDefault();
						if (trackingInfo != null)
						{
							orderItem.TrackingInfo = trackingInfo;
							orderItem.ShipTicketItemLineNumber = shipTicketInfo.ItemNbr ?? 0;
						}
					}
				}
			}
		}



		private const string ordersSelect = @"
select
o.[OrderID],o.[CompanyID],[OrderNumber],[OrderComments],o.[CreatedDateTime],o.[Creator_UserID],o.[LastUpdatedDateTime],o.[LastUpdater_UserID],[BillToAddress_LocationName],[BillToAddress_Street1],[BillToAddress_Street2],[BillToAddress_City],[BillToAddress_State],[BillToAddress_PostalCode],[BillToAddress_Country],[FreightAndHandlingCostTotal],[Ariba_OrderRequest_payloadID],[Ariba_TotalPrice],[AdditionalEmailsList],[ClientEmail]
,[OrderItemID],oi.[OrderID],oi.[ItemID],[AssemblyID],[AssemblyQuantity],[QuantityOrdered],[ShipTicketItemNotes],[ShopPAK_ShipTicketItemNbr],[ShipToAddress_LocationName],[ShipToAddress_Street1],[ShipToAddress_Street2],[ShipToAddress_City],[ShipToAddress_State],[ShipToAddress_PostalCode],[ShipToAddress_Country],[InStoreDate],[ExpectedShipDate],[ExpectedArrivalDate],[OrderLineNumber],[ShopPAK_ShipViaNbr],[StatusID],[Ariba_ConfirmationRequest_payloadID],[Ariba_ShipNoticeRequest_payloadID],[ShipToHash],[ShipTicketFreightInfoID],[Ariba_UnitOfMeasure],[HasShipTicketItemBeenPrinted],[LastBOLReminder],[Acknowledged],[ShipToAddress_ContactName],[ItemDescription],[PackageSize_Length],[PackageSize_Width],[PackageSize_Height],[ShipTicketItemNotes],[PackageWeight],
i.ItemName
from tOrder o 
join tOrderItem oi on o.OrderId = oi.OrderId
join tItem i on oi.ItemId = i.ItemId
";
		private class OrdersMapper
		{
			public OrdersMapper()
			{
				OrdersDict = new Dictionary<int, tOrder>();
				MapOrdersAndOrderItems = (order, orderItem) =>
				{
					if (!OrdersDict.TryGetValue(order.OrderId, out tOrder orderEntry))
					{
						orderEntry = order;
						orderEntry.OrderItems = new List<tOrderItem>();

						OrdersDict.Add(orderEntry.OrderId, orderEntry);
					}

					orderEntry.OrderItems.Add(orderItem);
					return orderEntry;
				};
			}

			public Dictionary<int, tOrder> OrdersDict { get; set; }
			public Func<tOrder, tOrderItem, tOrder> MapOrdersAndOrderItems { get; set; }
		}

		public async Task<IEnumerable<OrderModel>> GetOrders(
			int companyId,
			DateTime? needByStartDate,
			DateTime? needByEndDate,
			DateTime? orderStartDate,
			DateTime? orderEndDate)
		{
			using (IDbConnection conn = new SqlConnection(_connectionString))
			{
				var ordersMapper = new OrdersMapper();
				await conn.QueryAsync(@$"
{ordersSelect}
where o.CompanyId = @CompanyId
    and (
		(@OrderStartDate is null or @OrderEndDate is null)
		or (o.CreatedDateTime between @OrderStartDate and @OrderEndDate)
	)
    and (
		(@NeedByStartDate is null or @NeedByEndDate is null)
		or (oi.InStoreDate between @NeedByStartDate and @NeedByEndDate)
	)
order by o.OrderId
                    ",
					ordersMapper.MapOrdersAndOrderItems,
					splitOn: "OrderItemId",
					param: new { companyId, needByStartDate, needByEndDate, orderStartDate, orderEndDate }
				);

				var orderItems = ordersMapper.OrdersDict.Values.SelectMany(o => o.OrderItems);
				await PopulateOrderItemTrackingInfo(
				   orderItems.ToArray(),
					await _tradesoftRepository.GetShipTicketInfoByShipTicketItemNbrs(orderItems.Where(oi => oi.ShopPAK_ShipTicketItemNbr != null).Select(oi => oi.ShopPAK_ShipTicketItemNbr.Value).ToArray())
					);

				return ordersMapper.OrdersDict.Values.Select(o => GetOrderModel(o));
			}
		}

		public async Task<tOrder> GetPopulatedOrder(int orderId)
		{
			using (IDbConnection conn = new SqlConnection(_connectionString))
			{
				var ordersMapper = new OrdersMapper();
				await conn.QueryAsync(@$"
{ordersSelect}
where o.OrderId = @OrderId
                    ",
					ordersMapper.MapOrdersAndOrderItems,
					splitOn: "OrderItemId",
					param: new { orderId }
				);

				if (!ordersMapper.OrdersDict.Values.Any())
					return null;

				var orderItems = ordersMapper.OrdersDict.Values.SelectMany(o => o.OrderItems);
				await PopulateOrderItemTrackingInfo(
				   orderItems.ToArray(),
					await _tradesoftRepository.GetShipTicketInfoByShipTicketItemNbrs(orderItems.Where(oi => oi.ShopPAK_ShipTicketItemNbr != null).Select(oi => oi.ShopPAK_ShipTicketItemNbr.Value).ToArray())
					);

				return ordersMapper.OrdersDict.Values.First();
			}
		}
		public async Task<bool> OrderExists(int orderId)
		{
			using (IDbConnection conn = new SqlConnection(_connectionString))
			{
				var order = await conn.QuerySingleOrDefaultAsync<tOrder>(@$"select * from tOrder where o.OrderId = @OrderId", param: new { orderId });

				return order != null;
			}
		}

		public async Task<Tuple<int, string>> CreateOrUpdateOrder(UserInformation updater, OrderModel order)
		{
			using (IDbConnection conn = new SqlConnection(_connectionString))
			{
				if (conn.State == ConnectionState.Closed)
					conn.Open();

				using (var trans = conn.BeginTransaction())
				{
					try
					{
						order.OrderNumber = string.IsNullOrEmpty(order.OrderNumber.Trim()) ? null : order.OrderNumber.Trim();
						order.LastUpdatedDateTime = DateTime.UtcNow;
						order.LastUpdater_UserID = updater.ApplicationUser.Id;

						tOrder oldOrder = null;
						if (order.OrderId > 0) // Existing, update
						{
							oldOrder = await GetPopulatedOrder(order.OrderId);
							order.OrderId = oldOrder.OrderId;
							order.CompanyID = oldOrder.CompanyId;
							var updateOrderSQL = @"
update tOrder set
	OrderNumber=@OrderNumber,
	OrderComments=@OrderComments,
	LastUpdatedDateTime=@LastUpdatedDateTime,
	LastUpdater_UserID=@LastUpdater_UserID,
	BillToAddress_LocationName=@BillToAddress_LocationName,
	BillToAddress_Street1=@BillToAddress_Street1,
	BillToAddress_Street2=@BillToAddress_Street2,
	BillToAddress_City=@BillToAddress_City,
	BillToAddress_State=@BillToAddress_State,
	BillToAddress_PostalCode=@BillToAddress_PostalCode,
	BillToAddress_Country=@BillToAddress_Country,
	AdditionalEmailsList=@AdditionalEmailsList
where OrderID=@OrderID
";

							await conn.ExecuteAsync(updateOrderSQL, order, trans);
						}
						else // New, insert
						{
							order.CompanyID = updater.CompanyId;
							order.CreatedDateTime = DateTime.UtcNow;
							order.Creator_UserID = updater.ApplicationUser.Id;

							var insertOrderSQL = @"
insert into tOrder(
	CompanyId,
	OrderNumber, 
	OrderComments,
	CreatedDateTime,
	Creator_UserID,
	LastUpdatedDateTime,
	LastUpdater_UserID,
	BillToAddress_LocationName,
	BillToAddress_Street1,
	BillToAddress_Street2,
	BillToAddress_City,
	BillToAddress_State,
	BillToAddress_PostalCode,
	BillToAddress_Country,
	AdditionalEmailsList
)
values(
	@CompanyId,
	@OrderNumber,
	@OrderComments, 
	@CreatedDateTime,
	@Creator_UserID, 
	@LastUpdatedDateTime, 
	@LastUpdater_UserID,
	@BillToAddress_LocationName,
	@BillToAddress_Street1,
	@BillToAddress_Street2,
	@BillToAddress_City,
	@BillToAddress_State,
	@BillToAddress_PostalCode,
	@BillToAddress_Country,
	@AdditionalEmailsList
)
";

							await conn.QueryAsync(insertOrderSQL, order, trans);

							order.OrderId = conn.ExecuteScalar<int>("SELECT @@IDENTITY", null, transaction: trans);
						}

						// Delete orders that have been removed
						if (oldOrder != null)
							foreach (var oldOrderItem in oldOrder.OrderItems)
							{
								if (oldOrderItem.StatusID == (int)OrderStatuses.Shipped) // Cannot be deleted, already shipped
									continue;

								bool deleted = true;
								foreach (var shipToLoc in order.OrderShipToLocations)
									foreach (var orderItem in shipToLoc.OrderItems)
										if (orderItem.OrderItemId == oldOrderItem.OrderItemId)
										{
											deleted = false;
											continue; // Not deleted
										}

								if (deleted) // If reached here, user requests order to be deleted. So delete it.
									await conn.ExecuteAsync("delete from tOrderItem where OrderItemId = @OrderItemId", new { oldOrderItem.OrderItemId }, trans);
							}

						foreach (var shipLocation in order.OrderShipToLocations)
						{
							foreach (var itemModel in shipLocation.OrderItems)
							{
								var item = await _inventoryRepository.GetInventoryItem(itemModel.ItemName);
								if (item == null)
									return new Tuple<int, string>(0, $"Item code {item.ItemName} does not exist.");
								if (item.QtyAvailable <= 0)
									return new Tuple<int, string>(0, $"Item code {item.ItemName} is not available.");
								if (item.QtyAvailable < itemModel.QuantityOrdered)
									return new Tuple<int, string>(0, $"Item code {item.ItemName} only has {item.QtyAvailable} available. Please reduce order quantity for this item.");

								var orderItem = new tOrderItem
								{
									OrderItemId = itemModel.OrderItemId,
									OrderId = order.OrderId,
									ItemId = item.ItemId,
									QuantityOrdered = itemModel.QuantityOrdered,
									ShipToAddress_LocationName = shipLocation.ShipToAddress_LocationName,
									ShipToAddress_Street1 = shipLocation.ShipToAddress_Street1,
									ShipToAddress_Street2 = shipLocation.ShipToAddress_Street2,
									ShipToAddress_City = shipLocation.ShipToAddress_City,
									ShipToAddress_State = shipLocation.ShipToAddress_State,
									ShipToAddress_PostalCode = shipLocation.ShipToAddress_PostalCode,
									ShipToAddress_Country = shipLocation.ShipToAddress_Country,
									ShopPAK_ShipViaNbr = shipLocation.ShopPAK_ShipViaNbr,
									InStoreDate = itemModel.InStoreDate,
									ShipToAddress_ContactName = shipLocation.ShipToAddress_ContactName,
								};

								if (orderItem.OrderItemId > 0) // Existing, update
								{
									orderItem.StatusID = (int)OrderStatuses.Changed;

									await conn.QueryAsync(@"
update tOrderItem set
	ShipToAddress_ContactName=@ShipToAddress_ContactName,
	ShipToAddress_LocationName=@ShipToAddress_LocationName,
	ShipToAddress_Street1=@ShipToAddress_Street1,
	ShipToAddress_Street2=@ShipToAddress_Street2,
	ShipToAddress_City=@ShipToAddress_City,
	ShipToAddress_State=@ShipToAddress_State,
	ShipToAddress_PostalCode=@ShipToAddress_PostalCode,
	ShipToAddress_Country=@ShipToAddress_Country,
	QuantityOrdered=@QuantityOrdered,
	InStoreDate=@InStoreDate,
	ShopPAK_ShipViaNbr=@ShopPAK_ShipViaNbr,
	StatusId=@StatusId
where OrderItemID=@OrderItemID
",
						orderItem, trans);
								}
								else // New, insert
								{
									orderItem.StatusID = (int)OrderStatuses.New;

									await conn.QueryAsync(@"
insert into tOrderItem(
	ItemID,
	OrderID,
	ShipToAddress_ContactName,
	ShipToAddress_LocationName,
	ShipToAddress_Street1,
	ShipToAddress_Street2,
	ShipToAddress_City,
	ShipToAddress_State,
	ShipToAddress_PostalCode,
	ShipToAddress_Country,
	QuantityOrdered,
	InStoreDate,
	ShopPAK_ShipViaNbr,
	AssemblyQuantity,
	ShipTicketItemNotes,
	OrderLineNumber,
	StatusId,
	ShopPAK_ShipTicketItemNbr
)
values(
	@ItemID,
	@OrderID,
	@ShipToAddress_ContactName,
	@ShipToAddress_LocationName,
	@ShipToAddress_Street1,
	@ShipToAddress_Street2,
	@ShipToAddress_City,
	@ShipToAddress_State,
	@ShipToAddress_PostalCode,
	@ShipToAddress_Country,
	@QuantityOrdered,
	@InStoreDate,
	@ShopPAK_ShipViaNbr,
	0,
	'',
	0,
	@StatusId,
	NULL
)
",
					orderItem, trans);
								}
							}
						}

						trans.Commit();

						// Send email notifications
						//await SendOrderNotification(order.OrderId);

						return new Tuple<int, string>(order.OrderId, null); // No errors
					}
					catch (Exception)
					{
						trans.Rollback();

						throw;
					}
				}
			}
		}

		#region Email Notifications
		private async Task SendOrderNotification(params int[] orderIDs)
		{
			using (IDbConnection conn = new SqlConnection(_connectionString))
			{
				var toEmails = new List<string>();
				List<IEmailComponent> emailComponents = new List<IEmailComponent>();

				emailComponents.Add(new EmailHeader());

				emailComponents.Add(new EmailParagraph("Thank you for your order from PG&A Retail Solutions. Once your package ships we will send an email with a link to track your order." +
					"You can check the status of your order by <a href='http://portal.petergaietto.com/login' style='color:#1e7ec8' target='_blank'>logging into your account</a>." +
					"If you have any questions about your order please contact us at <a href='mailto:sales@petergaietto.com'>sales@petergaietto.com</a>" +
					" or <a href='tel:5137710903'>call (513) 771-0903</a> Monday - Friday, 8am - 5pm PST."));
				emailComponents.Add(new EmailParagraph("Your order confirmation is below. Thank you again for your business."));

				foreach (int orderID in orderIDs)
				{
					var order = await GetPopulatedOrder(orderID);
					toEmails.AddRange(order.AdditionalEmailsList.Split(','));
					var creatorEmail = await conn.ExecuteScalarAsync<string>(@"select Email from AspNetUsers where Id = @Id", new { Id = order.Creator_UserId });
					toEmails.Add(creatorEmail);
					var orderItemShipToGroups = order.OrderItems.GroupBy(oi => oi.ShipToHash);

					// BILLING AND SHIPPING
					emailComponents.Add(new EmailHeading(3, string.Format("Your Order {0}[#{1}] <small>(placed on {1})</small>",
						order.OrderNumber + " " ?? "", order.OrderId.GetDatabaseIDString())));
					emailComponents.Add(new EmailParagraph("View your order <a href=\"http://portal.petergaietto.com/orders/" + order.OrderId + "/details\">here</a>"));

					emailComponents.Add(new EmailNewline());

					emailComponents.Add(new EmailTable(50, new EmailTableColumnHeaders("Billing Information:"),
						new EmailTableRow(string.Format("{0}<br>{1}<br>{2}",
						order.BillToAddress_LocationName ?? "",
						order.BillToAddress_Street1 + (order.BillToAddress_Street2 ?? ""),
						order.BillToAddress_City + ", " + order.BillToAddress_State + " " + order.BillToAddress_PostalCode + " " + order.BillToAddress_Country))));

					emailComponents.Add(new EmailNewline());

					foreach (var orderItemShipToGroup in orderItemShipToGroups)
					{
						List<EmailTableRow> shipToRows = new List<EmailTableRow>();
						foreach (var orderItem in orderItemShipToGroup)
							shipToRows.Add(new EmailTableRow("<b>" + orderItem.ItemName + "</b>", orderItem.ItemDescription, orderItem.QuantityOrdered.ToString()));

						var shipToLoc = orderItemShipToGroup.First();
						emailComponents.Add(new EmailTable(50,
							new EmailTableRow("<b>Ship-To:</b><br/>"
								+ (string.IsNullOrEmpty(shipToLoc.ShipToAddress_ContactName) ? "" : shipToLoc.ShipToAddress_ContactName + "<br/>")
								+ (string.IsNullOrEmpty(shipToLoc.ShipToAddress_LocationName) ? "" : shipToLoc.ShipToAddress_LocationName + "<br/>")
								+ shipToLoc.ShipToAddress_Street1 + "<br/>"
								+ (string.IsNullOrEmpty(shipToLoc.ShipToAddress_Street2) ? "" : shipToLoc.ShipToAddress_Street2 + "<br/>")
								+ shipToLoc.ShipToAddress_City + ", " + shipToLoc.ShipToAddress_State + " " + shipToLoc.ShipToAddress_PostalCode + " " + shipToLoc.ShipToAddress_Country
								)));

						emailComponents.Add(new EmailTable(100, new EmailTableColumnHeaders("Item", "Description", "Qty"), shipToRows.ToArray()));

						emailComponents.Add(new EmailNewline());
					}

					emailComponents.Add(new EmailTable(100, new EmailTableColumnHeaders("Order Comments"), new EmailTableRow(order.OrderComments.NewLine2BRTag())));

					emailComponents.Add(new EmailNewline());
				}

				emailComponents.Add(new EmailParagraph("Thank you again,<br/><b>PG&A Retail Solutions"));

				string subject = "";
				if (orderIDs.Length > 1)
					subject = "Multiple Orders Received";
				else if (orderIDs.Length == 1)
				{
					var order = await GetPopulatedOrder(orderIDs[0]);
					subject = (string.IsNullOrEmpty(order.OrderNumber) ? string.Empty : "Order '" + order.OrderNumber + "' ") + "[#" + order.OrderId.GetDatabaseIDString() + "] Received";
				}
				var message = _emailService.GetBasicMessage(toEmails.ToArray(), subject, EmailBuilder.GetEmailHTML(emailComponents.ToArray()));
				_emailService.SendEmail(message);
			}
		}
		#endregion

		public async Task<bool> POExists(string orderNumber, int companyId)
		{
			using (IDbConnection conn = new SqlConnection(_connectionString))
			{
				return await conn.ExecuteScalarAsync<bool>(@"select count(OrderNumber) from tOrder where OrderNumber=@orderNumber and CompanyId = @companyId ", new { orderNumber, companyId });
			}
		}

		public async Task<OrderModel> GetOrderModel(int orderId)
		{
			tOrder order = await GetPopulatedOrder(orderId);
			return GetOrderModel(order);
		}

		public OrderModel GetOrderModel(tOrder order)
		{
			var orderModel = new OrderModel();

			orderModel.OrderId = order.OrderId;
			orderModel.BillToAddress_LocationName = order.BillToAddress_LocationName;
			orderModel.BillToAddress_Street1 = order.BillToAddress_Street1;
			orderModel.BillToAddress_Street2 = order.BillToAddress_Street2;
			orderModel.BillToAddress_City = order.BillToAddress_City;
			orderModel.BillToAddress_State = order.BillToAddress_State;
			orderModel.BillToAddress_PostalCode = order.BillToAddress_PostalCode;
			orderModel.BillToAddress_Country = order.BillToAddress_Country;
			orderModel.OrderNumber = order.OrderNumber;
			orderModel.AdditionalEmailsList = order.AdditionalEmailsList;
			orderModel.OrderComments = order.OrderComments;
			orderModel.CreatedDateTime = order.CreatedDateTime;
			orderModel.LastUpdatedDateTime = order.LastUpdatedDateTime;

			orderModel.OrderShipToLocations = new List<OrderShipToLocationModel>();

			if (order.OrderItems.Any())
			{
				var shipToLocations = order.OrderItems.GroupBy(x => x.ShipToHash);
				foreach (var orderItemShipToGroup in shipToLocations)
				{
					var orderLocation = orderItemShipToGroup.First();
					var shipToLocation = new OrderShipToLocationModel();

					shipToLocation.ShipToAddress_LocationName = orderLocation.ShipToAddress_LocationName;
					shipToLocation.ShipToAddress_Street1 = orderLocation.ShipToAddress_Street1;
					shipToLocation.ShipToAddress_Street2 = orderLocation.ShipToAddress_Street2;
					shipToLocation.ShipToAddress_City = orderLocation.ShipToAddress_City;
					shipToLocation.ShipToAddress_State = orderLocation.ShipToAddress_State;
					shipToLocation.ShipToAddress_PostalCode = orderLocation.ShipToAddress_PostalCode;
					shipToLocation.ShipToAddress_Country = orderLocation.ShipToAddress_Country;
					shipToLocation.ShopPAK_ShipViaNbr = orderLocation.ShopPAK_ShipViaNbr;
					shipToLocation.ShipToAddress_ContactName = orderLocation.ShipToAddress_ContactName;
					shipToLocation.ShipToHash = orderItemShipToGroup.Key;
					shipToLocation.OrderItems = new List<OrderItemModel>();

					foreach (var orderItem in orderItemShipToGroup)
					{
						var orderItemModel = new OrderItemModel();
						orderItemModel.OrderItemId = orderItem.OrderItemId;
						orderItemModel.ItemName = orderItem.ItemName;
						orderItemModel.QuantityOrdered = orderItem.QuantityOrdered;
						orderItemModel.InStoreDate = orderItem.InStoreDate;
						orderItemModel.StatusID = orderItem.StatusID;
						orderItemModel.TrackingInfo = orderItem.TrackingInfo;

						shipToLocation.OrderItems.Add(orderItemModel);
					}
					orderModel.OrderShipToLocations.Add(shipToLocation);
				}
			}
			return orderModel;
		}

		public async Task<int> InsertRollOutFileName(string strRollOutFileName)
		{
			int rollOutId = 0;
			var fileQuery = "INSERT INTO OrderRollOut(Title) Value(@fileName)";

			using (IDbConnection conn = new SqlConnection(_connectionString))
			{
				if (conn.State == ConnectionState.Closed)
					conn.Open();

				using (var trans = conn.BeginTransaction())
				{
					try
					{
						await conn.QueryAsync(fileQuery, strRollOutFileName);

						rollOutId = conn.ExecuteScalar<int>("SELECT @@IDENTITY", null, transaction: trans);
					}
					catch
					{
						trans.Rollback();
					}
				}
			}
			return rollOutId;
		}

		public async Task<Tuple<int, string>> CreateRollOutOrder(UserInformation updater, OrderModel order, string rolloutFileName)
        {
			int rollOutId = 0;
			string orderNumber = string.Empty;
			var fileQuery = @"INSERT INTO OrderRollOut(Title) Values('"+rolloutFileName+"')";


			using (IDbConnection conn = new SqlConnection(_connectionString))
			{
				if (conn.State == ConnectionState.Closed)
					conn.Open();

				using (var trans = conn.BeginTransaction())
				{
					try
					{
						//insert rollout file details first
						await conn.QueryAsync(fileQuery, rolloutFileName, trans);
						rollOutId = conn.ExecuteScalar<int>("SELECT @@IDENTITY", null, transaction: trans);

						//process orders
						order.OrderNumber = string.IsNullOrEmpty(order.OrderNumber.Trim()) ? null : order.OrderNumber.Trim();
						order.LastUpdatedDateTime = DateTime.UtcNow;
						order.LastUpdater_UserID = updater.ApplicationUser.Id;

						
						order.CompanyID = updater.CompanyId;
						order.CreatedDateTime = DateTime.UtcNow;
						order.Creator_UserID = updater.ApplicationUser.Id;

						orderNumber = order.OrderNumber;	//used for creating unique combination of orderNumber with zip as the is unique

						foreach (OrderShipToLocationModel shipLocation in order.OrderShipToLocations)
						{
							

								var insertOrderSQL = @"
insert into tOrder(
	CompanyId,
	OrderNumber, 
	OrderComments,
	CreatedDateTime,
	Creator_UserID,
	LastUpdatedDateTime,
	LastUpdater_UserID,
	BillToAddress_LocationName,
	BillToAddress_Street1,
	BillToAddress_Street2,
	BillToAddress_City,
	BillToAddress_State,
	BillToAddress_PostalCode,
	BillToAddress_Country,
	AdditionalEmailsList
)
values(
	@CompanyId,
	@OrderNumber,
	@OrderComments, 
	@CreatedDateTime,
	@Creator_UserID, 
	@LastUpdatedDateTime, 
	@LastUpdater_UserID,
	@BillToAddress_LocationName,
	@BillToAddress_Street1,
	@BillToAddress_Street2,
	@BillToAddress_City,
	@BillToAddress_State,
	@BillToAddress_PostalCode,
	@BillToAddress_Country,
	@AdditionalEmailsList
)
";
								order.OrderNumber = orderNumber + "_" + shipLocation.ShipToAddress_PostalCode;
								await conn.QueryAsync(insertOrderSQL, order, trans);

								order.OrderId = conn.ExecuteScalar<int>("SELECT @@IDENTITY", null, transaction: trans);
							

							// update the rolloutId
							var updateRolloutIdquery = @"UPDATE tOrder SET OrderRolloutId = " + rollOutId + " Where OrderId = " + order.OrderId;
							int[] paramObjects = { rollOutId, order.OrderId };
							await conn.ExecuteAsync(updateRolloutIdquery, paramObjects, trans);

							foreach (var itemModel in shipLocation.OrderItems)
							{
								var item = await _inventoryRepository.GetInventoryItem(itemModel.ItemName);
								if (item == null)
									return new Tuple<int, string>(0, $"Item code {item.ItemName} does not exist.");
								if (item.QtyAvailable <= 0)
									return new Tuple<int, string>(0, $"Item code {item.ItemName} is not available.");
								if (item.QtyAvailable < itemModel.QuantityOrdered)
									return new Tuple<int, string>(0, $"Item code {item.ItemName} only has {item.QtyAvailable} available. Please reduce order quantity for this item.");

								var orderItem = new tOrderItem
								{
									OrderItemId = itemModel.OrderItemId,
									OrderId = order.OrderId,
									ItemId = item.ItemId,
									QuantityOrdered = itemModel.QuantityOrdered,
									ShipToAddress_LocationName = shipLocation.ShipToAddress_LocationName,
									ShipToAddress_Street1 = shipLocation.ShipToAddress_Street1,
									ShipToAddress_Street2 = shipLocation.ShipToAddress_Street2,
									ShipToAddress_City = shipLocation.ShipToAddress_City,
									ShipToAddress_State = shipLocation.ShipToAddress_State,
									ShipToAddress_PostalCode = shipLocation.ShipToAddress_PostalCode,
									ShipToAddress_Country = shipLocation.ShipToAddress_Country,
									ShopPAK_ShipViaNbr = shipLocation.ShopPAK_ShipViaNbr,
									InStoreDate = itemModel.InStoreDate,
									ShipToAddress_ContactName = shipLocation.ShipToAddress_ContactName,
								};

								if (orderItem.OrderItemId > 0) // Existing, update
								{
									orderItem.StatusID = (int)OrderStatuses.Changed;

									await conn.QueryAsync(@"
update tOrderItem set
	ShipToAddress_ContactName=@ShipToAddress_ContactName,
	ShipToAddress_LocationName=@ShipToAddress_LocationName,
	ShipToAddress_Street1=@ShipToAddress_Street1,
	ShipToAddress_Street2=@ShipToAddress_Street2,
	ShipToAddress_City=@ShipToAddress_City,
	ShipToAddress_State=@ShipToAddress_State,
	ShipToAddress_PostalCode=@ShipToAddress_PostalCode,
	ShipToAddress_Country=@ShipToAddress_Country,
	QuantityOrdered=@QuantityOrdered,
	InStoreDate=@InStoreDate,
	ShopPAK_ShipViaNbr=@ShopPAK_ShipViaNbr,
	StatusId=@StatusId
where OrderItemID=@OrderItemID
",
						orderItem, trans);
								}
								else // New, insert
								{
									orderItem.StatusID = (int)OrderStatuses.New;

									await conn.QueryAsync(@"
insert into tOrderItem(
	ItemID,
	OrderID,
	ShipToAddress_ContactName,
	ShipToAddress_LocationName,
	ShipToAddress_Street1,
	ShipToAddress_Street2,
	ShipToAddress_City,
	ShipToAddress_State,
	ShipToAddress_PostalCode,
	ShipToAddress_Country,
	QuantityOrdered,
	InStoreDate,
	ShopPAK_ShipViaNbr,
	AssemblyQuantity,
	ShipTicketItemNotes,
	OrderLineNumber,
	StatusId,
	ShopPAK_ShipTicketItemNbr
)
values(
	@ItemID,
	@OrderID,
	@ShipToAddress_ContactName,
	@ShipToAddress_LocationName,
	@ShipToAddress_Street1,
	@ShipToAddress_Street2,
	@ShipToAddress_City,
	@ShipToAddress_State,
	@ShipToAddress_PostalCode,
	@ShipToAddress_Country,
	@QuantityOrdered,
	@InStoreDate,
	@ShopPAK_ShipViaNbr,
	0,
	'',
	0,
	@StatusId,
	NULL
)
",
					orderItem, trans);
								}
							}



							
							// Send email notifications
							//await SendOrderNotification(order.OrderId);
						}
					}
					catch (Exception ex)
					{
						trans.Rollback();

						throw;
					}

					trans.Commit();
				}
			}
			return new Tuple<int, string>(order.OrderId, null); // No errors
		}
	}
}
