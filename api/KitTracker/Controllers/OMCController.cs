using KitTracker.CustomProvider;
using KitTracker.Entities;
using KitTracker.Entities.Portal;
using KitTracker.Entities.Portal.OMC;
using KitTracker.Filters;
using KitTracker.Repositories;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Logging;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Security.Claims;
using System.Threading.Tasks;
using static KitTracker.Repositories.OMCRepository;

namespace KitTracker.Controllers
{
	[ApiController]
	[Route("[controller]")]
	public class OMCController : AuthenticatedControllerBase
	{
		private readonly ILogger<OMCController> _logger;
		private readonly OMCRepository _omcRepo;

		public OMCController(ILogger<OMCController> logger,
			OMCRepository omcRepo,
			UsersRepository usersRepository,
			UserManager<ApplicationUser> userManager)
			: base(usersRepository, userManager)
		{
			_logger = logger;
			_omcRepo = omcRepo;
		}

		[HttpGet]
		[AllowAnonymous]
		[Route("player/{storeId}/{displayLocationIndex}/{timestampMillis}/{sha512Hash}")]
		public async Task<ActionResult> GetPlayerState(int storeId, int displayLocationIndex, long timestampMillis, string sha512Hash)
		{
			var authParams = new AuthenticationParameters()
			{
				MediaContentStoreId = storeId,
				DisplayLocationIndex = displayLocationIndex,
				TimestampMillis = timestampMillis,
				Sha512Hash = sha512Hash
			};
			if (!AuthenticateAnonymousRequest(authParams))
				return BadRequest("Failed to authenticate.");

			var playerState = await _omcRepo.GetPlayerState(authParams);

			if (playerState == null)
				return NotFound();
			else
				return Ok(playerState);
		}

		[AllowAnonymous]
		[Route("player/content/{storeId}/{displayLocationIndex}/{timestampMillis}/{sha512Hash}")]
		public async Task<IActionResult> GetPlayerContent(int storeId, int displayLocationIndex, long timestampMillis, string sha512Hash)
		{
			var authParams = new AuthenticationParameters()
			{
				MediaContentStoreId = storeId,
				DisplayLocationIndex = displayLocationIndex,
				TimestampMillis = timestampMillis,
				Sha512Hash = sha512Hash
			};
			if (!AuthenticateAnonymousRequest(authParams))
				return BadRequest("Failed to authenticate.");

			var content = await _omcRepo.RequestPlayerContent(authParams);
			if (content == null)
				return BadRequest("No scheduled content.");

			return File(content.Bytes, content.MimeType);
		}

		[AllowAnonymous]
		[Route("player/autoupdate/{storeId}/{displayLocationIndex}/{timestampMillis}/{sha512Hash}")]
		public async Task<IActionResult> GetPlayerAppZip(int storeId, int displayLocationIndex, long timestampMillis, string sha512Hash)
		{
			var authParams = new AuthenticationParameters()
			{
				MediaContentStoreId = storeId,
				DisplayLocationIndex = displayLocationIndex,
				TimestampMillis = timestampMillis,
				Sha512Hash = sha512Hash
			};
			if (!AuthenticateAnonymousRequest(authParams))
				return BadRequest("Failed to authenticate.");

			var zipFile = await _omcRepo.GetPlayerAppZipFileResult(authParams);
			if (zipFile == null)
				return BadRequest($"Could not find download for player app version.");

			return File(zipFile.Bytes, zipFile.MimeType);
		}

		[HttpGet]
		[MediaContentAccess]
		[Route("stores/statuses")]
		public async Task<IEnumerable<StoreStatus>> GetStoreStatuses()
		{
			var userInfo = await GetUserInfo();

			int[] retailerIds;
			if (userInfo.HasAdminAccess)
				retailerIds = (await _omcRepo.GetRetailers()).Select(r => r.MediaContentRetailerId).ToArray();
			else
				retailerIds = userInfo.MediaContentRetailerPermissions.Select(p => p.MediaContentRetailerId).ToArray();
			return await _omcRepo.GetStoreStatuses(retailerIds);
		}

		[HttpPost]
		[AllowAnonymous]
		[Route("player/screenshot")]
		public async Task<ActionResult> UploadScreenshot([FromForm] UploadScreenshotModel model)
		{
			var authParams = new AuthenticationParameters()
			{
				MediaContentStoreId = model.StoreId,
				DisplayLocationIndex = model.DisplayLocationIndex,
				TimestampMillis = model.TimestampMillis,
				Sha512Hash = model.Sha512Hash
			};
			if (!AuthenticateAnonymousRequest(authParams))
				return BadRequest("Failed to authenticate.");

			var screenshotParams = new UploadScreenshotParameters()
			{
				PlayerKey = authParams,
				Screenshot = model.File
			};
			await _omcRepo.UploadScreenshot(screenshotParams);

			return Ok();
		}

		[HttpPost]
		[AllowAnonymous]
		[Route("player/log")]
		public async Task<ActionResult> AddPlayerLog([FromForm] AddPlayerLogModel model)
		{
			var authParams = new AuthenticationParameters()
			{
				MediaContentStoreId = model.StoreId,
				DisplayLocationIndex = model.DisplayLocationIndex,
				TimestampMillis = model.TimestampMillis,
				Sha512Hash = model.Sha512Hash
			};
			if (!AuthenticateAnonymousRequest(authParams))
				return BadRequest("Failed to authenticate.");

			var logParams = new AddPlayerLogParameters()
			{
				PlayerKey = authParams,
				LogMessage = model.LogMessage
			};
			await _omcRepo.AddPlayerLogMessage(logParams);

			return Ok();
		}
	}
}
