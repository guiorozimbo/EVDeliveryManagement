using EVDelivery.Vehicle.Application.Services;
using FluentValidation;
using Microsoft.Extensions.DependencyInjection;

namespace EVDelivery.Vehicle.Application;

public static class DependencyInjection
{
    public static IServiceCollection AddVehicleApplication(this IServiceCollection services)
    {
        services.AddValidatorsFromAssembly(typeof(DependencyInjection).Assembly);
        services.AddScoped<IVehicleApplicationService, VehicleApplicationService>();
        return services;
    }
}
