using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using KitTracker.Extensions;
using KitTracker.Settings;
using Microsoft.AspNetCore.Hosting;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.Logging;
using NLog.Web;

namespace KitTracker
{
	public class Program
	{
		private static NLog.Logger logger;
		public static void Main(string[] args)
		{
			NLog.Common.InternalLogger.LogLevel = NLog.LogLevel.Info;
			NLog.Common.InternalLogger.LogToConsole = true;
			logger = NLogBuilder.ConfigureNLog("nlog.config").GetCurrentClassLogger();
			AppDomain.CurrentDomain.UnhandledException += new UnhandledExceptionEventHandler(AppDomain_CurrentDomain_UnhandledException);
			try
			{
				logger.Debug("init main function");
				CreateHostBuilder(args)
					.Build()
					.MigrateDb<PortalSettings>()
					.MigrateDb<KitTrackerSettings>()
					.Run();
			}
			catch (Exception ex)
			{
				logger.Error(ex, "Error in init");
				throw;
			}
			finally
			{
				NLog.LogManager.Shutdown();
			}
		}

		public static IHostBuilder CreateHostBuilder(string[] args) =>
			Host.CreateDefaultBuilder(args)
				.ConfigureWebHostDefaults(webBuilder =>
				{
					webBuilder.UseStartup<Startup>();
				})
				.ConfigureLogging(logging =>
				{
					logging.ClearProviders();
					logging.SetMinimumLevel(LogLevel.Trace);
				})
				.UseNLog();

		static void AppDomain_CurrentDomain_UnhandledException(object sender, UnhandledExceptionEventArgs e)
		{
			// use logger here to log the events exception object
			// before the application quits
			Exception ex = (Exception)e.ExceptionObject;
			logger.Error(ex.Message + " " + ex.StackTrace);

			Console.WriteLine(e.ExceptionObject.ToString());
		}
	}
}
