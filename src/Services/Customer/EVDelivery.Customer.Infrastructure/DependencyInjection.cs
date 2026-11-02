using System.Net.Sockets;
using EVDelivery.Customer.Domain.Repositories;
using EVDelivery.Customer.Infrastructure.Persistence;
using EVDelivery.Customer.Infrastructure.Repositories;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Npgsql;

namespace EVDelivery.Customer.Infrastructure;

public static class DependencyInjection
{
    public static IServiceCollection AddCustomerInfrastructure(this IServiceCollection services, IConfiguration configuration)
    {
        var connectionString = configuration.GetConnectionString("CustomerDb")
            ?? "Host=localhost;Port=5432;Database=ev_customer_db;Username=ev_admin;Password=ev_delivery_secure_pass_2026";

        var isPostgresOnline = CanConnectToPostgres(connectionString);

        services.AddDbContext<CustomerDbContext>(options =>
        {
            if (isPostgresOnline)
            {
                options.UseNpgsql(connectionString, npgsqlOptions =>
                {
                    npgsqlOptions.MigrationsAssembly(typeof(CustomerDbContext).Assembly.FullName);
                    npgsqlOptions.EnableRetryOnFailure(maxRetryCount: 3, maxRetryDelay: TimeSpan.FromSeconds(5), errorCodesToAdd: null);
                });
            }
            else
            {
                options.UseInMemoryDatabase("ev_customer_db");
            }
        });

        services.AddScoped<ICustomerRepository, CustomerRepository>();

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
