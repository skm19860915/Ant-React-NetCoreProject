using System;
using System.Linq;
using System.Reflection;
using DbUp;
using KitTracker.Settings;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.Options;

namespace KitTracker.Extensions
{
	public static class HostExtensions
	{
		public static IHost MigrateDb<TSettings>(this IHost host) where TSettings : class, IDatabaseSettings
		{
			using (var scope = host.Services.CreateScope())
			{
				var services = scope.ServiceProvider;
				var connectionString = services.GetRequiredService<IOptions<TSettings>>().Value.ConnectionString;

				var upgrader =
				DeployChanges.To
					.SqlDatabase(connectionString)
					.WithScriptsEmbeddedInAssembly(
						Assembly.GetExecutingAssembly(),
						name => name.StartsWith($"KitTracker.Scripts.{typeof(TSettings).ToString().Split('.').Last().Replace("Settings", "")}."))
					.LogToConsole()
					.Build();

				var result = upgrader.PerformUpgrade();

				if (!result.Successful)
				{
					Console.ForegroundColor = ConsoleColor.Red;
					Console.WriteLine(result.Error);
					Console.ResetColor();
#if DEBUG
					Console.ReadLine();
#endif
					throw new Exception("Database migration failed: " + result.Error);
				}

				Console.ForegroundColor = ConsoleColor.Green;
				Console.WriteLine("Database migrated successfully.");
				Console.ResetColor();

				return host;
			}
		}
	}
}
