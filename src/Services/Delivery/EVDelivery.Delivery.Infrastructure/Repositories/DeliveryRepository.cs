using EVDelivery.Delivery.Domain.Enums;
using EVDelivery.Delivery.Domain.Repositories;
using EVDelivery.Delivery.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;
using DeliveryEntity = EVDelivery.Delivery.Domain.Entities.Delivery;

namespace EVDelivery.Delivery.Infrastructure.Repositories;

public class DeliveryRepository : IDeliveryRepository
{
    private readonly DeliveryDbContext _context;

    public DeliveryRepository(DeliveryDbContext context)
    {
        _context = context;
    }

    public async Task<DeliveryEntity?> GetByIdAsync(Guid id, CancellationToken cancellationToken = default)
    {
        return await _context.Deliveries
            .Include(d => d.Checklist)
            .FirstOrDefaultAsync(d => d.Id == id, cancellationToken);
    }

    public async Task<DeliveryEntity?> GetByVehicleIdAsync(Guid vehicleId, CancellationToken cancellationToken = default)
    {
        return await _context.Deliveries
            .Include(d => d.Checklist)
            .FirstOrDefaultAsync(d => d.VehicleId == vehicleId, cancellationToken);
    }

    public async Task<(IReadOnlyList<DeliveryEntity> Items, int TotalCount)> GetPagedAsync(
        int page,
        int pageSize,
        Guid? vehicleId = null,
        Guid? customerId = null,
        DeliveryStatus? status = null,
        string? sortBy = null,
        bool isAsc = true,
        CancellationToken cancellationToken = default)
    {
        var query = _context.Deliveries
            .Include(d => d.Checklist)
            .AsNoTracking();

        if (vehicleId.HasValue)
        {
            query = query.Where(d => d.VehicleId == vehicleId.Value);
        }

        if (customerId.HasValue)
        {
            query = query.Where(d => d.CustomerId == customerId.Value);
        }

        if (status.HasValue)
        {
            query = query.Where(d => d.Status == status.Value);
        }

        var totalCount = await query.CountAsync(cancellationToken);

        query = sortBy?.ToLowerInvariant() switch
        {
            "status" => isAsc ? query.OrderBy(d => d.Status) : query.OrderByDescending(d => d.Status),
            "appointment" => isAsc ? query.OrderBy(d => d.DeliveryAppointment) : query.OrderByDescending(d => d.DeliveryAppointment),
            "createdat" => isAsc ? query.OrderBy(d => d.CreatedAt) : query.OrderByDescending(d => d.CreatedAt),
            _ => query.OrderByDescending(d => d.CreatedAt)
        };

        var items = await query
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .ToListAsync(cancellationToken);

        return (items, totalCount);
    }

    public async Task AddAsync(DeliveryEntity delivery, CancellationToken cancellationToken = default)
    {
        await _context.Deliveries.AddAsync(delivery, cancellationToken);
    }

    public Task UpdateAsync(DeliveryEntity delivery, CancellationToken cancellationToken = default)
    {
        _context.Deliveries.Update(delivery);
        return Task.CompletedTask;
    }

    public Task DeleteAsync(DeliveryEntity delivery, CancellationToken cancellationToken = default)
    {
        _context.Deliveries.Remove(delivery);
        return Task.CompletedTask;
    }

    public async Task SaveChangesAsync(CancellationToken cancellationToken = default)
    {
        await _context.SaveChangesAsync(cancellationToken);
    }
}
