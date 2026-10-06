using System.Text.RegularExpressions;
using EVDelivery.Vehicle.Domain.Common;

namespace EVDelivery.Vehicle.Domain.ValueObjects;

public sealed class Vin : ValueObject
{
    private static readonly Regex VinRegex = new("^[A-HJ-NPR-Z0-9]{17}$", RegexOptions.Compiled | RegexOptions.IgnoreCase);

    public string Value { get; }

    public Vin(string value)
    {
        if (string.IsNullOrWhiteSpace(value))
            throw new DomainException("VIN cannot be empty.");

        var trimmed = value.Trim().ToUpperInvariant();
        if (trimmed.Length != 17)
            throw new DomainException($"VIN must be exactly 17 characters long. Received length: {trimmed.Length}");

        if (!VinRegex.IsMatch(trimmed))
            throw new DomainException($"VIN '{trimmed}' contains invalid characters. Letters I, O, and Q are not allowed in valid ISO 3779 VINs.");

        Value = trimmed;
    }

    public static implicit operator string(Vin vin) => vin.Value;
    public static explicit operator Vin(string value) => new(value);

    public override string ToString() => Value;

    protected override IEnumerable<object?> GetEqualityComponents()
    {
        yield return Value;
    }
}

public sealed class BatteryInfo : ValueObject
{
    public decimal CapacityKwh { get; }
    public int LevelPercentage { get; }

    public BatteryInfo(decimal capacityKwh, int levelPercentage)
    {
        if (capacityKwh <= 0)
            throw new DomainException($"Battery capacity must be greater than zero. Provided: {capacityKwh} kWh");

        if (levelPercentage < 0 || levelPercentage > 100)
            throw new DomainException($"Battery percentage must be between 0 and 100. Provided: {levelPercentage}%");

        CapacityKwh = capacityKwh;
        LevelPercentage = levelPercentage;
    }

    public BatteryInfo UpdateLevel(int newPercentage)
    {
        return new BatteryInfo(CapacityKwh, newPercentage);
    }

    protected override IEnumerable<object?> GetEqualityComponents()
    {
        yield return CapacityKwh;
        yield return LevelPercentage;
    }
}
