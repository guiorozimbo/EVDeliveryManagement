using EVDelivery.Vehicle.Domain.Common;
using EVDelivery.Vehicle.Domain.Enums;

namespace EVDelivery.Vehicle.Domain.Entities;

public class VehicleStatusHistory : Entity
{
    public Guid VehicleId { get; private set; }
    public VehicleStatus FromStatus { get; private set; }
    public VehicleStatus ToStatus { get; private set; }
    public DateTimeOffset ChangedAt { get; private set; }
    public string ChangedBy { get; private set; }
    public string? Notes { get; private set; }

    // Required by EF Core
    private VehicleStatusHistory() { ChangedBy = string.Empty; }

    public VehicleStatusHistory(Guid vehicleId, VehicleStatus fromStatus, VehicleStatus toStatus, string changedBy, string? notes = null)
    {
        VehicleId = vehicleId;
        FromStatus = fromStatus;
        ToStatus = toStatus;
        ChangedAt = DateTimeOffset.UtcNow;
        ChangedBy = string.IsNullOrWhiteSpace(changedBy) ? "System" : changedBy.Trim();
        Notes = notes?.Trim();
    }
}
