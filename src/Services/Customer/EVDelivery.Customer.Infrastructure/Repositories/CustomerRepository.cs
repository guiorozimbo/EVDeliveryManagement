using EVDelivery.Customer.Domain.Repositories;
using EVDelivery.Customer.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;
using CustomerEntity = EVDelivery.Customer.Domain.Entities.Customer;

namespace EVDelivery.Customer.Infrastructure.Repositories;

public class CustomerRepository : ICustomerRepository
{
    private readonly CustomerDbContext _context;

    public CustomerRepository(CustomerDbContext context)
    {
        _context = context;
    }

    public async Task<CustomerEntity?> GetByIdAsync(Guid id, CancellationToken cancellationToken = default)
    {
        return await _context.Customers
            .FirstOrDefaultAsync(c => c.Id == id, cancellationToken);
    }

    public async Task<CustomerEntity?> GetByEmailAsync(string email, CancellationToken cancellationToken = default)
    {
        var normalizedEmail = email.Trim().ToLowerInvariant();
        return await _context.Customers
            .FirstOrDefaultAsync(c => (string)(object)c.Email == normalizedEmail, cancellationToken);
    }

    public async Task<bool> ExistsByEmailAsync(string email, CancellationToken cancellationToken = default)
    {
        var normalizedEmail = email.Trim().ToLowerInvariant();
        return await _context.Customers
            .AnyAsync(c => (string)(object)c.Email == normalizedEmail, cancellationToken);
    }

    public async Task<(IReadOnlyList<CustomerEntity> Items, int TotalCount)> GetPagedAsync(
        int page,
        int pageSize,
        string? search = null,
        string? sortBy = null,
        bool isAsc = true,
        CancellationToken cancellationToken = default)
    {
        var query = _context.Customers.AsNoTracking();

        if (!string.IsNullOrWhiteSpace(search))
        {
            var searchPattern = $"%{search.Trim().ToLowerInvariant()}%";
            query = query.Where(c =>
                EF.Functions.ILike(c.Name, searchPattern) ||
                EF.Functions.ILike((string)(object)c.Email, searchPattern) ||
                EF.Functions.ILike((string)(object)c.Phone, searchPattern) ||
                EF.Functions.ILike(c.Address.City, searchPattern));
        }

        var totalCount = await query.CountAsync(cancellationToken);

        query = sortBy?.ToLowerInvariant() switch
        {
            "name" => isAsc ? query.OrderBy(c => c.Name) : query.OrderByDescending(c => c.Name),
            "email" => isAsc ? query.OrderBy(c => (string)(object)c.Email) : query.OrderByDescending(c => (string)(object)c.Email),
            "city" => isAsc ? query.OrderBy(c => c.Address.City) : query.OrderByDescending(c => c.Address.City),
            "createdat" => isAsc ? query.OrderBy(c => c.CreatedAt) : query.OrderByDescending(c => c.CreatedAt),
            _ => query.OrderByDescending(c => c.CreatedAt)
        };

        var items = await query
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .ToListAsync(cancellationToken);

        return (items, totalCount);
    }

    public async Task AddAsync(CustomerEntity customer, CancellationToken cancellationToken = default)
    {
        await _context.Customers.AddAsync(customer, cancellationToken);
    }

    public Task UpdateAsync(CustomerEntity customer, CancellationToken cancellationToken = default)
    {
        _context.Customers.Update(customer);
        return Task.CompletedTask;
    }

    public Task DeleteAsync(CustomerEntity customer, CancellationToken cancellationToken = default)
    {
        _context.Customers.Remove(customer);
        return Task.CompletedTask;
    }

    public async Task SaveChangesAsync(CancellationToken cancellationToken = default)
    {
        await _context.SaveChangesAsync(cancellationToken);
    }
}
