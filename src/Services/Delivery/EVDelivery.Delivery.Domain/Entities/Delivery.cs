using EVDelivery.Delivery.Domain.Common;
using EVDelivery.Delivery.Domain.Entities;
using EVDelivery.Delivery.Domain.Enums;

namespace EVDelivery.Delivery.Domain.Entities;

public class Delivery : Entity, IAggregateRoot
{
    private readonly List<DeliveryChecklistItem> _checklist = new();

    public Guid VehicleId { get; private set; }
    public Guid CustomerId { get; private set; }
    public Guid DeliveryCenterId { get; private set; }
    public string DeliveryCenterName { get; private set; }
    public string DeliveryCenterAddress { get; private set; }
    public DateTimeOffset? DeliveryAppointment { get; private set; }
    public DateTimeOffset? DeliveryWindowStart { get; private set; }
    public DateTimeOffset? DeliveryWindowEnd { get; private set; }
    public DeliveryMethod DeliveryMethod { get; private set; }
    public DeliveryStatus Status { get; private set; }
    public string? Notes { get; private set; }
    public DateTimeOffset CreatedAt { get; private set; }
    public DateTimeOffset UpdatedAt { get; private set; }

    public IReadOnlyCollection<DeliveryChecklistItem> Checklist => _checklist.AsReadOnly();

    // Required by EF Core
    private Delivery()
    {
        DeliveryCenterName = string.Empty;
        DeliveryCenterAddress = string.Empty;
    }

    public Delivery(
        Guid vehicleId,
        Guid customerId,
        Guid deliveryCenterId,
        string deliveryCenterName,
        string deliveryCenterAddress,
        DeliveryMethod deliveryMethod = DeliveryMethod.PICKUP_SERVICE_CENTER,
        DateTimeOffset? deliveryWindowStart = null,
        DateTimeOffset? deliveryWindowEnd = null,
        DateTimeOffset? deliveryAppointment = null,
        string? notes = null)
    {
        if (vehicleId == Guid.Empty) throw new DomainException("VehicleId is required.");
        if (customerId == Guid.Empty) throw new DomainException("CustomerId is required.");
        if (string.IsNullOrWhiteSpace(deliveryCenterName)) throw new DomainException("Delivery center name is required.");

        if (deliveryWindowStart.HasValue && deliveryWindowEnd.HasValue && deliveryWindowStart.Value > deliveryWindowEnd.Value)
            throw new DomainException("DeliveryWindowStart must be before DeliveryWindowEnd.");

        VehicleId = vehicleId;
        CustomerId = customerId;
        DeliveryCenterId = deliveryCenterId;
        DeliveryCenterName = deliveryCenterName.Trim();
        DeliveryCenterAddress = string.IsNullOrWhiteSpace(deliveryCenterAddress) ? "Service Center Hub" : deliveryCenterAddress.Trim();
        DeliveryMethod = deliveryMethod;
        DeliveryWindowStart = deliveryWindowStart;
        DeliveryWindowEnd = deliveryWindowEnd;
        DeliveryAppointment = deliveryAppointment;
        Status = DeliveryStatus.SCHEDULED;
        Notes = notes?.Trim();
        CreatedAt = DateTimeOffset.UtcNow;
        UpdatedAt = DateTimeOffset.UtcNow;

        InitializeChecklist();
    }

    private void InitializeChecklist()
    {
        _checklist.Add(new DeliveryChecklistItem(Id, ChecklistType.Battery, isMandatory: true));
        _checklist.Add(new DeliveryChecklistItem(Id, ChecklistType.Tires, isMandatory: true));
        _checklist.Add(new DeliveryChecklistItem(Id, ChecklistType.Lights, isMandatory: true));
        _checklist.Add(new DeliveryChecklistItem(Id, ChecklistType.Multimedia, isMandatory: true));
        _checklist.Add(new DeliveryChecklistItem(Id, ChecklistType.ADAS, isMandatory: true));
        _checklist.Add(new DeliveryChecklistItem(Id, ChecklistType.Accessories, isMandatory: true));
        _checklist.Add(new DeliveryChecklistItem(Id, ChecklistType.Documentation, isMandatory: true));
        _checklist.Add(new DeliveryChecklistItem(Id, ChecklistType.Cleaning, isMandatory: false));
    }

