using System.Net.Sockets;
using EVDelivery.Vehicle.Domain.Repositories;
using EVDelivery.Vehicle.Infrastructure.Persistence;
using EVDelivery.Vehicle.Infrastructure.Repositories;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Npgsql;

namespace EVDelivery.Vehicle.Infrastructure;

public static class DependencyInjection
{
    public static IServiceCollection AddVehicleInfrastructure(this IServiceCollection services, IConfiguration configuration)
    {
        var connectionString = configuration.GetConnectionString("VehicleDb")
            ?? "Host=localhost;Port=5432;Database=ev_vehicle_db;Username=ev_admin;Password=ev_delivery_secure_pass_2026";

        var isPostgresOnline = CanConnectToPostgres(connectionString);

        services.AddDbContext<VehicleDbContext>(options =>
        {
            if (isPostgresOnline)
            {
                options.UseNpgsql(connectionString, npgsqlOptions =>
                {
                    npgsqlOptions.MigrationsAssembly(typeof(VehicleDbContext).Assembly.FullName);
                    npgsqlOptions.EnableRetryOnFailure(maxRetryCount: 3, maxRetryDelay: TimeSpan.FromSeconds(5), errorCodesToAdd: null);
                });
            }
            else
            {
                // Resilient fallback: Ensure seamless demo operation even when Docker is offline
                options.UseInMemoryDatabase("ev_vehicle_db");
            }
        });

        services.AddScoped<IVehicleRepository, VehicleRepository>();

        return services;
    }

    private static bool CanConnectToPostgres(string connectionString)
    {
        try
        {
            var builder = new NpgsqlConnectionStringBuilder(connectionString);
            using var tcp = new TcpClient();
            var task = tcp.ConnectAsync(builder.Host ?? "localhost", builder.Port > 0 ? builder.Port : 5432);
            return task.Wait(TimeSpan.FromMilliseconds(800)) && tcp.Connected;
        }
        catch
        {
            return false;
        }
    }
}
