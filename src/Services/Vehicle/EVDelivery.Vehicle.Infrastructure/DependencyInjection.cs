using EVDelivery.Vehicle.Domain.Repositories;
using EVDelivery.Vehicle.Infrastructure.Persistence;
using EVDelivery.Vehicle.Infrastructure.Repositories;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;

namespace EVDelivery.Vehicle.Infrastructure;

public static class DependencyInjection
{
    public static IServiceCollection AddVehicleInfrastructure(this IServiceCollection services, IConfiguration configuration)
    {
        var connectionString = configuration.GetConnectionString("VehicleDb")
            ?? "Host=localhost;Port=5432;Database=ev_vehicle_db;Username=ev_admin;Password=ev_delivery_secure_pass_2026";

        services.AddDbContext<VehicleDbContext>(options =>
        {
            options.UseNpgsql(connectionString, npgsqlOptions =>
            {
                npgsqlOptions.MigrationsAssembly(typeof(VehicleDbContext).Assembly.FullName);
                npgsqlOptions.EnableRetryOnFailure(maxRetryCount: 3, maxRetryDelay: TimeSpan.FromSeconds(5), errorCodesToAdd: null);
            });
        });

        services.AddScoped<IVehicleRepository, VehicleRepository>();

        return services;
    }
}
