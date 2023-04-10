using KitTracker.Controllers;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.Filters;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Net;
using System.Net.Http;
using System.Text;
using System.Threading;
using System.Threading.Tasks;

namespace KitTracker.Filters
{
	public class MediaContentAccessAttribute : Attribute, IAsyncActionFilter
	{
		public async Task OnActionExecutionAsync(ActionExecutingContext context, ActionExecutionDelegate next)
		{
			if (context.Controller is AuthenticatedControllerBase controller)
			{
				var userInfo = await controller.GetUserInfo();
				if (!userInfo.HasAdminAccess && !userInfo.HasMediaContentAccess)
				{
					context.Result = new UnauthorizedObjectResult("Media content access required."); return;
				}
			}

			await next();
		}
	}
}
