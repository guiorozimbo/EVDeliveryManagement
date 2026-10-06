using System.Text.RegularExpressions;
using EVDelivery.Vehicle.Application.DTOs;
using EVDelivery.Vehicle.Domain.Enums;
using FluentValidation;

namespace EVDelivery.Vehicle.Application.Validators;

public class CreateVehicleRequestValidator : AbstractValidator<CreateVehicleRequest>
{
    private static readonly Regex VinRegex = new("^[A-HJ-NPR-Z0-9]{17}$", RegexOptions.Compiled | RegexOptions.IgnoreCase);

    public CreateVehicleRequestValidator()
    {
        RuleFor(x => x.Vin)
            .NotEmpty().WithMessage("VIN is required.")
            .Length(17).WithMessage("VIN must be exactly 17 characters.")
            .Matches(VinRegex).WithMessage("VIN contains invalid characters. Letters I, O, and Q are disallowed.");

        RuleFor(x => x.Brand)
            .NotEmpty().WithMessage("Vehicle brand is required.")
            .MaximumLength(50).WithMessage("Brand cannot exceed 50 characters.");

        RuleFor(x => x.Model)
            .NotEmpty().WithMessage("Vehicle model is required.")
            .MaximumLength(50).WithMessage("Model cannot exceed 50 characters.");

        RuleFor(x => x.Year)
            .InclusiveBetween(2000, DateTime.UtcNow.Year + 2)
            .WithMessage($"Model year must be between 2000 and {DateTime.UtcNow.Year + 2}.");

        RuleFor(x => x.BatteryCapacityKwh)
            .GreaterThan(0).WithMessage("Battery capacity must be greater than 0 kWh.")
            .LessThanOrEqualTo(300).WithMessage("Battery capacity cannot exceed 300 kWh.");

        RuleFor(x => x.BatteryLevelPercentage)
            .InclusiveBetween(0, 100).WithMessage("Battery percentage must be between 0 and 100.");

        RuleFor(x => x.EstimatedRangeKm)
            .GreaterThanOrEqualTo(0).WithMessage("Estimated range cannot be negative.");

        RuleFor(x => x.OdometerKm)
            .GreaterThanOrEqualTo(0).WithMessage("Odometer reading cannot be negative.");

        RuleFor(x => x.InitialStatus)
            .Must(status => string.IsNullOrWhiteSpace(status) || Enum.TryParse<VehicleStatus>(status, true, out _))
            .WithMessage("Invalid initial vehicle status.");
    }
}

public class UpdateVehicleRequestValidator : AbstractValidator<UpdateVehicleRequest>
{
    public UpdateVehicleRequestValidator()
    {
        RuleFor(x => x.Brand).NotEmpty().MaximumLength(50);
        RuleFor(x => x.Model).NotEmpty().MaximumLength(50);
        RuleFor(x => x.Year).InclusiveBetween(2000, DateTime.UtcNow.Year + 2);
        RuleFor(x => x.EstimatedRangeKm).GreaterThanOrEqualTo(0);
    }
}

public class UpdateVehicleStatusRequestValidator : AbstractValidator<UpdateVehicleStatusRequest>
{
    public UpdateVehicleStatusRequestValidator()
    {
        RuleFor(x => x.NewStatus)
            .NotEmpty().WithMessage("New status is required.")
            .Must(status => Enum.TryParse<VehicleStatus>(status, true, out _))
            .WithMessage("Invalid vehicle status value.");
    }
}
