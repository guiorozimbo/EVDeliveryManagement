namespace EVDelivery.Delivery.Application.DTOs;

public record ChecklistSummaryDto(
    int TotalItems,
    int CompletedItems,
    int MandatoryItems,
    int CompletedMandatoryItems,
    bool AreMandatoryCompleted
);

public record DeliveryChecklistItemDto(
    Guid Id,
    Guid DeliveryId,
    string Type,
    bool Completed,
    DateTimeOffset? CompletedAt,
    string? CompletedBy,
    string? Notes,
    bool IsMandatory
);

public record DeliveryDto(
    Guid Id,
    Guid VehicleId,
    Guid CustomerId,
    Guid DeliveryCenterId,
    string DeliveryCenterName,
    string DeliveryCenterAddress,
    DateTimeOffset? DeliveryAppointment,
    DateTimeOffset? DeliveryWindowStart,
    DateTimeOffset? DeliveryWindowEnd,
    string DeliveryMethod,
    string Status,
    string? Notes,
    DateTimeOffset CreatedAt,
    DateTimeOffset UpdatedAt,
    ChecklistSummaryDto ChecklistSummary
);

public record DeliveryDetailDto(
    Guid Id,
    Guid VehicleId,
    Guid CustomerId,
    Guid DeliveryCenterId,
    string DeliveryCenterName,
    string DeliveryCenterAddress,
    DateTimeOffset? DeliveryAppointment,
    DateTimeOffset? DeliveryWindowStart,
    DateTimeOffset? DeliveryWindowEnd,
    string DeliveryMethod,
    string Status,
    string? Notes,
    DateTimeOffset CreatedAt,
    DateTimeOffset UpdatedAt,
    ChecklistSummaryDto ChecklistSummary,
    IReadOnlyList<DeliveryChecklistItemDto> Checklist
);

public record PagedResult<T>(
    IReadOnlyList<T> Items,
    int TotalCount,
    int Page,
    int PageSize)
{
    public int TotalPages => (int)Math.Ceiling((double)TotalCount / PageSize);
    public bool HasPreviousPage => Page > 1;
    public bool HasNextPage => Page < TotalPages;
}

public record CreateDeliveryRequest(
    Guid VehicleId,
    Guid CustomerId,
    Guid DeliveryCenterId,
    string DeliveryCenterName,
    string? DeliveryCenterAddress = null,
    string? DeliveryMethod = "PICKUP_SERVICE_CENTER",
    DateTimeOffset? DeliveryWindowStart = null,
    DateTimeOffset? DeliveryWindowEnd = null,
    DateTimeOffset? DeliveryAppointment = null,
    string? Notes = null
);

public record ScheduleDeliveryRequest(
    DateTimeOffset AppointmentTime,
    DateTimeOffset? WindowStart = null,
    DateTimeOffset? WindowEnd = null
);

public record UpdateChecklistItemRequest(
    bool Completed,
    string Technician,
    string? Notes = null
);

public record StartDeliveryRequest(
    string? StartedBy = null,
    string? VehicleStatus = "READY_FOR_DELIVERY"
);

public record CancelDeliveryRequest(
    string Reason
);
