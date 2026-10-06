using EVDelivery.Vehicle.Domain.Common;
using EVDelivery.Vehicle.Domain.Entities;
using EVDelivery.Vehicle.Domain.Enums;
using EVDelivery.Vehicle.Domain.ValueObjects;

namespace EVDelivery.Vehicle.Domain.Entities;

public class Vehicle : Entity, IAggregateRoot
{
    private readonly List<VehicleStatusHistory> _statusHistory = new();

    public Vin Vin { get; private set; }
    public string Brand { get; private set; }
    public string Model { get; private set; }
    public string Version { get; private set; }
    public int Year { get; private set; }
    public string Color { get; private set; }
    public BatteryInfo Battery { get; private set; }
    public int EstimatedRangeKm { get; private set; }
    public decimal OdometerKm { get; private set; }
    public string? LicensePlate { get; private set; }
    public string? Location { get; private set; }
    public string? DeliveryCenter { get; private set; }
    public string? ImageUrl { get; private set; }
    public VehicleStatus Status { get; private set; }
    public DateTimeOffset CreatedAt { get; private set; }
    public DateTimeOffset UpdatedAt { get; private set; }

    public IReadOnlyCollection<VehicleStatusHistory> StatusHistory => _statusHistory.AsReadOnly();

    // Required by EF Core
    private Vehicle()
    {
        Vin = null!;
        Brand = string.Empty;
        Model = string.Empty;
        Version = string.Empty;
        Color = string.Empty;
        Battery = null!;
    }

    public Vehicle(
        Vin vin,
        string brand,
        string model,
        string version,
        int year,
        string color,
        BatteryInfo battery,
        int estimatedRangeKm,
        decimal odometerKm,
        string? licensePlate = null,
        string? location = null,
        string? deliveryCenter = null,
        string? imageUrl = null,
        VehicleStatus initialStatus = VehicleStatus.ORDERED,
        string createdBy = "System",
        Guid? id = null) : base(id)
    {
        if (string.IsNullOrWhiteSpace(brand))
            throw new DomainException("Vehicle brand cannot be empty.");

        if (string.IsNullOrWhiteSpace(model))
            throw new DomainException("Vehicle model cannot be empty.");

        if (year < 2000 || year > DateTimeOffset.UtcNow.Year + 2)
            throw new DomainException($"Invalid vehicle model year: {year}.");

        if (estimatedRangeKm < 0)
            throw new DomainException($"Estimated range cannot be negative: {estimatedRangeKm} km.");

        if (odometerKm < 0)
            throw new DomainException($"Odometer reading cannot be negative: {odometerKm} km.");

        Vin = vin ?? throw new ArgumentNullException(nameof(vin));
        Brand = brand.Trim();
        Model = model.Trim();
        Version = string.IsNullOrWhiteSpace(version) ? "Standard" : version.Trim();
        Year = year;
        Color = string.IsNullOrWhiteSpace(color) ? "White" : color.Trim();
        Battery = battery ?? throw new ArgumentNullException(nameof(battery));
        EstimatedRangeKm = estimatedRangeKm;
        OdometerKm = odometerKm;
        LicensePlate = licensePlate?.Trim();
        Location = location?.Trim() ?? "Central Distribution Hub";
        DeliveryCenter = deliveryCenter?.Trim() ?? "Main Delivery Center";
        ImageUrl = imageUrl?.Trim();
        Status = initialStatus;
        CreatedAt = DateTimeOffset.UtcNow;
        UpdatedAt = DateTimeOffset.UtcNow;

        _statusHistory.Add(new VehicleStatusHistory(Id, initialStatus, initialStatus, createdBy, "Initial vehicle order recorded."));
    }

