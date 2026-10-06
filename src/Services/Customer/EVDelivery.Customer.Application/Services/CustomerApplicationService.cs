using EVDelivery.Customer.Application.DTOs;
using EVDelivery.Customer.Domain.Common;
using EVDelivery.Customer.Domain.Repositories;
using EVDelivery.Customer.Domain.ValueObjects;
using FluentValidation;
using Microsoft.Extensions.Logging;
using CustomerEntity = EVDelivery.Customer.Domain.Entities.Customer;

namespace EVDelivery.Customer.Application.Services;

public interface ICustomerApplicationService
{
    Task<PagedResult<CustomerDto>> GetPagedAsync(
        int page = 1,
        int pageSize = 10,
        string? search = null,
        string? sortBy = null,
        bool isAsc = true,
        CancellationToken cancellationToken = default);

    Task<CustomerDto?> GetByIdAsync(Guid id, CancellationToken cancellationToken = default);
    Task<CustomerDto?> GetByEmailAsync(string email, CancellationToken cancellationToken = default);
    Task<CustomerDto> CreateAsync(CreateCustomerRequest request, CancellationToken cancellationToken = default);
    Task<CustomerDto> UpdateAsync(Guid id, UpdateCustomerRequest request, CancellationToken cancellationToken = default);
    Task<bool> DeleteAsync(Guid id, CancellationToken cancellationToken = default);
}

public class CustomerApplicationService : ICustomerApplicationService
{
    private readonly ICustomerRepository _repository;
    private readonly IValidator<CreateCustomerRequest> _createValidator;
    private readonly IValidator<UpdateCustomerRequest> _updateValidator;
    private readonly ILogger<CustomerApplicationService> _logger;

    public CustomerApplicationService(
        ICustomerRepository repository,
        IValidator<CreateCustomerRequest> createValidator,
        IValidator<UpdateCustomerRequest> updateValidator,
        ILogger<CustomerApplicationService> logger)
    {
        _repository = repository;
        _createValidator = createValidator;
        _updateValidator = updateValidator;
        _logger = logger;
    }

    public async Task<PagedResult<CustomerDto>> GetPagedAsync(
        int page = 1,
        int pageSize = 10,
        string? search = null,
        string? sortBy = null,
        bool isAsc = true,
        CancellationToken cancellationToken = default)
    {
        page = Math.Max(1, page);
        pageSize = Math.Clamp(pageSize, 1, 100);

        var (items, totalCount) = await _repository.GetPagedAsync(page, pageSize, search, sortBy, isAsc, cancellationToken);
        var dtos = items.Select(MapToDto).ToList();

        return new PagedResult<CustomerDto>(dtos, totalCount, page, pageSize);
    }

    public async Task<CustomerDto?> GetByIdAsync(Guid id, CancellationToken cancellationToken = default)
    {
        var customer = await _repository.GetByIdAsync(id, cancellationToken);
        return customer == null ? null : MapToDto(customer);
    }

    public async Task<CustomerDto?> GetByEmailAsync(string email, CancellationToken cancellationToken = default)
    {
        var customer = await _repository.GetByEmailAsync(email, cancellationToken);
        return customer == null ? null : MapToDto(customer);
    }

    public async Task<CustomerDto> CreateAsync(CreateCustomerRequest request, CancellationToken cancellationToken = default)
    {
        var validationResult = await _createValidator.ValidateAsync(request, cancellationToken);
        if (!validationResult.IsValid)
            throw new ValidationException(validationResult.Errors);

        if (await _repository.ExistsByEmailAsync(request.Email, cancellationToken))
            throw new DomainException($"A customer with email '{request.Email}' already exists.");

        var email = new EmailAddress(request.Email);
        var phone = new PhoneNumber(request.Phone);
        var address = new Address(request.Street, request.City, request.State, request.PostalCode, request.Country);

        var customer = new CustomerEntity(
            request.Name,
            email,
            phone,
            address,
            request.DocumentNumber
        );

        await _repository.AddAsync(customer, cancellationToken);
        await _repository.SaveChangesAsync(cancellationToken);

        _logger.LogInformation("Customer registered successfully: {Name} (Email: {Email}, Id: {Id})",
            customer.Name, customer.Email.Value, customer.Id);

        return MapToDto(customer);
    }

    public async Task<CustomerDto> UpdateAsync(Guid id, UpdateCustomerRequest request, CancellationToken cancellationToken = default)
    {
        var validationResult = await _updateValidator.ValidateAsync(request, cancellationToken);
        if (!validationResult.IsValid)
            throw new ValidationException(validationResult.Errors);

        var customer = await _repository.GetByIdAsync(id, cancellationToken)
            ?? throw new KeyNotFoundException($"Customer with Id '{id}' was not found.");

        var email = new EmailAddress(request.Email);
        var phone = new PhoneNumber(request.Phone);
        var address = new Address(request.Street, request.City, request.State, request.PostalCode, request.Country);

        customer.UpdateProfile(request.Name, request.DocumentNumber);
        customer.UpdateContact(email, phone);
        customer.UpdateAddress(address);

        await _repository.UpdateAsync(customer, cancellationToken);
        await _repository.SaveChangesAsync(cancellationToken);

        _logger.LogInformation("Customer updated successfully: {Id}", customer.Id);

        return MapToDto(customer);
    }

    public async Task<bool> DeleteAsync(Guid id, CancellationToken cancellationToken = default)
    {
        var customer = await _repository.GetByIdAsync(id, cancellationToken);
        if (customer == null) return false;

        await _repository.DeleteAsync(customer, cancellationToken);
        await _repository.SaveChangesAsync(cancellationToken);

        _logger.LogInformation("Customer deleted successfully: {Id}", id);
        return true;
    }

    private static CustomerDto MapToDto(CustomerEntity customer)
    {
        return new CustomerDto(
            customer.Id,
            customer.Name,
            customer.Email.Value,
            customer.Phone.Value,
            customer.Address.Street,
            customer.Address.City,
            customer.Address.State,
            customer.Address.PostalCode,
            customer.Address.Country ?? "Brazil",
            customer.DocumentNumber,
            customer.CreatedAt,
            customer.UpdatedAt
        );
    }
}
