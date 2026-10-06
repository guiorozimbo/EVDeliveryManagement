using EVDelivery.Customer.Domain.Repositories;
using EVDelivery.Customer.Infrastructure.Persistence;
using EVDelivery.Customer.Infrastructure.Repositories;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;

namespace EVDelivery.Customer.Infrastructure;

public static class DependencyInjection
{
    public static IServiceCollection AddCustomerInfrastructure(this IServiceCollection services, IConfiguration configuration)
    {
        var connectionString = configuration.GetConnectionString("CustomerDb")
            ?? "Host=localhost;Port=5432;Database=ev_customer_db;Username=ev_admin;Password=ev_delivery_secure_pass_2026";

        services.AddDbContext<CustomerDbContext>(options =>
        {
            options.UseNpgsql(connectionString, npgsqlOptions =>
            {
                npgsqlOptions.MigrationsAssembly(typeof(CustomerDbContext).Assembly.FullName);
                npgsqlOptions.EnableRetryOnFailure(maxRetryCount: 3, maxRetryDelay: TimeSpan.FromSeconds(5), errorCodesToAdd: null);
            });
        });

        services.AddScoped<ICustomerRepository, CustomerRepository>();

        return services;
    }
}
