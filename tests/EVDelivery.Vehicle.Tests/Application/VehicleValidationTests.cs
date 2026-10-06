using EVDelivery.Vehicle.Application.DTOs;
using EVDelivery.Vehicle.Application.Validators;
using FluentAssertions;
using Xunit;

namespace EVDelivery.Vehicle.Tests.Application;

public class VehicleValidationTests
{
    private readonly CreateVehicleRequestValidator _validator = new();

    [Fact]
    public void ValidRequest_ShouldPassValidation()
    {
        // Arrange
        var request = new CreateVehicleRequest(
            Vin: "LC0C74C4XR1234567",
            Brand: "BYD",
            Model: "Seal",
            Version: "Premium",
            Year: 2024,
            Color: "White",
            BatteryCapacityKwh: 82.5m,
            BatteryLevelPercentage: 85,
            EstimatedRangeKm: 420,
            OdometerKm: 12.5m
        );

        // Act
        var result = _validator.Validate(request);

        // Assert
        result.IsValid.Should().BeTrue();
    }

    [Fact]
    public void InvalidVin_ShouldFailValidation()
    {
        // Arrange
        var request = new CreateVehicleRequest(
            Vin: "INVALID_SHORT_VIN",
            Brand: "BYD",
            Model: "Seal",
            Version: "Premium",
            Year: 2024,
            Color: "White",
            BatteryCapacityKwh: 82.5m,
            BatteryLevelPercentage: 85,
            EstimatedRangeKm: 420,
            OdometerKm: 12.5m
        );

        // Act
        var result = _validator.Validate(request);

        // Assert
        result.IsValid.Should().BeFalse();
        result.Errors.Should().Contain(e => e.PropertyName == "Vin");
    }

    [Fact]
    public void NegativeBatteryPercentage_ShouldFailValidation()
    {
        // Arrange
        var request = new CreateVehicleRequest(
            Vin: "LC0C74C4XR1234567",
            Brand: "BYD",
            Model: "Seal",
            Version: "Premium",
            Year: 2024,
            Color: "White",
            BatteryCapacityKwh: 82.5m,
            BatteryLevelPercentage: -5,
            EstimatedRangeKm: 420,
            OdometerKm: 12.5m
        );

        // Act
        var result = _validator.Validate(request);

        // Assert
        result.IsValid.Should().BeFalse();
        result.Errors.Should().Contain(e => e.PropertyName == "BatteryLevelPercentage");
    }
}