    public void Schedule(DateTimeOffset appointmentTime, DateTimeOffset? windowStart = null, DateTimeOffset? windowEnd = null)
    {
        if (Status == DeliveryStatus.COMPLETED)
            throw new DomainException("A completed delivery cannot be rescheduled.");

        if (Status == DeliveryStatus.CANCELLED)
            throw new DomainException("A cancelled delivery cannot be rescheduled.");

        if (windowStart.HasValue && windowEnd.HasValue && windowStart.Value > windowEnd.Value)
            throw new DomainException("DeliveryWindowStart must be before DeliveryWindowEnd.");

        DeliveryAppointment = appointmentTime;
        if (windowStart.HasValue) DeliveryWindowStart = windowStart;
        if (windowEnd.HasValue) DeliveryWindowEnd = windowEnd;

        UpdatedAt = DateTimeOffset.UtcNow;
    }

    public void UpdateChecklistItem(Guid itemId, bool completed, string technician, string? notes = null)
    {
        if (Status == DeliveryStatus.COMPLETED)
            throw new DomainException("Cannot modify checklist on a completed delivery.");

        if (Status == DeliveryStatus.CANCELLED)
            throw new DomainException("Cannot modify checklist on a cancelled delivery.");

        var item = _checklist.FirstOrDefault(c => c.Id == itemId)
            ?? throw new DomainException($"Checklist item with ID '{itemId}' not found on this delivery.");

        if (completed)
        {
            item.MarkCompleted(technician, notes);
        }
        else
        {
            item.MarkPending(technician, notes);
        }

        // If at least one item completed, status becomes PREPARING (if still SCHEDULED)
        if (_checklist.Any(c => c.Completed) && Status == DeliveryStatus.SCHEDULED)
        {
            Status = DeliveryStatus.PREPARING;
        }

        // If all mandatory items completed, status becomes READY (if PREPARING)
        if (AreMandatoryItemsCompleted() && Status == DeliveryStatus.PREPARING)
        {
            Status = DeliveryStatus.READY;
        }

        UpdatedAt = DateTimeOffset.UtcNow;
    }

    public void Start(string vehicleStatus)
    {
        if (Status == DeliveryStatus.COMPLETED)
            throw new DomainException("Cannot start a delivery that has already been COMPLETED.");

        if (Status == DeliveryStatus.CANCELLED)
            throw new DomainException("Cannot start a delivery that has been CANCELLED.");

        if (Status == DeliveryStatus.IN_PROGRESS)
            throw new DomainException("Delivery is already in progress.");

        var normalizedStatus = vehicleStatus.Trim().ToUpperInvariant();
        if (normalizedStatus != "READY_FOR_DELIVERY")
            throw new DomainException($"Cannot start delivery: Vehicle is currently in status '{vehicleStatus}'. Vehicle must be 'READY_FOR_DELIVERY' before starting delivery handover.");

        Status = DeliveryStatus.IN_PROGRESS;
        UpdatedAt = DateTimeOffset.UtcNow;
    }

    public void Complete()
    {
        if (Status == DeliveryStatus.COMPLETED)
            throw new DomainException("Delivery is already completed.");

        if (Status == DeliveryStatus.CANCELLED)
            throw new DomainException("A cancelled delivery cannot be completed.");

        var pendingMandatory = _checklist.Where(c => c.IsMandatory && !c.Completed).ToList();
        if (pendingMandatory.Any())
        {
            var missing = string.Join(", ", pendingMandatory.Select(c => c.Type.ToString()));
            throw new DomainException($"Cannot complete delivery: mandatory checklist items are incomplete ({missing}).");
        }

        Status = DeliveryStatus.COMPLETED;
        UpdatedAt = DateTimeOffset.UtcNow;
    }

    public void Cancel(string reason)
    {
        if (Status == DeliveryStatus.COMPLETED)
            throw new DomainException("A completed delivery cannot be cancelled.");

        Status = DeliveryStatus.CANCELLED;
        Notes = string.IsNullOrWhiteSpace(Notes) ? $"Cancelled: {reason}" : $"{Notes} | Cancelled: {reason}";
        UpdatedAt = DateTimeOffset.UtcNow;
    }

    public bool AreMandatoryItemsCompleted()
    {
        return _checklist.Where(c => c.IsMandatory).All(c => c.Completed);
    }
}
