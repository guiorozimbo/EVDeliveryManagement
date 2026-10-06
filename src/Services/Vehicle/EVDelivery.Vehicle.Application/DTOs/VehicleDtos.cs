namespace EVDelivery.Vehicle.Application.DTOs;

public record VehicleDto(
    Guid Id,
    string Vin,
    string Brand,
    string Model,
    string Version,
    int Year,
    string Color,
    decimal BatteryCapacityKwh,
    int BatteryLevelPercentage,
    int EstimatedRangeKm,
    decimal OdometerKm,
    string? LicensePlate,
    string? Location,
    string? DeliveryCenter,
    string? ImageUrl,
    string Status,
    DateTimeOffset CreatedAt,
    DateTimeOffset UpdatedAt
);

public record VehicleHistoryDto(
    Guid Id,
    Guid VehicleId,
    string FromStatus,
    string ToStatus,
    DateTimeOffset ChangedAt,
    string ChangedBy,
    string? Notes
);

public record VehicleDetailDto(
    Guid Id,
    string Vin,
    string Brand,
    string Model,
    string Version,
    int Year,
    string Color,
    decimal BatteryCapacityKwh,
    int BatteryLevelPercentage,
    int EstimatedRangeKm,
    decimal OdometerKm,
    string? LicensePlate,
    string? Location,
    string? DeliveryCenter,
    string? ImageUrl,
    string Status,
    DateTimeOffset CreatedAt,
    DateTimeOffset UpdatedAt,
    IReadOnlyList<VehicleHistoryDto> History
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

public record CreateVehicleRequest(
    string Vin,
    string Brand,
    string Model,
    string Version,
    int Year,
    string Color,
    decimal BatteryCapacityKwh,
    int BatteryLevelPercentage,
    int EstimatedRangeKm,
    decimal OdometerKm,
    string? LicensePlate = null,
    string? Location = null,
    string? DeliveryCenter = null,
    string? ImageUrl = null,
    string? InitialStatus = null,
    string? CreatedBy = null
);

public record UpdateVehicleRequest(
    string Brand,
    string Model,
    string Version,
    int Year,
    string Color,
    int EstimatedRangeKm,
    string? LicensePlate = null,
    string? Location = null,
    string? DeliveryCenter = null,
    string? ImageUrl = null
);

public record UpdateVehicleStatusRequest(
    string NewStatus,
    string? Notes = null,
    string? ChangedBy = null
);

public record UpdateVehicleTelemetryRequest(
    int? BatteryLevelPercentage = null,
    decimal? OdometerKm = null
);
