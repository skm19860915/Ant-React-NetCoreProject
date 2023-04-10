using KitTracker.CustomProvider;
using KitTracker.Entities;
using KitTracker.Entities.Portal;
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

namespace KitTracker.Controllers
{
	[Authorize]
	[OrdersAccessFilter]
	[ApiController]
	[Route("[controller]")]
	public class OrdersController : AuthenticatedControllerBase
	{
		private readonly ILogger<OrdersController> _logger;
		private readonly OrdersRepository _orderRepo;

		public OrdersController(ILogger<OrdersController> logger,
			OrdersRepository orderRepo,
			UsersRepository usersRepository,
			UserManager<ApplicationUser> userManager)
			: base(usersRepository, userManager)
		{
			_logger = logger;
			_orderRepo = orderRepo;
		}


		[HttpGet]
		public async Task<IActionResult> GetOrders(
			DateTime? needByStartDate,
			DateTime? needByEndDate,
			DateTime? orderStartDate,
			DateTime? orderEndDate)
		{
			if (needByStartDate == null && needByEndDate == null && orderStartDate == null && orderEndDate == null)
			{
				needByEndDate = DateTime.Now.AddDays(1);
				needByStartDate = DateTime.Now.AddMonths(-3);
				orderEndDate = DateTime.Now.AddDays(1);
				orderStartDate = DateTime.Now.AddMonths(-3);
			}
			else if (needByStartDate != null || needByEndDate != null)
			{
				if (needByEndDate == null)
					needByEndDate = DateTime.Now.AddDays(1);
				else if (needByStartDate == null)
					needByStartDate = DateTime.Now.AddMonths(-3);

				if ((needByEndDate.Value - needByStartDate.Value).TotalDays > 365)
					return BadRequest("Need by date range cannot be more than a year.");
			}
			else if (orderStartDate != null || orderEndDate != null)
			{
				if (orderEndDate == null)
					orderEndDate = DateTime.Now.AddDays(1);
				else if (orderStartDate == null)
					orderStartDate = DateTime.Now.AddMonths(-3);

				if ((orderEndDate.Value - orderStartDate.Value).TotalDays > 365)
					return BadRequest("Order date range cannot be more than a year.");
			}

			int companyId = (await GetUserInfo()).CompanyId;
			return Ok(await _orderRepo.GetOrders(companyId, needByStartDate, needByEndDate, orderStartDate, orderEndDate));
		}

		[HttpPost]
		public async Task<IActionResult> CreateOrder([FromBody] OrderModel order)
		{
			var userInfo = await GetUserInfo();
			var result = await _orderRepo.CreateOrUpdateOrder(userInfo, order);
			if (result.Item2 != null)
				return BadRequest(result.Item2);
			return Ok(result.Item1);
		}

		[HttpPut]
		[Route("{orderId}")]
		public async Task<IActionResult> UpdateOrder(int orderId, OrderModel order)
		{
			var userInfo = await GetUserInfo();
			order.OrderId = orderId;
			var result = await _orderRepo.CreateOrUpdateOrder(userInfo, order);
			if (result.Item2 != null)
				return BadRequest(result.Item2);
			return Ok(result.Item1);
		}

		//[HttpGet]
		//[Route("{orderId}")]
		//public async Task<OrderModel> GetOrder(int orderId) => await _orderRepo.GetOrderModel(orderId);

		//[HttpPost]
		//[Route("RolloutOrder")]
		//public async Task<IActionResult> CreateRolloutOrder(OrderModel orders, string fileName)
  //      {
		//	fileName = "excel_rollout.csv";
		//	var userInfo = await GetUserInfo();
		//	var result = await _orderRepo.CreateRollOutOrder(userInfo, orders, fileName);
		//	if (result.Item2 != null)
		//		return BadRequest(result.Item2);
		//	return Ok(result.Item1);
		//}
	}
}
