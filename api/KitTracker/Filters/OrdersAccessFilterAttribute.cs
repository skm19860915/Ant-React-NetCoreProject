using KitTracker.Controllers;
using KitTracker.Repositories;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.Filters;
using System;
using System.Threading.Tasks;

namespace KitTracker.Filters
{
    public class OrdersAccessFilterAttribute : Attribute, IAsyncActionFilter
	{
		public async Task OnActionExecutionAsync(ActionExecutingContext context, ActionExecutionDelegate next)
		{
			var repository = context.HttpContext.RequestServices.GetService(typeof(OrdersRepository)) as OrdersRepository;
			if (context.Controller is AuthenticatedControllerBase controller)
			{
				var userInfo = await controller.GetUserInfo();

				if (userInfo.HasAdminAccess)
				{
					await next(); return;
				}
				else if (!userInfo.HasManagerAccess && !userInfo.HasOrdersAccess)
				{
					context.Result = new UnauthorizedObjectResult("Must be manager or have orders access."); return;
				}
				else if (context.ActionArguments.ContainsKey("orderId"))
				{
					int orderId = (int)context.ActionArguments["orderId"];
					var order = await repository.GetPopulatedOrder(orderId);
					if (order == null || order.CompanyId != userInfo.CompanyId)
					{
						context.Result = new NotFoundObjectResult("Order does not exist."); return;
					}
				}
			}

			await next();
		}
	}
}