    public void TransitionTo(VehicleStatus newStatus, string changedBy, string? notes = null)
    {
        if (Status == VehicleStatus.DELIVERED)
            throw new DomainException("Cannot transition a vehicle that has already been DELIVERED. Delivered status is terminal.");

        if (Status == newStatus)
            throw new DomainException($"Vehicle is already in status '{Status}'.");

        if (!IsValidTransition(Status, newStatus))
            throw new DomainException($"Invalid status transition from '{Status}' to '{newStatus}'. Status progression must follow defined delivery lifecycle.");

        var oldStatus = Status;
        Status = newStatus;
        UpdatedAt = DateTimeOffset.UtcNow;

        _statusHistory.Add(new VehicleStatusHistory(Id, oldStatus, newStatus, changedBy, notes));
    }

    public void UpdateBattery(int newLevelPercentage)
    {
        Battery = Battery.UpdateLevel(newLevelPercentage);
        UpdatedAt = DateTimeOffset.UtcNow;
    }

    public void UpdateOdometer(decimal newOdometerKm)
    {
        if (newOdometerKm < OdometerKm)
            throw new DomainException($"Odometer reading ({newOdometerKm} km) cannot be decreased from previous reading ({OdometerKm} km).");

        OdometerKm = newOdometerKm;
        UpdatedAt = DateTimeOffset.UtcNow;
    }

    public void UpdateDetails(
        string brand,
        string model,
        string version,
        int year,
        string color,
        int estimatedRangeKm,
        string? licensePlate,
        string? location,
        string? deliveryCenter,
        string? imageUrl)
    {
        if (string.IsNullOrWhiteSpace(brand)) throw new DomainException("Brand is required.");
        if (string.IsNullOrWhiteSpace(model)) throw new DomainException("Model is required.");
        if (year < 2000) throw new DomainException("Year must be valid.");
        if (estimatedRangeKm < 0) throw new DomainException("Estimated range cannot be negative.");

        Brand = brand.Trim();
        Model = model.Trim();
        Version = version.Trim();
        Year = year;
        Color = color.Trim();
        EstimatedRangeKm = estimatedRangeKm;
        LicensePlate = licensePlate?.Trim();
        Location = location?.Trim();
        DeliveryCenter = deliveryCenter?.Trim();
        if (!string.IsNullOrWhiteSpace(imageUrl))
            ImageUrl = imageUrl.Trim();
        UpdatedAt = DateTimeOffset.UtcNow;
    }

    private static bool IsValidTransition(VehicleStatus current, VehicleStatus next)
    {
        return (current, next) switch
        {
            // Sequential forward progression
            (VehicleStatus.ORDERED, VehicleStatus.VIN_ASSIGNED) => true,
            (VehicleStatus.VIN_ASSIGNED, VehicleStatus.IN_TRANSIT) => true,
            (VehicleStatus.IN_TRANSIT, VehicleStatus.RECEIVED) => true,
            (VehicleStatus.RECEIVED, VehicleStatus.INSPECTION) => true,
            (VehicleStatus.INSPECTION, VehicleStatus.PREPARATION) => true,
            (VehicleStatus.PREPARATION, VehicleStatus.READY_FOR_DELIVERY) => true,
            (VehicleStatus.READY_FOR_DELIVERY, VehicleStatus.DELIVERY_SCHEDULED) => true,
            (VehicleStatus.DELIVERY_SCHEDULED, VehicleStatus.DELIVERY_IN_PROGRESS) => true,
            (VehicleStatus.DELIVERY_IN_PROGRESS, VehicleStatus.DELIVERED) => true,

            // Allowed operational adjustments
            (VehicleStatus.PREPARATION, VehicleStatus.INSPECTION) => true, // re-inspection needed
            (VehicleStatus.DELIVERY_SCHEDULED, VehicleStatus.READY_FOR_DELIVERY) => true, // appointment rescheduled
            (VehicleStatus.DELIVERY_IN_PROGRESS, VehicleStatus.DELIVERY_SCHEDULED) => true, // delivery attempt postponed

            _ => false
        };
    }
}
