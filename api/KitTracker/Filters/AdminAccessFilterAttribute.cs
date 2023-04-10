using KitTracker.Controllers;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.Filters;
using System;
using System.Threading.Tasks;

namespace KitTracker.Filters
{
    public class AdminAccessFilterAttribute : Attribute, IAsyncActionFilter
	{
		public async Task OnActionExecutionAsync(ActionExecutingContext context, ActionExecutionDelegate next)
		{
			if (context.Controller is AuthenticatedControllerBase controller)
			{
				var userInfo = await controller.GetUserInfo();
				if (!userInfo.HasAdminAccess)
				{
					context.Result = new UnauthorizedObjectResult("Admin access required."); return;
				}
			}

			await next();
		}
	}
}
