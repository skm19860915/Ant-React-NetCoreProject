using KitTracker.CustomProvider;
using KitTracker.Repositories;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using System.Threading.Tasks;

namespace KitTracker.Controllers
{
    [Authorize]
    [ApiController]
    [Route("[controller]")]
    public class MediaContentsController : AuthenticatedControllerBase
    {
        private readonly MediaContentRepository _mediaContentRepo;

        public MediaContentsController(UsersRepository usersRepository, 
            MediaContentRepository mediaContentRepo,
            UserManager<ApplicationUser> userManager) 
            : base(usersRepository, userManager)
        {
            _mediaContentRepo = mediaContentRepo;
        }

        [HttpGet]
        public async Task<IActionResult> GetMediaContents()
        {
            var result = await _mediaContentRepo.GetMediaContents();
            return Ok(result);
        }
    }
}
