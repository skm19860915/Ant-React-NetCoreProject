using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using KitTracker.CustomProvider;
using KitTracker.Entities.Hillman;
using KitTracker.Entities.Tradesoft;
using KitTracker.Filters;
using KitTracker.Repositories;
using KitTracker.Settings;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;
using static KitTracker.Extensions.RegexHelpers;
using static KitTracker.Repositories.HillmanRepository;

namespace KitTracker.Controllers
{
	[Authorize]
	[HillmanAccessRequired]
	[ApiController]
	[Route("[controller]")]
	public class HillmanController : AuthenticatedControllerBase
	{
		private readonly ILogger<HillmanController> _logger;
		private readonly HillmanRepository _repository;
		private readonly HillmanSettings _settings;

		public HillmanController(ILogger<HillmanController> logger,
			HillmanRepository repository,
			IOptionsSnapshot<HillmanSettings> settings,
			UsersRepository userRepository,
			UserManager<ApplicationUser> userManager)
			: base(userRepository, userManager)
		{
			_logger = logger;
			_repository = repository;
			_settings = settings.Value;
		}

		[ScanningAccessFilter]
		[HttpGet]
		[Route("workorderdata")]
		public async Task<IEnumerable<TSWorkOrderData>> TestWorkOrderData() => await _repository.TestWorkOrderData();

		[ScanningAccessFilter]
		[HttpGet]
		[Route("workorders")]
		public async Task<IEnumerable<WorkOrder>> GetWorkOrders() => await _repository.GetWorkOrders();

		[HttpPost]
		[Route("workorders")]
		public async Task<IActionResult> CreateWorkOrder(WorkOrderModel model)
		{
			var workOrder = new WorkOrder()
			{
				WorkOrderId = 0,
				HWONumber = model.HWONumber,
				ItemNumber = model.ItemNumber,
				BulkPartNumber = model.BulkPartNumber,
				BulkPartName = model.BulkPartName,
				ExpectedQuantity = model.ExpectedQuantity,
				Rework = model.Rework == "Yes",
				CountryOfOrigin = model.CountryOfOrigin
			};
			var result = await _repository.CreateOrUpdateWorkOrder(workOrder);
			if (result != null)
				return BadRequest(result);

			return Ok();
		}

		[HttpPost]
		[Route("workorders/asn")]
		public async Task UploadASN(UploadASNModel model) => await _repository.UploadASN(model.WorkOrders);

		[HttpPut]
		[Route("workorders/{workOrderId}")]
		public async Task<IActionResult> UpdateWorkOrder(int workOrderId, WorkOrderModel model)
		{
			var workOrder = new WorkOrder()
			{
				WorkOrderId = workOrderId,
				HWONumber = model.HWONumber,
				ItemNumber = model.ItemNumber,
				BulkPartNumber = model.BulkPartNumber,
				BulkPartName = model.BulkPartName,
				ExpectedQuantity = model.ExpectedQuantity,
				Rework = model.Rework == "Yes",
				CountryOfOrigin = model.CountryOfOrigin
			};
			var result = await _repository.CreateOrUpdateWorkOrder(workOrder);
			if (result != null)
				return BadRequest(result);

			return Ok();
		}

		[HttpDelete]
		[Route("workorders/{workOrderId}")]
		public async Task<IActionResult> ArchiveWorkOrder(int workOrderId)
		{
			var result = await _repository.ArchiveWorkOrder(workOrderId);
			if (result != null)
				return BadRequest(result);

			return Ok();
		}

		[ScanningAccessFilter]
		[HttpGet]
		[Route("workorders/{workOrderId}")]
		public async Task<IActionResult> GetWorkOrder(int workOrderId)
		{
			var wo = await _repository.GetWorkOrder(workOrderId);
			if (wo == null)
				return NotFound();

			return Ok(wo);
		}

		[ScanningAccessFilter]
		[HttpPost]
		[Route("workorders/{workOrderId}/details")]
		public async Task<IActionResult> UpdateWorkOrderDetails(int workOrderId, WorkOrderDetailsModel model)
		{
			if (!Enum.TryParse(model.MethodName, out PackoutMethods method))
				return BadRequest("Invalid packout method");
			if (!Enum.TryParse(model.MaterialSizeName, out PackoutMaterialSizes materialSize))
				return BadRequest("Invalid packout material size");
			if (_repository.GetWorkOrder(workOrderId) == null)
				return BadRequest("Invalid PGA work order #");

			await _repository.UpdateWorkOrderDetails(workOrderId, (int)method, (int)materialSize);

			return NoContent();
		}

		[ScanningAccessFilter]
		[HttpGet]
		[Route("workorders/methods")]
		public string[] GetPackoutMethods() => Enum.GetNames(typeof(PackoutMethods));

		[ScanningAccessFilter]
		[HttpGet]
		[Route("workorders/materialsizes")]
		public string[] GetPackoutMaterialSizes() => Enum.GetNames(typeof(PackoutMaterialSizes));

		[ScanningAccessFilter]
		[HttpGet]
		[Route("pallets")]
		public async Task<IEnumerable<Pallet>> GetPallets(PalletStatuses? status) => await _repository.GetPallets(status);

