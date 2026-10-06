namespace EVDelivery.Vehicle.Domain.Enums;

public enum VehicleStatus
{
    ORDERED = 1,
    VIN_ASSIGNED = 2,
    IN_TRANSIT = 3,
    RECEIVED = 4,
    INSPECTION = 5,
    PREPARATION = 6,
    READY_FOR_DELIVERY = 7,
    DELIVERY_SCHEDULED = 8,
    DELIVERY_IN_PROGRESS = 9,
    DELIVERED = 10
}
