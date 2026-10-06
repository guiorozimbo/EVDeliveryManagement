using EVDelivery.Delivery.Domain.Repositories;
using EVDelivery.Delivery.Infrastructure.Persistence;
using EVDelivery.Delivery.Infrastructure.Repositories;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;

namespace EVDelivery.Delivery.Infrastructure;

public static class DependencyInjection
{
    public static IServiceCollection AddDeliveryInfrastructure(this IServiceCollection services, IConfiguration configuration)
    {
        var connectionString = configuration.GetConnectionString("DeliveryDb")
            ?? "Host=localhost;Port=5432;Database=ev_delivery_db;Username=ev_admin;Password=ev_delivery_secure_pass_2026";

        services.AddDbContext<DeliveryDbContext>(options =>
        {
            options.UseNpgsql(connectionString, npgsqlOptions =>
            {
                npgsqlOptions.MigrationsAssembly(typeof(DeliveryDbContext).Assembly.FullName);
                npgsqlOptions.EnableRetryOnFailure(maxRetryCount: 3, maxRetryDelay: TimeSpan.FromSeconds(5), errorCodesToAdd: null);
            });
        });

        services.AddScoped<IDeliveryRepository, DeliveryRepository>();

        return services;
    }
}
