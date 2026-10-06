namespace EVDelivery.Delivery.Domain.Enums;

public enum DeliveryStatus
{
    SCHEDULED = 1,
    PREPARING = 2,
    READY = 3,
    IN_PROGRESS = 4,
    COMPLETED = 5,
    CANCELLED = 6
}

public enum DeliveryMethod
{
    PICKUP_SERVICE_CENTER = 1,
    HOME_DELIVERY = 2
}

public enum ChecklistType
{
    Battery = 1,
    Tires = 2,
    Lights = 3,
    Multimedia = 4,
    ADAS = 5,
    Accessories = 6,
    Documentation = 7,
    Cleaning = 8
}
