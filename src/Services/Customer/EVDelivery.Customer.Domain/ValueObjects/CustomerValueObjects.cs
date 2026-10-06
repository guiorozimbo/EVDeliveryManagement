using System.Text.RegularExpressions;
using EVDelivery.Customer.Domain.Common;

namespace EVDelivery.Customer.Domain.ValueObjects;

public sealed class EmailAddress : ValueObject
{
    private static readonly Regex EmailRegex = new(
        @"^[^@\s]+@[^@\s]+\.[^@\s]+$",
        RegexOptions.Compiled | RegexOptions.IgnoreCase);

    public string Value { get; }

    public EmailAddress(string value)
    {
        if (string.IsNullOrWhiteSpace(value))
            throw new DomainException("Email address cannot be empty.");

        var trimmed = value.Trim().ToLowerInvariant();
        if (trimmed.Length > 254)
            throw new DomainException("Email address exceeds maximum length of 254 characters.");

        if (!EmailRegex.IsMatch(trimmed))
            throw new DomainException($"Invalid email format: '{trimmed}'.");

        Value = trimmed;
    }

    public static implicit operator string(EmailAddress email) => email.Value;
    public static explicit operator EmailAddress(string value) => new(value);

    public override string ToString() => Value;

    protected override IEnumerable<object?> GetEqualityComponents()
    {
        yield return Value;
    }
}

public sealed class PhoneNumber : ValueObject
{
    private static readonly Regex PhoneDigitsRegex = new(@"\D", RegexOptions.Compiled);

    public string Value { get; }

    public PhoneNumber(string value)
    {
        if (string.IsNullOrWhiteSpace(value))
            throw new DomainException("Phone number cannot be empty.");

        var digitsOnly = PhoneDigitsRegex.Replace(value, "");
        if (digitsOnly.Length < 8 || digitsOnly.Length > 15)
            throw new DomainException($"Phone number must contain between 8 and 15 digits. Provided: '{value}'.");

        Value = value.Trim();
    }

    public static implicit operator string(PhoneNumber phone) => phone.Value;
    public static explicit operator PhoneNumber(string value) => new(value);

    public override string ToString() => Value;

    protected override IEnumerable<object?> GetEqualityComponents()
    {
        yield return Value;
    }
}

public sealed class Address : ValueObject
{
    public string Street { get; }
    public string City { get; }
    public string State { get; }
    public string PostalCode { get; }
    public string? Country { get; }

    public Address(string street, string city, string state, string postalCode, string? country = "Brazil")
    {
        if (string.IsNullOrWhiteSpace(street)) throw new DomainException("Street cannot be empty.");
        if (string.IsNullOrWhiteSpace(city)) throw new DomainException("City cannot be empty.");
        if (string.IsNullOrWhiteSpace(state)) throw new DomainException("State cannot be empty.");
        if (string.IsNullOrWhiteSpace(postalCode)) throw new DomainException("Postal code cannot be empty.");

        Street = street.Trim();
        City = city.Trim();
        State = state.Trim().ToUpperInvariant();
        PostalCode = postalCode.Trim();
        Country = country?.Trim() ?? "Brazil";
    }

    public override string ToString() => $"{Street}, {City} - {State}, {PostalCode}";

    protected override IEnumerable<object?> GetEqualityComponents()
    {
        yield return Street;
        yield return City;
        yield return State;
        yield return PostalCode;
        yield return Country;
    }
}
