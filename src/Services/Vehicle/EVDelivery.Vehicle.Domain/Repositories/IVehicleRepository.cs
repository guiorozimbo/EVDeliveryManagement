using EVDelivery.Vehicle.Domain.Enums;
using VehicleEntity = EVDelivery.Vehicle.Domain.Entities.Vehicle;

namespace EVDelivery.Vehicle.Domain.Repositories;

public interface IVehicleRepository
{
    Task<VehicleEntity?> GetByIdAsync(Guid id, CancellationToken cancellationToken = default);
    Task<VehicleEntity?> GetByVinAsync(string vin, CancellationToken cancellationToken = default);
    Task<bool> ExistsByVinAsync(string vin, CancellationToken cancellationToken = default);
    Task<(IReadOnlyList<VehicleEntity> Items, int TotalCount)> GetPagedAsync(
        int page,
        int pageSize,
        string? search = null,
        VehicleStatus? status = null,
        string? sortBy = null,
        bool isAsc = true,
        CancellationToken cancellationToken = default);
    Task AddAsync(VehicleEntity vehicle, CancellationToken cancellationToken = default);
    Task UpdateAsync(VehicleEntity vehicle, CancellationToken cancellationToken = default);
    Task DeleteAsync(VehicleEntity vehicle, CancellationToken cancellationToken = default);
    Task SaveChangesAsync(CancellationToken cancellationToken = default);
}
