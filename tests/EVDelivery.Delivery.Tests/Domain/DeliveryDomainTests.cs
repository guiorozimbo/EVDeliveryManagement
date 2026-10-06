using EVDelivery.Delivery.Domain.Common;
using EVDelivery.Delivery.Domain.Enums;
using FluentAssertions;
using Xunit;
using DeliveryEntity = EVDelivery.Delivery.Domain.Entities.Delivery;

namespace EVDelivery.Delivery.Tests.Domain;

public class DeliveryDomainTests
{
    private static DeliveryEntity CreateTestDelivery()
    {
        return new DeliveryEntity(
            vehicleId: Guid.NewGuid(),
            customerId: Guid.NewGuid(),
            deliveryCenterId: Guid.NewGuid(),
            deliveryCenterName: "São Paulo - SP Delivery Center",
            deliveryCenterAddress: "Av. Paulista, 1000",
            deliveryMethod: DeliveryMethod.PICKUP_SERVICE_CENTER
        );
    }

    [Fact]
    public void Delivery_InitialState_ShouldHaveEightChecklistItemsAndScheduledStatus()
    {
        // Act
        var delivery = CreateTestDelivery();

        // Assert
        delivery.Status.Should().Be(DeliveryStatus.SCHEDULED);
        delivery.Checklist.Should().HaveCount(8);
        delivery.Checklist.Count(c => c.IsMandatory).Should().Be(7);
        delivery.Checklist.Count(c => !c.IsMandatory).Should().Be(1); // Cleaning is non-mandatory
    }

    [Fact]
    public void UpdateChecklistItem_WithValidTechnician_ShouldCompleteItem()
    {
        // Arrange
        var delivery = CreateTestDelivery();
        var item = delivery.Checklist.First();

        // Act
        delivery.UpdateChecklistItem(item.Id, true, "João Silva", "Checked and verified.");

        // Assert
        item.Completed.Should().BeTrue();
        item.CompletedBy.Should().Be("João Silva");
        item.Notes.Should().Be("Checked and verified.");
        delivery.Status.Should().Be(DeliveryStatus.PREPARING);
    }

    [Fact]
    public void Start_WhenVehicleIsNotReadyForDelivery_ShouldThrowDomainException()
    {
        // Arrange
        var delivery = CreateTestDelivery();

        // Act - vehicle is still IN_TRANSIT
        var act = () => delivery.Start("IN_TRANSIT");

        // Assert
        act.Should().Throw<DomainException>()
            .WithMessage("*READY_FOR_DELIVERY*");
    }

    [Fact]
    public void Start_WhenVehicleIsReadyForDelivery_ShouldTransitionToInProgress()
    {
        // Arrange
        var delivery = CreateTestDelivery();

        // Act
        delivery.Start("READY_FOR_DELIVERY");

        // Assert
        delivery.Status.Should().Be(DeliveryStatus.IN_PROGRESS);
    }

    [Fact]
    public void Complete_WhenMandatoryChecklistIncomplete_ShouldThrowDomainException()
    {
        // Arrange
        var delivery = CreateTestDelivery();
        delivery.Start("READY_FOR_DELIVERY");

        // Act
        var act = () => delivery.Complete();

        // Assert
        act.Should().Throw<DomainException>()
            .WithMessage("*mandatory checklist items are incomplete*");
    }

    [Fact]
    public void Complete_WhenAllMandatoryItemsCompleted_ShouldSucceed()
    {
        // Arrange
        var delivery = CreateTestDelivery();
        delivery.Start("READY_FOR_DELIVERY");

        foreach (var item in delivery.Checklist.Where(c => c.IsMandatory))
        {
            delivery.UpdateChecklistItem(item.Id, true, "Technician");
        }

        // Act
        delivery.Complete();

        // Assert
        delivery.Status.Should().Be(DeliveryStatus.COMPLETED);
    }

    [Fact]
    public void CancelledDelivery_CannotBeCompleted()
    {
        // Arrange
        var delivery = CreateTestDelivery();
        delivery.Cancel("Customer cancelled reservation");

        // Act
        var act = () => delivery.Complete();

        // Assert
        act.Should().Throw<DomainException>()
            .WithMessage("*cancelled*");
    }

    [Fact]
    public void DeliveryWindow_WhenStartAfterEnd_ShouldThrowDomainException()
    {
        // Arrange
        var start = DateTimeOffset.UtcNow.AddDays(2);
        var end = DateTimeOffset.UtcNow.AddDays(1); // earlier than start

        // Act
        var act = () => new DeliveryEntity(
            Guid.NewGuid(),
            Guid.NewGuid(),
            Guid.NewGuid(),
            "Center",
            "Address",
            deliveryWindowStart: start,
            deliveryWindowEnd: end
        );

        // Assert
        act.Should().Throw<DomainException>()
            .WithMessage("*before DeliveryWindowEnd*");
    }
}
