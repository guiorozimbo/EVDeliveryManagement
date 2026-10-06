using EVDelivery.Customer.Application.Services;
using FluentValidation;
using Microsoft.Extensions.DependencyInjection;

namespace EVDelivery.Customer.Application;

public static class DependencyInjection
{
    public static IServiceCollection AddCustomerApplication(this IServiceCollection services)
    {
        services.AddValidatorsFromAssembly(typeof(DependencyInjection).Assembly);
        services.AddScoped<ICustomerApplicationService, CustomerApplicationService>();
        return services;
    }
}
