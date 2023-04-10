using KitTracker.Controllers;
using KitTracker.Repositories;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.Filters;
using System;
using System.Threading.Tasks;

namespace KitTracker.Filters
{
    public class InventoryAccessFilterAttribute : Attribute, IAsyncActionFilter
	{
		public async Task OnActionExecutionAsync(ActionExecutingContext context, ActionExecutionDelegate next)
		{
			var repository = context.HttpContext.RequestServices.GetService(typeof(InventoryRepository)) as InventoryRepository;
			if (context.Controller is AuthenticatedControllerBase controller)
			{
				var userInfo = await controller.GetUserInfo();

				if (userInfo.HasAdminAccess)
				{
					await next(); return;
				}
				else if (!userInfo.HasManagerAccess && !userInfo.HasInventoryAccess)
				{
					context.Result = new UnauthorizedObjectResult("Must be manager or have inventory access."); return;
				}
				else if (context.ActionArguments.ContainsKey("itemId"))
				{
					int itemId = (int)context.ActionArguments["itemId"];
					var inventoryItem = await repository.GetInventoryItem(itemId);
					if (inventoryItem == null || inventoryItem.CompanyId != userInfo.CompanyId)
					{
						context.Result = new NotFoundObjectResult("Item does not exist.");
						return;
					}
				}
			}

			await next();
		}
	}
}
