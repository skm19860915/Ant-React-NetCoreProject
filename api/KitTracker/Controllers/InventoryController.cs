using System.Collections.Generic;
using System.Threading.Tasks;
using KitTracker.CustomProvider;
using KitTracker.Entities.Portal;
using KitTracker.Filters;
using KitTracker.Repositories;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Logging;

namespace KitTracker.Controllers
{
    [Authorize]
    [InventoryAccessFilter]
    [ApiController]
    [Route("[controller]")]
    public class InventoryController : AuthenticatedControllerBase
    {
        private readonly ILogger<InventoryController> _logger;
        private readonly InventoryRepository _repository;

        public InventoryController(ILogger<InventoryController> logger,
            InventoryRepository repository,
            UsersRepository usersRepository,
            UserManager<ApplicationUser> userManager)
            : base(usersRepository, userManager)
        {
            _logger = logger;
            _repository = repository;
        }

        [HttpGet]
        public async Task<IEnumerable<tItem>> GetInventoryItems(string searchValue = null, bool available = false)
        {
            int companyId = (await GetUserInfo()).CompanyId;
            return await _repository.GetInventoryItems(companyId, searchValue, available);
        }

        [HttpGet]
        [Route("{itemId}")]
        public async Task<tItem> GetInventoryItem(int itemId) => await _repository.GetInventoryItem(itemId);

        [HttpGet]
        [Route("{itemId}/productimage")]
        public async Task<IActionResult> GetProductImage(int itemId)
        {
            var image = await _repository.GetProductImage(itemId);
            if (image == null)
                return NotFound();
            else
                return File(image.Bytes, image.MimeType);
        }

        [HttpGet]
        [Route("{itemId}/productimage/thumbnail")]
        public async Task<IActionResult> GetProductImageThumbnail(int itemId)
        {
            var image = await _repository.GetProductImageThumbnail(itemId);
            if (image == null)
                return NotFound();
            else
                return File(image.Bytes, image.MimeType);
        }

        [HttpGet]
        [Route("{itemId}/packageimage")]
        public async Task<IActionResult> GetPackageImage(int itemId)
        {
            var image = await _repository.GetPackageImage(itemId);
            if (image == null)
                return NotFound();
            else
                return File(image.Bytes, image.MimeType);
        }

        [HttpGet]
        [Route("{itemId}/packageimage/thumbnail")]
        public async Task<IActionResult> GetPackageImageThumbnail(int itemId)
        {
            var image = await _repository.GetPackageImageThumbnail(itemId);
            if (image == null)
                return NotFound();
            else
                return File(image.Bytes, image.MimeType);
        }
    }
}
