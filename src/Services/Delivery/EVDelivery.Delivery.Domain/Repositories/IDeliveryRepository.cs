using EVDelivery.Delivery.Domain.Enums;
using DeliveryEntity = EVDelivery.Delivery.Domain.Entities.Delivery;

namespace EVDelivery.Delivery.Domain.Repositories;

public interface IDeliveryRepository
{
    Task<DeliveryEntity?> GetByIdAsync(Guid id, CancellationToken cancellationToken = default);
    Task<DeliveryEntity?> GetByVehicleIdAsync(Guid vehicleId, CancellationToken cancellationToken = default);
    Task<(IReadOnlyList<DeliveryEntity> Items, int TotalCount)> GetPagedAsync(
        int page,
        int pageSize,
        Guid? vehicleId = null,
        Guid? customerId = null,
        DeliveryStatus? status = null,
        string? sortBy = null,
        bool isAsc = true,
        CancellationToken cancellationToken = default);
    Task AddAsync(DeliveryEntity delivery, CancellationToken cancellationToken = default);
    Task UpdateAsync(DeliveryEntity delivery, CancellationToken cancellationToken = default);
    Task DeleteAsync(DeliveryEntity delivery, CancellationToken cancellationToken = default);
    Task SaveChangesAsync(CancellationToken cancellationToken = default);
}
