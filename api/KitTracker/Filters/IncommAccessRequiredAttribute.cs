using KitTracker.Controllers;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.Filters;
using System;
using System.Threading.Tasks;

namespace KitTracker.Filters
{
    public class IncommAccessRequiredAttribute : Attribute, IAsyncActionFilter
	{
		public async Task OnActionExecutionAsync(ActionExecutingContext context, ActionExecutionDelegate next)
		{
			if (context.Controller is AuthenticatedControllerBase controller)
			{
				var userInfo = await controller.GetUserInfo();
				if (userInfo.HasAdminAccess)
				{
					await next(); return;
				}
				else if (userInfo.CompanyId != 3)
				{
					context.Result = new UnauthorizedObjectResult("Resource forbidden."); return;
				}
			}

			await next();
		}
	}
}
