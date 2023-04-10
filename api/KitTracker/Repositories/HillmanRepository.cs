using System;
using System.Collections.Generic;
using System.Data;
using System.Data.SqlClient;
using System.IO;
using System.Linq;
using System.Net.Mail;
using System.Net.Mime;
using System.Text;
using System.Threading.Tasks;
using Dapper;
using KitTracker.Entities.Hillman;
using KitTracker.Entities.Tradesoft;
using KitTracker.Services;
using KitTracker.Settings;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;

namespace KitTracker.Repositories
{
	public class HillmanRepository
	{
		public enum PalletStatuses { Started = 1, Stopped = 2, ReadyToShip = 3, Shipped = 4 };
		public enum PackoutMethods { Machine = 1, Trough = 2, Hand = 3 };
		public enum PackoutMaterialSizes { Small = 1, Medium = 2, Large = 3, XL = 4 };
		public enum StopPalletReasons { WorkOrderComplete = 1, OutOfProduct = 2, BreakTime = 3, QA = 4, EndOfDay = 5 };

		private readonly ILogger<HillmanRepository> _logger;
		private readonly string _connectionString;
		private readonly HillmanSettings _settings;
		private readonly ITradesoftRepository _tradesoftRepository;
		private readonly EmailService _emailService;

		public HillmanRepository(ILogger<HillmanRepository> logger,
			IOptionsSnapshot<KitTrackerSettings> kitTrackerSettings,
			IOptionsSnapshot<HillmanSettings> settings,
			ITradesoftRepository tradesoftRepository,
			EmailService emailService)
		{
			_logger = logger;
			_connectionString = kitTrackerSettings.Value.ConnectionString;
			_settings = settings.Value;
			_tradesoftRepository = tradesoftRepository;
			_emailService = emailService;
		}

		public async Task<IEnumerable<TSWorkOrderData>> TestWorkOrderData()
		{
			return await _tradesoftRepository.GetWorkOrderByCompany(2301);
		}

		private void PopulateWorkOrders(IEnumerable<WorkOrder> workOrders)
		{
			foreach (var workOrder in workOrders)
			{
				if (workOrder.MethodId != null)
					workOrder.MethodName = ((PackoutMethods)workOrder.MethodId.Value).ToString();
				if (workOrder.MaterialSizeId != null)
					workOrder.MaterialSizeName = ((PackoutMaterialSizes)workOrder.MaterialSizeId.Value).ToString();
			}
		}

		public async Task<IEnumerable<WorkOrder>> GetWorkOrders()
		{
			using (IDbConnection conn = new SqlConnection(_connectionString))
			{
				var workOrders = await conn.QueryAsync<WorkOrder>("select * from hill.WorkOrder where Archived = 0 order by WorkOrderId desc");

				PopulateWorkOrders(workOrders);

				return workOrders;
			}
		}

		public async Task<WorkOrder> GetWorkOrder(int workOrderId)
		{
			using (IDbConnection conn = new SqlConnection(_connectionString))
			{
				var workOrders = await conn.QueryAsync<WorkOrder>("select * from hill.WorkOrder where WorkOrderId = @WorkOrderId", new { workOrderId });

				PopulateWorkOrders(workOrders);

				return workOrders.FirstOrDefault();
			}
		}

		public async Task<WorkOrder> GetWorkOrderById(int workOrderId)
		{
			using (IDbConnection conn = new SqlConnection(_connectionString))
			{
				var workOrders = await conn.QueryAsync<WorkOrder>("select * from hill.WorkOrder where WorkOrderId = @WorkOrderId", new { workOrderId });

				PopulateWorkOrders(workOrders);

				return workOrders.FirstOrDefault();
			}
		}

