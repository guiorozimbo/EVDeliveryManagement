namespace EVDelivery.Customer.Application.DTOs;

public record CustomerDto(
    Guid Id,
    string Name,
    string Email,
    string Phone,
    string Street,
    string City,
    string State,
    string PostalCode,
    string Country,
    string? DocumentNumber,
    DateTimeOffset CreatedAt,
    DateTimeOffset UpdatedAt
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

public record CreateCustomerRequest(
    string Name,
    string Email,
    string Phone,
    string Street,
    string City,
    string State,
    string PostalCode,
    string? Country = "Brazil",
    string? DocumentNumber = null
);

public record UpdateCustomerRequest(
    string Name,
    string Email,
    string Phone,
    string Street,
    string City,
    string State,
    string PostalCode,
    string? Country = "Brazil",
    string? DocumentNumber = null
);
