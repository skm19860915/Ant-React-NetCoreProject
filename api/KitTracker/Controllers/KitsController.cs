using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using KitTracker.Entities;
using KitTracker.Entities.Albertson;
using KitTracker.Filters;
using KitTracker.Repositories;
using KitTracker.Settings;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;

namespace KitTracker.Controllers
{
    [Authorize]
    [IncommAccessRequired]
    [ApiController]
    [Route("[controller]")]
    public class KitsController : ControllerBase
    {
        private readonly ILogger<KitsController> _logger;
        private readonly KitRepository _repository;

        public KitsController(ILogger<KitsController> logger,
            KitRepository repository)
        {
            _logger = logger;
            _repository = repository;
        }

        [ScanningAccessFilter]
        [HttpGet]
        [Route("stages")]
        public async Task<IEnumerable<string>> GetStageNames() => await _repository.GetStageNames();

        [ScanningAccessFilter]
        [HttpGet]
        [Route("{serialNumber}")]
        public async Task<ActionResult> GetItem(string serialNumber)
        {
            serialNumber = serialNumber.Trim();
            try
            {
                var item = await _repository.GetItem(serialNumber);
                if (item == null)
                    return NotFound("Item does not exist");
                else
                    return Ok(item);
            }
            catch (InvalidOperationException ex)
            {
                return BadRequest(ex.Message);
            }
        }

        [ScanningAccessFilter]
        [HttpPost]
        [Route("{serialNumber}")]
        public async Task<ActionResult> UpdateItem(string serialNumber, [FromBody] UpdateItemModel model)
        {
            serialNumber = serialNumber.Trim();
            try
            {
                await _repository.UpdateItem(serialNumber, model.KitNumber, model.WeekOf, model.StageName);

                return Accepted();
            }
            catch(InvalidOperationException ex)
            {
                return BadRequest(ex.Message);
            }
        }

        [AdminAccessFilter]
        [HttpGet]
        [Route("reports")]
        public async Task<ReportData> GetReportData() => await _repository.GetReportData();
    }
}