		public async Task UpdateWorkOrderDetails(int workOrderId, int methodId, int materialSizeId)
		{
			using (IDbConnection conn = new SqlConnection(_connectionString))
			{
				await conn.ExecuteAsync($@"
update hill.WorkOrder set
    MethodId = @MethodId,
    MaterialSizeId = @MaterialSizeId
    where WorkOrderId = @WorkOrderId
", new { workOrderId, methodId, materialSizeId });
			}
		}

		const string _insertWorkOrder = @"
if not exists(select 1 from hill.WorkOrder where HWONumber = @HWONumber)
	insert into hill.WorkOrder (
		HWONumber,
		ItemNumber,
		BulkPartNumber,
		BulkPartName,
		ExpectedQuantity,
		Rework,
		CountryOfOrigin
	)
	values (
		@HWONumber,
		@ItemNumber,
		@BulkPartNumber,
		@BulkPartName,
		@ExpectedQuantity,
		@Rework,
		@CountryOfOrigin
	)
";

		const string _updateWorkOrder = @"
update hill.WorkOrder set
    HWONumber=@HWONumber,
    ItemNumber=@ItemNumber,
    BulkPartNumber=@BulkPartNumber,
    BulkPartName=@BulkPartName,
    ExpectedQuantity=@ExpectedQuantity,
    CountryOfOrigin=@CountryOfOrigin,
    Rework=@Rework
where WorkOrderId = @WorkOrderId
";

		const string _archiveWorkOrder = @"
update hill.WorkOrder set Archived=1 where WorkOrderId=@WorkOrderId
";

		public async Task<string> CreateOrUpdateWorkOrder(WorkOrder workOrder)
		{
			using (IDbConnection conn = new SqlConnection(_connectionString))
			{
				if (workOrder.WorkOrderId > 0 && await GetWorkOrderById(workOrder.WorkOrderId) == null)
					return "Work order not found.";

				await conn.ExecuteAsync(workOrder.WorkOrderId > 0 ? _updateWorkOrder : _insertWorkOrder, workOrder);

				return null;
			}
		}

		public async Task UploadASN(IEnumerable<WorkOrder> workOrders)
		{
			using (IDbConnection conn = new SqlConnection(_connectionString))
			{
				await conn.ExecuteAsync(_insertWorkOrder, workOrders);
			}
		}

		public async Task<string> ArchiveWorkOrder(int workOrderId)
		{
			using (IDbConnection conn = new SqlConnection(_connectionString))
			{
				if (workOrderId > 0 && await GetWorkOrderById(workOrderId) == null)
					return "Work order not found.";

				await conn.ExecuteAsync(_archiveWorkOrder, new { workOrderId });

				return null;
			}
		}

		private void PopulatePallets(IEnumerable<Pallet> pallets)
		{
			foreach (var pallet in pallets)
			{
				if (pallet.ShipDate != null)
					pallet.ShipDateString = pallet.ShipDate.ToString();
				pallet.PalletStatusName = ((PalletStatuses)pallet.PalletStatusId).ToString();
				if (pallet.StopReasonId != null)
					pallet.StopReasonName = ((StopPalletReasons)pallet.StopReasonId.Value).ToString();
			}
		}

		public async Task<IEnumerable<Pallet>> GetPallets(PalletStatuses? status = null)
		{
			using (IDbConnection conn = new SqlConnection(_connectionString))
			{
				var pallets = await conn.QueryAsync<Pallet>(@"
select p.WorkOrderId, HWONumber, PalletNumber, PalletStatusId, ShipDate, PalletPO, LastCrewSize, LastStopReasonId, LastQANotes, ASNID from hill.Pallet as p
join hill.WorkOrder as w on p.WorkOrderId = w.WorkOrderId
where @PalletStatusId is null or p.PalletStatusId = @PalletStatusId
", new { PalletStatusId = (int?)status });

				PopulatePallets(pallets);

				return pallets;
			}
		}

		public async Task<Pallet> GetPallet(string palletNumber)
		{
			palletNumber = palletNumber.ToUpper();

			using (IDbConnection conn = new SqlConnection(_connectionString))
			{
				var pallets = await conn.QueryAsync<Pallet>(@"
select p.WorkOrderId, HWONumber, PalletNumber, PalletStatusId, ShipDate, PalletPO, LastCrewSize, LastStopReasonId, LastQANotes, ASNID from hill.Pallet as p
join hill.WorkOrder as w on p.WorkOrderId = w.WorkOrderId
where p.PalletNumber = @PalletNumber
", new { palletNumber });

				PopulatePallets(pallets);

				return pallets.FirstOrDefault();
			}
		}

		public async Task StartPallet(string palletNumber, int workOrderId, int crewSize)
		{
			using (IDbConnection conn = new SqlConnection(_connectionString))
			{
				await conn.ExecuteAsync(@"
if exists (select * from hill.Pallet where PalletNumber = @PalletNumber)
begin
    update hill.Pallet
    set
		WorkOrderId = @WorkOrderId,
		LastCrewSize = @CrewSize,
		PalletStatusId = @PalletStatusId
    where PalletNumber = @PalletNumber
end
else
begin
    insert into hill.Pallet (PalletNumber, WorkOrderId, PalletStatusId, LastCrewSize)
    values (@PalletNumber, @WorkOrderId, @PalletStatusId, @CrewSize)
end
", new { palletNumber, workOrderId, crewSize, PalletStatusId = (int)PalletStatuses.Started });
			}
		}

		public async Task StopPallet(string palletNumber, StopPalletReasons reason, string qaNotes)
		{
			palletNumber = palletNumber.ToUpper();

			using (IDbConnection conn = new SqlConnection(_connectionString))
			{
				conn.Open();
				using (IDbTransaction trans = conn.BeginTransaction())
				{
					try
					{
						var pallet = await GetPallet(palletNumber);
						if (pallet == null)
							throw new InvalidOperationException("Pallet does not exist");
						var workOrder = await GetWorkOrder(pallet.WorkOrderId);

						PalletStatuses palletStatus = PalletStatuses.Stopped;
						if (reason == StopPalletReasons.WorkOrderComplete || reason == StopPalletReasons.OutOfProduct)
						{
							palletStatus = PalletStatuses.ReadyToShip;

							// Complete WO
							await conn.ExecuteAsync(@"update hill.WorkOrder set Complete = 1 where WorkOrderId = (select WorkOrderId from hill.Pallet where PalletNumber = @PalletNumber)", new { palletNumber }, trans);
						}
						else
						{
							// Re-open WO
							await conn.ExecuteAsync(@"update hill.WorkOrder set Complete = 0 where WorkOrderId = (select WorkOrderId from hill.Pallet where PalletNumber = @PalletNumber)", new { palletNumber }, trans);
						}

						await conn.ExecuteAsync(@"
update hill.Pallet
set PalletStatusId = @PalletStatusId, LastStopReasonId = @StopReasonId, LastQANotes = @QANotes
where PalletNumber = @PalletNumber
", new { palletNumber, PalletStatusId = (int)palletStatus, StopReasonId = (int)reason, qaNotes }, trans);

						trans.Commit();

						if (reason == StopPalletReasons.QA)
						{
							List<IEmailComponent> html = new List<IEmailComponent>();
							html.Add(new EmailHeading(3, $"QA Event Details"));
							html.Add(new EmailParagraph($"Sales #: {workOrder.WorkOrderId}"));
							html.Add(new EmailParagraph($"HWO#: {workOrder.HWONumber}"));
							html.Add(new EmailParagraph($"Pallet ID: {palletNumber}"));
							html.Add(new EmailParagraph($"QA Notes: {qaNotes}"));
							string body = EmailBuilder.GetEmailHTML(html.ToArray());

							_emailService.SendEmail(_emailService.GetBasicMessage(_settings.QAEmails, "Hillman QA Event " + EmailBuilder.GetSubjectRequestIDSuffix(), body));
						}
					}
					catch (Exception)
					{
						trans.Rollback();
						throw;
					}
				}
			}
		}

		public async Task ReadyPallet(string palletNumber)
		{
			palletNumber = palletNumber.ToUpper();

			using (IDbConnection conn = new SqlConnection(_connectionString))
			{
				await conn.ExecuteAsync(@"
update hill.Pallet
set PalletStatusId = @PalletStatusId
where PalletNumber = @PalletNumber
", new { palletNumber, PalletStatusId = (int)PalletStatuses.ReadyToShip });
			}
		}

		public async Task<IEnumerable<Case>> GetPalletCases(string palletNumber)
		{
			palletNumber = palletNumber.ToUpper();

			using (IDbConnection conn = new SqlConnection(_connectionString))
			{
				var cases = await conn.QueryAsync<Case>(@"
select CaseNumber, PalletNumber, CartonQuantity from hill.[Case] as c
join hill.Pallet as p on c.PalletId = p.PalletId
where p.PalletNumber = @PalletNumber
", new { palletNumber });
				return cases;
			}
		}

		public async Task<Case> GetCase(string caseNumber)
		{
			caseNumber = caseNumber.ToUpper();

			using (IDbConnection conn = new SqlConnection(_connectionString))
			{
				var cases = await conn.QueryAsync<Case>(@"
select CaseNumber, PalletNumber, CartonQuantity from hill.[Case] as c
join hill.Pallet as p on c.PalletId = p.PalletId
where c.CaseNumber = @CaseNumber
", new { caseNumber });
				return cases.FirstOrDefault();
			}
		}

		public async Task AddCase(string caseNumber, string palletNumber, int cartonQuantity)
		{
			caseNumber = caseNumber.ToUpper();

			using (IDbConnection conn = new SqlConnection(_connectionString))
			{
				await conn.ExecuteAsync(@"
insert into hill.[Case] (CaseNumber, PalletId, CartonQuantity)
values (@CaseNumber, (select PalletId from hill.Pallet where PalletNumber = @PalletNumber), @CartonQuantity)
", new { caseNumber, palletNumber, cartonQuantity });
			}
		}

		public async Task<IEnumerable<LabelDataRow>> GetOpenOrdersLabelData()
		{
			return (await GetWorkOrders())
				.Where(wo => !wo.Complete)
				.Select(wo => new LabelDataRow()
				{
					SalesNumber = wo.WorkOrderId,
					HWONumber = wo.HWONumber,
					ItemNumber = wo.ItemNumber,
					PartNumber = wo.BulkPartNumber,
					PartName = wo.BulkPartName,
					Quantity = wo.ExpectedQuantity,
					LabelQuantity = (int)Math.Ceiling(wo.ExpectedQuantity / 160.0) * 2,
					LabelCSVExported = wo.LabelCSVExported
				});
		}

		public async Task UpdateWorkOrdersLabelExportedStatus(IEnumerable<WorkOrderLabelExportedStatus> woStatuses)
		{
			using (IDbConnection conn = new SqlConnection(_connectionString))
			{
				await conn.ExecuteAsync($@"
update hill.WorkOrder set
    LabelCSVExported = @LabelCSVExported
    where WorkOrderId = @WorkOrderId
", woStatuses);
			}
		}

		public async Task<IEnumerable<ASNDataRow>> GetASNData(IEnumerable<string> palletNumbers)
		{
			palletNumbers = palletNumbers.Select(p => p.ToUpper());

			var palletsToShip = (await GetPallets()).Where(p => palletNumbers.Contains(p.PalletNumber));

			List<ASNDataRow> asnDataRows = new();
			foreach (var pallet in palletsToShip)
			{
				var workOrder = await GetWorkOrder(pallet.WorkOrderId);
				var palletCases = await GetPalletCases(pallet.PalletNumber);
				asnDataRows.AddRange(palletCases
					.Select(c => new ASNDataRow()
					{
						HWONumber = pallet.HWONumber,
						PalletNumber = pallet.PalletNumber,
						CaseNumber = c.CaseNumber,
						ItemNumber = workOrder.ItemNumber,
						CartonQuantity = c.CartonQuantity,
						PGADateString = "PGA" + DateTime.Now.ToString("yyMMdd")
					}));
			}

			return asnDataRows;
		}

		public async Task EmailASNCSV(IEnumerable<string> palletNumbers)
		{
			var asnData = await GetASNData(palletNumbers);

			List<IEmailComponent> html = new List<IEmailComponent>();

			html.Add(new EmailHeader());
			html.Add(new EmailParagraph("Thank you for doing business with PG&A Retail Solutions. Attached is the ASN CSV file for this shipment. See shipment details below. If you have any questions about your order please contact us at <a href='mailto:sales@petergaietto.com'>sales@petergaietto.com</a> or <a href='tel:5137710903'>call (513) 771-0903</a> Monday - Friday, 8am - 5pm PST."));


			html.Add(new EmailTable(100, new EmailTableColumnHeaders("WO#", "Item #", "Pallet #", "Case #", "Carton Qty"), asnData.Select(a => new EmailTableRow(a.HWONumber, a.ItemNumber, a.PalletNumber, a.CaseNumber, a.CartonQuantity.ToString())).ToArray()));

			html.Add(new EmailNewline());

			html.Add(new EmailParagraph("Thank you again,<br/><b>PG&A Retail Solutions"));

			string body = EmailBuilder.GetEmailHTML(html.ToArray());

			var message = _emailService.GetBasicMessage(_settings.ASNEmails, "Hillman ASN " + EmailBuilder.GetSubjectRequestIDSuffix(), body);

			var csvBytes = "POORD,POLIN,POITEM,POQTY,POSQTY,POIPRC,POIUOM,POUMCV,POIMPK,POCSID,POPLT,POSHP" + Environment.NewLine;
			csvBytes += string.Join(Environment.NewLine, asnData.Select(a => $"{a.HWONumber},,{a.ItemNumber},,{a.CartonQuantity},,,,,{a.CaseNumber},{a.PalletNumber},{a.PGADateString}"));

			using (MemoryStream stream = new MemoryStream(Encoding.ASCII.GetBytes(csvBytes)))
			{
				//Add a new attachment to the E-mail message, using the correct MIME type
				Attachment attachment = new Attachment(stream, new ContentType("text/csv"));
				string asnId = DateTime.Now.ToString("MMddyy");
				attachment.Name = $"{asnId} Masterv2.csv";
				message.Attachments.Add(attachment);

				_emailService.SendEmail(message);

				using (IDbConnection conn = new SqlConnection(_connectionString))
				{
					await conn.ExecuteAsync(@"
update hill.Pallet
set PalletStatusId = @PalletStatusId, PalletPO = @PalletPO, ShipDate = @ShipDate, ASNID = @ASNID
where PalletNumber = @PalletNumber
", asnData.Select(a => new { a.PalletNumber, PalletStatusId = (int)PalletStatuses.Shipped, ShipDate = DateTime.UtcNow, PalletPO = a.PGADateString, ASNID = asnId }));
				}
			}
		}
	}
}