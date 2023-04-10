using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using KitTracker.Converters;
using KitTracker.CustomProvider;
using KitTracker.Filters;
using KitTracker.Repositories;
using KitTracker.Services;
using KitTracker.Settings;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.HttpsPolicy;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.Logging;
using Microsoft.IdentityModel.Tokens;
using Microsoft.OpenApi.Models;

namespace KitTracker
{
	public class Startup
	{
		public Startup(IConfiguration configuration)
		{
			Configuration = configuration;
		}

		public IConfiguration Configuration { get; }

		// This method gets called by the runtime. Use this method to add services to the container.
		public void ConfigureServices(IServiceCollection services)
		{
			//Add identity types
			services.AddIdentity<ApplicationUser, ApplicationRole>().AddDefaultTokenProviders();

			//add identity Servies
			services.AddTransient<IUserStore<ApplicationUser>, CustomUserStore>();
			services.AddTransient<IRoleStore<ApplicationRole>, CustomRoleStore>();

			var tradesoftSettings = Configuration.GetSection(nameof(TradesoftSettings)).Get<TradesoftSettings>();
			if (string.IsNullOrEmpty(tradesoftSettings?.ConnectionString))
				services.AddScoped<ITradesoftRepository, FakeTradesoftRepository>();
			else
				services.AddScoped<ITradesoftRepository, TradesoftRepository>();

			services.Configure<AlbertsonSettings>(Configuration.GetSection("Albertson"));
			services.Configure<HillmanSettings>(Configuration.GetSection("Hillman"));
			services.Configure<TradesoftSettings>(Configuration.GetSection("Tradesoft"));
			services.Configure<PortalSettings>(Configuration.GetSection("Portal"));
			services.Configure<KitTrackerSettings>(Configuration.GetSection("KitTracker"));
			services.Configure<SMTPSettings>(Configuration.GetSection("SMTP"));
			services.AddScoped<FTPService>();
			services.AddScoped<MediaContentRepository>();
			services.AddScoped<KitRepository>();
			services.AddScoped<HillmanRepository>();
			services.AddScoped<InventoryRepository>();
			services.AddScoped<EmailService>();
			services.AddScoped<OrdersRepository>();
			services.AddScoped<UsersRepository>();
			services.AddScoped<OMCRepository>();


			services.AddControllers(options =>
			{
				options.Filters.Add(typeof(LogExceptionFilter));
			}).AddJsonOptions(a => a.JsonSerializerOptions.Converters.Insert(0, new TrimmingConverter()));

			services.AddSwaggerGen(c =>
			{
				c.SwaggerDoc("v1", new OpenApiInfo { Title = "KitTracker", Version = "v1" });
			});

			// Adding Authentication
			services.AddAuthentication(options =>
			{
				options.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
				options.DefaultChallengeScheme = JwtBearerDefaults.AuthenticationScheme;
				options.DefaultScheme = JwtBearerDefaults.AuthenticationScheme;
			})

			// Adding Jwt Bearer
			.AddJwtBearer(options =>
			{
				options.SaveToken = true;
				options.RequireHttpsMetadata = false;
				options.TokenValidationParameters = new TokenValidationParameters()
				{
					ValidateIssuer = true,
					ValidateAudience = true,
					ValidAudience = Configuration["JWT:ValidAudience"],
					ValidIssuer = Configuration["JWT:ValidIssuer"],
					IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(Configuration["JWT:Secret"]))
				};
			});

			services.AddCors(option =>
			{
				option.AddDefaultPolicy(b =>
				{
					b.WithOrigins("http://localhost:3000").AllowAnyHeader().AllowAnyMethod();
				});
			});

			services.Configure<ApiBehaviorOptions>(options =>
			{
				options.InvalidModelStateResponseFactory = actionContext =>
				{
					ValidationProblemDetails error = actionContext.ModelState
						.Where(e => e.Value.Errors.Count > 0)
						.Select(e => new ValidationProblemDetails(actionContext.ModelState)).FirstOrDefault();

				   // Here you can add logging to you log file or to your Application Insights.
				   // For example, using Serilog:
				   // Log.Error($"{{@RequestPath}} received invalid message format: {{@Exception}}", 
				   //   actionContext.HttpContext.Request.Path.Value, 
				   //   error.Errors.Values);
				   return new BadRequestObjectResult(error);
				};
			});
		}

		// This method gets called by the runtime. Use this method to configure the HTTP request pipeline.
		public void Configure(IApplicationBuilder app, IWebHostEnvironment env)
		{
			app.UseMiddleware<RequestLoggingMiddleware>();

			if (env.IsDevelopment())
			{
				app.UseDeveloperExceptionPage();
				app.UseSwagger();
				app.UseSwaggerUI(c => c.SwaggerEndpoint("/swagger/v1/swagger.json", "KitTracker v1"));
			}

			app.UseHttpsRedirection();

			app.UseRouting();
			app.UseAuthentication();
			app.UseAuthorization();

			app.UseCors();

			app.UseEndpoints(endpoints =>
			{
				endpoints.MapControllers();
			});
		}
	}
}