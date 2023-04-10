using KitTracker.CustomProvider;
using KitTracker.Entities;
using KitTracker.Entities.Portal;
using KitTracker.Repositories;
using Microsoft.AspNetCore.Authentication;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Logging;
using System;
using System.Collections.Generic;
using System.IdentityModel.Tokens.Jwt;
using System.Linq;
using System.Security.Claims;
using System.Text;
using System.Threading.Tasks;

namespace KitTracker.Controllers
{
	public abstract class AuthenticatedControllerBase : ControllerBase
	{
		protected readonly UsersRepository _usersRepository;
		protected readonly UserManager<ApplicationUser> _userManager;

		public AuthenticatedControllerBase(UsersRepository usersRepository,
			UserManager<ApplicationUser> userManager)
		{
			_usersRepository = usersRepository;
			_userManager = userManager;
		}

		private static bool HasRole(JwtSecurityToken token, string roleName)
		{
			return token.Claims
				.Where(c => c.Type == ClaimTypes.Role
					&& c.Value == roleName)
				.Any();
		}

		public async Task<UserInformation> GetUserInfo()
		{
			string accessTokenString = await HttpContext.GetTokenAsync("access_token");
			var tokenHandler = new JwtSecurityTokenHandler();
			JwtSecurityToken accessToken = tokenHandler.ReadJwtToken(accessTokenString);

			string username = accessToken.Claims.Where(c => c.Type == ClaimTypes.Name).Select(c => c.Value).SingleOrDefault();

			ClaimsPrincipal currentUser = User;
			var currentUserName = currentUser.Identities.First().Name;
			ApplicationUser appUser = await _userManager.FindByNameAsync(currentUserName);
			tUser user = await _usersRepository.GetUser(appUser);

			var result = new UserInformation
			{
				User = user,
				ApplicationUser = appUser,
				Username = username,
				CompanyId = user.CompanyId,
				HasAdminAccess = HasRole(accessToken, "Administrator"),
				HasManagerAccess = HasRole(accessToken, "Manager"),
				HasOperationsAccess = HasRole(accessToken, "Company Employee"),
				HasMediaContentAccess = HasRole(accessToken, "Media Content"),
				HasInventoryAccess = HasRole(accessToken, "Inventory"),
				HasOrdersAccess = HasRole(accessToken, "Orders"),
				HasDesignRequestsAccess = HasRole(accessToken, "Design Requests"),
				HasShippingAccess = HasRole(accessToken, "Shipping"),
				HasScanningAccess = HasRole(accessToken, "Scanning")
			};
			result.MediaContentRetailerPermissions = await _usersRepository.GetMediaContentRetailerPermissions(user);

			return result;
		}
	}
}
