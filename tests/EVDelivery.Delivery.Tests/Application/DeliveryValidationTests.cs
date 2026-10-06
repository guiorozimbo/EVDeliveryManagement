using EVDelivery.Delivery.Application.DTOs;
using EVDelivery.Delivery.Application.Validators;
using FluentAssertions;
using Xunit;

namespace EVDelivery.Delivery.Tests.Application;

public class DeliveryValidationTests
{
    private readonly CreateDeliveryRequestValidator _validator = new();

    [Fact]
    public void ValidDeliveryRequest_ShouldPassValidation()
    {
        // Arrange
        var request = new CreateDeliveryRequest(
            VehicleId: Guid.NewGuid(),
            CustomerId: Guid.NewGuid(),
            DeliveryCenterId: Guid.NewGuid(),
            DeliveryCenterName: "São Paulo Hub",
            DeliveryMethod: "PICKUP_SERVICE_CENTER",
            DeliveryWindowStart: DateTimeOffset.UtcNow,
            DeliveryWindowEnd: DateTimeOffset.UtcNow.AddDays(2)
        );

        // Act
        var result = _validator.Validate(request);

        // Assert
        result.IsValid.Should().BeTrue();
    }

    [Fact]
    public void MissingVehicleId_ShouldFailValidation()
    {
        // Arrange
        var request = new CreateDeliveryRequest(
            VehicleId: Guid.Empty,
            CustomerId: Guid.NewGuid(),
            DeliveryCenterId: Guid.NewGuid(),
            DeliveryCenterName: "São Paulo Hub"
        );

        // Act
        var result = _validator.Validate(request);

        // Assert
        result.IsValid.Should().BeFalse();
        result.Errors.Should().Contain(e => e.PropertyName == "VehicleId");
    }

    [Fact]
    public void InvalidDeliveryMethod_ShouldFailValidation()
    {
        // Arrange
        var request = new CreateDeliveryRequest(
            VehicleId: Guid.NewGuid(),
            CustomerId: Guid.NewGuid(),
            DeliveryCenterId: Guid.NewGuid(),
            DeliveryCenterName: "São Paulo Hub",
            DeliveryMethod: "TELEPORTATION"
        );

        // Act
        var result = _validator.Validate(request);

        // Assert
        result.IsValid.Should().BeFalse();
        result.Errors.Should().Contain(e => e.PropertyName == "DeliveryMethod");
    }
}