		[ScanningAccessFilter]
		[HttpGet]
		[Route("pallets/{palletNumber}")]
		public async Task<IActionResult> GetPallet(string palletNumber)
		{
			var pallet = await _repository.GetPallet(palletNumber);
			if (pallet == null)
				return NotFound();

			return Ok(pallet);
		}

		[ScanningAccessFilter]
		[HttpGet]
		[Route("pallets/statuses")]
		public string[] GetPalletStatuses() => Enum.GetNames(typeof(PalletStatuses));

		[ScanningAccessFilter]
		[HttpPost]
		[Route("pallets/{palletNumber}/start")]
		public async Task<IActionResult> StartPallet(string palletNumber, StartPalletModel model)
		{
			if (model.CrewSize < 1)
				return BadRequest("Crew size must be at least 1");
			if (string.IsNullOrEmpty(palletNumber))
				return BadRequest("Pallet number required");
			if (await _repository.GetWorkOrder(model.WorkOrderId) == null)
				return BadRequest("Invalid PGA work order number");

			palletNumber = palletNumber.ToUpper();
			if (!ValidatePatternMatch(palletNumber, _settings.PalletNumberRegex))
				return BadRequest("Invalid pallet ID");

			await _repository.StartPallet(palletNumber, model.WorkOrderId, model.CrewSize);

			return NoContent();
		}

		[ScanningAccessFilter]
		[HttpGet]
		[Route("pallets/stopreasons")]
		public string[] GetPalletStopReasons() => Enum.GetNames(typeof(StopPalletReasons));

		[ScanningAccessFilter]
		[HttpPost]
		[Route("pallets/{palletNumber}/stop")]
		public async Task<IActionResult> StopPallet(string palletNumber, StopPalletModel model)
		{
			palletNumber = palletNumber.ToUpper();
			if (string.IsNullOrEmpty(palletNumber))
				return BadRequest("Pallet number required");
			if (await _repository.GetPallet(palletNumber) == null)
				return BadRequest("Pallet ID does not exist");
			if (!Enum.TryParse(model.StopReason, out StopPalletReasons reason))
				return BadRequest("Invalid stop reason");
			if (reason == StopPalletReasons.QA && string.IsNullOrEmpty(model.QANotes))
				return BadRequest("QA stop requires QA notes");

			await _repository.StopPallet(palletNumber, reason, model.QANotes);

			return NoContent();
		}

		[ScanningAccessFilter]
		[HttpPost]
		[Route("pallets/{palletNumber}/ready")]
		public async Task<IActionResult> ReadyPallet(string palletNumber)
		{
			palletNumber = palletNumber.ToUpper();
			if (string.IsNullOrEmpty(palletNumber))
				return BadRequest("Pallet number required");
			if (await _repository.GetPallet(palletNumber) == null)
				return BadRequest("Pallet ID does not exist");

			await _repository.ReadyPallet(palletNumber);

			return NoContent();
		}

		[ScanningAccessFilter]
		[HttpGet]
		[Route("cases/{caseNumber}")]
		public async Task<IActionResult> GetCase(string caseNumber)
		{
			var c = await _repository.GetCase(caseNumber);
			if (c == null)
				return NotFound();

			return Ok(c);
		}

		[ScanningAccessFilter]
		[HttpPost]
		[Route("cases/{caseNumber}")]
		public async Task<IActionResult> AddCase(string caseNumber, AddCaseModel model)
		{
			if (model.CartonQuantity < 1)
				return BadRequest("Carton quantity must be at least 1");
			if (!ValidatePatternMatch(caseNumber, _settings.CaseNumberRegex))
				return BadRequest("Invalid case ID");
			if (await _repository.GetCase(caseNumber) != null)
				return BadRequest("Case ID already added");
			model.PalletNumber = model.PalletNumber.ToUpper();
			if (string.IsNullOrEmpty(model.PalletNumber))
				return BadRequest("Pallet number required");
			if (await _repository.GetPallet(model.PalletNumber) == null)
				return BadRequest("Pallet ID does not exist");

			await _repository.AddCase(caseNumber, model.PalletNumber, model.CartonQuantity);

			return NoContent();
		}

		[AdminAccessFilter]
		[HttpGet]
		[Route("labels")]
		public async Task<IEnumerable<LabelDataRow>> GetOpenOrdersLabelData() => await _repository.GetOpenOrdersLabelData();

		[AdminAccessFilter]
		[HttpPost]
		[Route("labels")]
		public async Task<IActionResult> UpdateWorkOrdersLabelExportedStatus(UpdateWorkOrdersLabelExportedStatusModel model)
		{
			await _repository.UpdateWorkOrdersLabelExportedStatus(model.WorkOrderStatuses);

			return NoContent();
		}

		[AdminAccessFilter]
		[HttpPost]
		[Route("asn/data")]
		public async Task<IEnumerable<ASNDataRow>> GetASNData(ASNModel model) => await _repository.GetASNData(model.PalletNumbers);

		[AdminAccessFilter]
		[HttpPost]
		[Route("asn/email")]
		public async Task<IActionResult> EmailASNCSV(ASNModel model)
		{
			await _repository.EmailASNCSV(model.PalletNumbers);

			return NoContent();
		}
	}
}
