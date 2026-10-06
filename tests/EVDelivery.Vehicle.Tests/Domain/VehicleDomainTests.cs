using EVDelivery.Vehicle.Domain.Common;
using EVDelivery.Vehicle.Domain.Entities;
using EVDelivery.Vehicle.Domain.Enums;
using EVDelivery.Vehicle.Domain.ValueObjects;
using FluentAssertions;
using Xunit;
using VehicleEntity = EVDelivery.Vehicle.Domain.Entities.Vehicle;

namespace EVDelivery.Vehicle.Tests.Domain;

public class VehicleDomainTests
{
    private static VehicleEntity CreateTestVehicle(VehicleStatus status = VehicleStatus.ORDERED)
    {
        var vin = new Vin("LC0C74C4XR1234567");
        var battery = new BatteryInfo(82.5m, 80);
        return new VehicleEntity(
            vin,
            "BYD",
            "Seal",
            "Premium",
            2024,
            "White",
            battery,
            420,
            15.0m,
            initialStatus: status
        );
    }

    [Fact]
    public void Vin_WithValid17Characters_ShouldCreateSuccessfully()
    {
        // Arrange & Act
        var vin = new Vin("LC0C74C4XR1234567");

        // Assert
        vin.Value.Should().Be("LC0C74C4XR1234567");
    }

    [Theory]
    [InlineData("")]
    [InlineData("   ")]
    [InlineData("SHORTVIN")]
    [InlineData("TOOLONGVIN1234567890")]
    [InlineData("LC0C74C4XI1234567")] // Contains forbidden 'I'
    [InlineData("LC0C74C4XO1234567")] // Contains forbidden 'O'
    [InlineData("LC0C74C4XQ1234567")] // Contains forbidden 'Q'
    public void Vin_WithInvalidValue_ShouldThrowDomainException(string invalidVin)
    {
        // Act
        var act = () => new Vin(invalidVin);

        // Assert
        act.Should().Throw<DomainException>();
    }

    [Fact]
    public void BatteryInfo_WithValidValues_ShouldCreateSuccessfully()
    {
        // Arrange & Act
        var battery = new BatteryInfo(82.5m, 85);

        // Assert
        battery.CapacityKwh.Should().Be(82.5m);
        battery.LevelPercentage.Should().Be(85);
    }

    [Theory]
    [InlineData(0, 50)]
    [InlineData(-10, 50)]
    [InlineData(82.5, -1)]
    [InlineData(82.5, 101)]
    public void BatteryInfo_WithInvalidInvariants_ShouldThrowDomainException(decimal capacity, int percentage)
    {
        // Act
        var act = () => new BatteryInfo(capacity, percentage);

        // Assert
        act.Should().Throw<DomainException>();
    }

    [Fact]
    public void Vehicle_ValidLifecycleTransitions_ShouldSucceedAndRecordHistory()
    {
        // Arrange
        var vehicle = CreateTestVehicle(VehicleStatus.ORDERED);

        // Act & Assert each step
        vehicle.TransitionTo(VehicleStatus.VIN_ASSIGNED, "User1");
        vehicle.Status.Should().Be(VehicleStatus.VIN_ASSIGNED);

        vehicle.TransitionTo(VehicleStatus.IN_TRANSIT, "User1");
        vehicle.Status.Should().Be(VehicleStatus.IN_TRANSIT);

        vehicle.TransitionTo(VehicleStatus.RECEIVED, "User2");
        vehicle.Status.Should().Be(VehicleStatus.RECEIVED);

        vehicle.TransitionTo(VehicleStatus.INSPECTION, "User2");
        vehicle.Status.Should().Be(VehicleStatus.INSPECTION);

        vehicle.TransitionTo(VehicleStatus.PREPARATION, "User3");
        vehicle.Status.Should().Be(VehicleStatus.PREPARATION);

        vehicle.TransitionTo(VehicleStatus.READY_FOR_DELIVERY, "User3");
        vehicle.Status.Should().Be(VehicleStatus.READY_FOR_DELIVERY);

        vehicle.TransitionTo(VehicleStatus.DELIVERY_SCHEDULED, "User4");
        vehicle.Status.Should().Be(VehicleStatus.DELIVERY_SCHEDULED);

        vehicle.TransitionTo(VehicleStatus.DELIVERY_IN_PROGRESS, "User5");
        vehicle.Status.Should().Be(VehicleStatus.DELIVERY_IN_PROGRESS);

        vehicle.TransitionTo(VehicleStatus.DELIVERED, "User5");
        vehicle.Status.Should().Be(VehicleStatus.DELIVERED);

        vehicle.StatusHistory.Should().HaveCount(10); // initial + 9 transitions
    }

    [Fact]
    public void Vehicle_InvalidDirectJump_FromOrderedToDelivered_ShouldThrowDomainException()
    {
        // Arrange
        var vehicle = CreateTestVehicle(VehicleStatus.ORDERED);

        // Act
        var act = () => vehicle.TransitionTo(VehicleStatus.DELIVERED, "Hacker");

        // Assert
        act.Should().Throw<DomainException>()
            .WithMessage("*Invalid status transition*");
    }

    [Fact]
    public void Vehicle_TransitionFromDeliveredTerminalStatus_ShouldThrowDomainException()
    {
        // Arrange
        var vehicle = CreateTestVehicle(VehicleStatus.DELIVERY_IN_PROGRESS);
        vehicle.TransitionTo(VehicleStatus.DELIVERED, "User");

        // Act
        var act = () => vehicle.TransitionTo(VehicleStatus.DELIVERY_SCHEDULED, "User");

        // Assert
        act.Should().Throw<DomainException>()
            .WithMessage("*terminal*");
    }

    [Fact]
    public void Vehicle_DecreasingOdometer_ShouldThrowDomainException()
    {
        // Arrange
        var vehicle = CreateTestVehicle();
        vehicle.UpdateOdometer(50.0m);

        // Act
        var act = () => vehicle.UpdateOdometer(45.0m);

        // Assert
        act.Should().Throw<DomainException>()
            .WithMessage("*cannot be decreased*");
    }
}
