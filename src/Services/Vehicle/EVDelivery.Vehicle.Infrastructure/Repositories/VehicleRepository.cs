using EVDelivery.Vehicle.Domain.Enums;
using EVDelivery.Vehicle.Domain.Repositories;
using EVDelivery.Vehicle.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;
using VehicleEntity = EVDelivery.Vehicle.Domain.Entities.Vehicle;

namespace EVDelivery.Vehicle.Infrastructure.Repositories;

public class VehicleRepository : IVehicleRepository
{
    private readonly VehicleDbContext _context;

    public VehicleRepository(VehicleDbContext context)
    {
        _context = context;
    }

    public async Task<VehicleEntity?> GetByIdAsync(Guid id, CancellationToken cancellationToken = default)
    {
        return await _context.Vehicles
            .Include(v => v.StatusHistory)
            .FirstOrDefaultAsync(v => v.Id == id, cancellationToken);
    }

    public async Task<VehicleEntity?> GetByVinAsync(string vin, CancellationToken cancellationToken = default)
    {
        var normalizedVin = vin.Trim().ToUpperInvariant();
        return await _context.Vehicles
            .Include(v => v.StatusHistory)
            .FirstOrDefaultAsync(v => (string)(object)v.Vin == normalizedVin, cancellationToken);
    }

    public async Task<bool> ExistsByVinAsync(string vin, CancellationToken cancellationToken = default)
    {
        var normalizedVin = vin.Trim().ToUpperInvariant();
        return await _context.Vehicles
            .AnyAsync(v => (string)(object)v.Vin == normalizedVin, cancellationToken);
    }

    public async Task<(IReadOnlyList<VehicleEntity> Items, int TotalCount)> GetPagedAsync(
        int page,
        int pageSize,
        string? search = null,
        VehicleStatus? status = null,
        string? sortBy = null,
        bool isAsc = true,
        CancellationToken cancellationToken = default)
    {
        var query = _context.Vehicles.AsNoTracking();

        if (!string.IsNullOrWhiteSpace(search))
        {
            var searchPattern = $"%{search.Trim().ToLowerInvariant()}%";
            query = query.Where(v =>
                EF.Functions.ILike((string)(object)v.Vin, searchPattern) ||
                EF.Functions.ILike(v.Brand, searchPattern) ||
                EF.Functions.ILike(v.Model, searchPattern) ||
                (v.LicensePlate != null && EF.Functions.ILike(v.LicensePlate, searchPattern)));
        }

        if (status.HasValue)
        {
            query = query.Where(v => v.Status == status.Value);
        }

        var totalCount = await query.CountAsync(cancellationToken);

        query = sortBy?.ToLowerInvariant() switch
        {
            "brand" => isAsc ? query.OrderBy(v => v.Brand) : query.OrderByDescending(v => v.Brand),
            "model" => isAsc ? query.OrderBy(v => v.Model) : query.OrderByDescending(v => v.Model),
            "status" => isAsc ? query.OrderBy(v => v.Status) : query.OrderByDescending(v => v.Status),
            "year" => isAsc ? query.OrderBy(v => v.Year) : query.OrderByDescending(v => v.Year),
            "odometer" => isAsc ? query.OrderBy(v => v.OdometerKm) : query.OrderByDescending(v => v.OdometerKm),
            "createdat" => isAsc ? query.OrderBy(v => v.CreatedAt) : query.OrderByDescending(v => v.CreatedAt),
            _ => query.OrderByDescending(v => v.CreatedAt)
        };

        var items = await query
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .ToListAsync(cancellationToken);

        return (items, totalCount);
    }

    public async Task AddAsync(VehicleEntity vehicle, CancellationToken cancellationToken = default)
    {
        await _context.Vehicles.AddAsync(vehicle, cancellationToken);
    }

    public Task UpdateAsync(VehicleEntity vehicle, CancellationToken cancellationToken = default)
    {
        _context.Vehicles.Update(vehicle);
        return Task.CompletedTask;
    }

    public Task DeleteAsync(VehicleEntity vehicle, CancellationToken cancellationToken = default)
    {
        _context.Vehicles.Remove(vehicle);
        return Task.CompletedTask;
    }

    public async Task SaveChangesAsync(CancellationToken cancellationToken = default)
    {
        await _context.SaveChangesAsync(cancellationToken);
    }
}
