using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc.Filters;
using Microsoft.Extensions.Logging;

namespace KitTracker.Filters
{
	public class LogExceptionFilter : ExceptionFilterAttribute
	{
		private readonly ILogger<LogExceptionFilter> _logger;

		public LogExceptionFilter(ILogger<LogExceptionFilter> logger)
		{
			_logger = logger;
		}

		public override void OnException(ExceptionContext context)
		{
			_logger.LogError(context.Exception, "Uncaught Server Exception");
		}
	}
}
