using System.Text.Json.Serialization;
using EVDelivery.Vehicle.API.Middleware;
using EVDelivery.Vehicle.Application;
using EVDelivery.Vehicle.Infrastructure;
using EVDelivery.Vehicle.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;
using Microsoft.OpenApi.Models;
using Serilog;

var builder = WebApplication.CreateBuilder(args);

// Configure Serilog
Log.Logger = new LoggerConfiguration()
    .ReadFrom.Configuration(builder.Configuration)
    .Enrich.FromLogContext()
    .WriteTo.Console(outputTemplate: "[{Timestamp:HH:mm:ss} {Level:u3}] [{CorrelationId}] {Message:lj}{NewLine}{Exception}")
    .CreateLogger();

builder.Host.UseSerilog();

// Add Layers
builder.Services.AddVehicleApplication();
builder.Services.AddVehicleInfrastructure(builder.Configuration);

// Add Controllers & JSON Options
builder.Services.AddControllers()
    .AddJsonOptions(options =>
    {
        options.JsonSerializerOptions.Converters.Add(new JsonStringEnumConverter());
        options.JsonSerializerOptions.DefaultIgnoreCondition = JsonIgnoreCondition.WhenWritingNull;
    });

// Add Health Checks
builder.Services.AddHealthChecks()
    .AddDbContextCheck<VehicleDbContext>("VehicleDb");

// Add Swagger
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen(c =>
{
    c.SwaggerDoc("v1", new OpenApiInfo
    {
        Title = "EV Delivery - Vehicle Service API",
        Version = "v1",
        Description = "Microservice managing Electric Vehicle aggregate, finite state lifecycle, and status audit history."
    });
});

// CORS
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowAll", policy =>
    {
        policy.AllowAnyOrigin()
              .AllowAnyMethod()
              .AllowAnyHeader();
    });
});

var app = builder.Build();

// Migrate and seed database
using (var scope = app.Services.CreateScope())
{
    var services = scope.ServiceProvider;
    var logger = services.GetRequiredService<ILogger<Program>>();
    try
    {
        var context = services.GetRequiredService<VehicleDbContext>();
        // EnsureCreated or Migrate depending on whether relational DB is online
        context.Database.EnsureCreated();
        await VehicleDbSeeder.SeedAsync(context, logger);
    }
    catch (Exception ex)
    {
        logger.LogWarning(ex, "Could not run automated DB setup during startup. Will continue in case DB is being provisioned.");
    }
}

// Middleware Pipeline
app.UseCentralizedExceptionHandling();
app.UseCorrelationId();
app.UseSerilogRequestLogging();

if (app.Environment.IsDevelopment() || true)
{
    app.UseSwagger();
    app.UseSwaggerUI(c =>
    {
        c.SwaggerEndpoint("/swagger/v1/swagger.json", "Vehicle Service API v1");
        c.RoutePrefix = "swagger";
    });
}

app.UseCors("AllowAll");
app.UseRouting();

app.MapHealthChecks("/health");
app.MapControllers();

app.Run();
