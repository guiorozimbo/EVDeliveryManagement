using EVDelivery.Customer.Domain.Common;
using EVDelivery.Customer.Domain.ValueObjects;

namespace EVDelivery.Customer.Domain.Entities;

public class Customer : Entity, IAggregateRoot
{
    public string Name { get; private set; }
    public EmailAddress Email { get; private set; }
    public PhoneNumber Phone { get; private set; }
    public Address Address { get; private set; }
    public string? DocumentNumber { get; private set; }
    public DateTimeOffset CreatedAt { get; private set; }
    public DateTimeOffset UpdatedAt { get; private set; }

    // Required by EF Core
    private Customer()
    {
        Name = string.Empty;
        Email = null!;
        Phone = null!;
        Address = null!;
    }

    public Customer(
        string name,
        EmailAddress email,
        PhoneNumber phone,
        Address address,
        string? documentNumber = null)
    {
        if (string.IsNullOrWhiteSpace(name))
            throw new DomainException("Customer name cannot be empty.");

        if (name.Trim().Length < 2)
            throw new DomainException("Customer name must be at least 2 characters long.");

        Name = name.Trim();
        Email = email ?? throw new ArgumentNullException(nameof(email));
        Phone = phone ?? throw new ArgumentNullException(nameof(phone));
        Address = address ?? throw new ArgumentNullException(nameof(address));
        DocumentNumber = documentNumber?.Trim();
        CreatedAt = DateTimeOffset.UtcNow;
        UpdatedAt = DateTimeOffset.UtcNow;
    }

    public void UpdateProfile(string name, string? documentNumber = null)
    {
        if (string.IsNullOrWhiteSpace(name))
            throw new DomainException("Customer name cannot be empty.");

        Name = name.Trim();
        DocumentNumber = documentNumber?.Trim();
        UpdatedAt = DateTimeOffset.UtcNow;
    }

    public void UpdateContact(EmailAddress email, PhoneNumber phone)
    {
        Email = email ?? throw new ArgumentNullException(nameof(email));
        Phone = phone ?? throw new ArgumentNullException(nameof(phone));
        UpdatedAt = DateTimeOffset.UtcNow;
    }

    public void UpdateAddress(Address address)
    {
        Address = address ?? throw new ArgumentNullException(nameof(address));
        UpdatedAt = DateTimeOffset.UtcNow;
    }
}
