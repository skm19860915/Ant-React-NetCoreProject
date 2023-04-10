using KitTracker.CustomProvider;
using KitTracker.Entities;
using KitTracker.Repositories;
using Microsoft.AspNetCore.Authentication;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Configuration;
using Microsoft.IdentityModel.Tokens;
using System;
using System.Collections.Generic;
using System.IdentityModel.Tokens.Jwt;
using System.Linq;
using System.Security.Claims;
using System.Text;
using System.Threading.Tasks;

namespace KitTracker.Controllers
{
	[ApiController]
	[Route("[controller]")]
	public class UsersController : AuthenticatedControllerBase
	{
		private readonly IConfiguration _configuration;

		public UsersController(UsersRepository userRepository,
			UserManager<ApplicationUser> userManager,
			IConfiguration configuration)
			: base(userRepository, userManager)
		{
			_configuration = configuration;
		}

		[Authorize]
		[HttpGet]
		[Route("info")]
		public async Task<UserInformation> GetUserInformation() => await GetUserInfo();

		[HttpPost]
		[Route("authenticate")]
		[AllowAnonymous]
		public async Task<ActionResult> Authenticate(AuthenticateRequest model)
		{
			var user = await _userManager.FindByNameAsync(model.UserName);
			if (user != null && await _userManager.CheckPasswordAsync(user, model.Password))
			{
				var userRoles = await _userManager.GetRolesAsync(user);
				var authClaims = new List<Claim>
				{
					new Claim(ClaimTypes.Name, user.UserName),
					new Claim(JwtRegisteredClaimNames.Jti, Guid.NewGuid().ToString()),

				};
				foreach (var userRole in userRoles)
				{
					authClaims.Add(new Claim(ClaimTypes.Role, userRole));
				}
				var token = new JwtSecurityToken(
						issuer: _configuration["JWT:ValidIssuer"],
						audience: _configuration["JWT:ValidAudience"],
						expires: DateTime.Now.AddYears(1),
						claims: authClaims,
						signingCredentials: new SigningCredentials(
											  new SymmetricSecurityKey(Encoding.UTF8.GetBytes(_configuration["JWT:Secret"])),
											 SecurityAlgorithms.HmacSha256Signature)
						);
				return Ok(new
				{
					Token = new JwtSecurityTokenHandler().WriteToken(token),
					Expiration = token.ValidTo
				});
			}
			else
				return BadRequest("Incorrect username or password.");
		}
	}

}

