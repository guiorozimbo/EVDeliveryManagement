using CustomerEntity = EVDelivery.Customer.Domain.Entities.Customer;

namespace EVDelivery.Customer.Domain.Repositories;

public interface ICustomerRepository
{
    Task<CustomerEntity?> GetByIdAsync(Guid id, CancellationToken cancellationToken = default);
    Task<CustomerEntity?> GetByEmailAsync(string email, CancellationToken cancellationToken = default);
    Task<bool> ExistsByEmailAsync(string email, CancellationToken cancellationToken = default);
    Task<(IReadOnlyList<CustomerEntity> Items, int TotalCount)> GetPagedAsync(
        int page,
        int pageSize,
        string? search = null,
        string? sortBy = null,
        bool isAsc = true,
        CancellationToken cancellationToken = default);
    Task AddAsync(CustomerEntity customer, CancellationToken cancellationToken = default);
    Task UpdateAsync(CustomerEntity customer, CancellationToken cancellationToken = default);
    Task DeleteAsync(CustomerEntity customer, CancellationToken cancellationToken = default);
    Task SaveChangesAsync(CancellationToken cancellationToken = default);
}
