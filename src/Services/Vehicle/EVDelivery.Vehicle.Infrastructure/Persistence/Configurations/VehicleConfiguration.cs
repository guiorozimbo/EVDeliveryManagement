using EVDelivery.Vehicle.Domain.Entities;
using EVDelivery.Vehicle.Domain.Enums;
using EVDelivery.Vehicle.Domain.ValueObjects;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using VehicleEntity = EVDelivery.Vehicle.Domain.Entities.Vehicle;

namespace EVDelivery.Vehicle.Infrastructure.Persistence.Configurations;

public class VehicleConfiguration : IEntityTypeConfiguration<VehicleEntity>
{
    public void Configure(EntityTypeBuilder<VehicleEntity> builder)
    {
        builder.ToTable("vehicles");

        builder.HasKey(v => v.Id);
        builder.Property(v => v.Id).ValueGeneratedNever();

        builder.Property(v => v.Vin)
            .HasConversion(
                vin => vin.Value,
                value => new Vin(value))
            .HasMaxLength(17)
            .IsRequired();

        builder.HasIndex(v => v.Vin)
            .IsUnique();

        builder.Property(v => v.Brand)
            .HasMaxLength(50)
            .IsRequired();

        builder.Property(v => v.Model)
            .HasMaxLength(50)
            .IsRequired();

        builder.Property(v => v.Version)
            .HasMaxLength(50)
            .IsRequired();

        builder.Property(v => v.Year)
            .IsRequired();

        builder.Property(v => v.Color)
            .HasMaxLength(30)
            .IsRequired();

        builder.OwnsOne(v => v.Battery, batteryBuilder =>
        {
            batteryBuilder.Property(b => b.CapacityKwh)
                .HasColumnName("battery_capacity_kwh")
                .HasPrecision(6, 2)
                .IsRequired();

            batteryBuilder.Property(b => b.LevelPercentage)
                .HasColumnName("battery_level_percentage")
                .IsRequired();
        });

        builder.Property(v => v.EstimatedRangeKm)
            .IsRequired();

        builder.Property(v => v.OdometerKm)
            .HasPrecision(10, 2)
            .IsRequired();

        builder.Property(v => v.LicensePlate)
            .HasMaxLength(20);

        builder.Property(v => v.Location)
            .HasMaxLength(150);

        builder.Property(v => v.DeliveryCenter)
            .HasMaxLength(150);

        builder.Property(v => v.ImageUrl)
            .HasMaxLength(500);

        builder.Property(v => v.Status)
            .HasConversion<string>()
            .HasMaxLength(30)
            .IsRequired();

        builder.HasIndex(v => v.Status);
        builder.HasIndex(v => new { v.Brand, v.Model });

        builder.Property(v => v.CreatedAt)
            .IsRequired();

        builder.Property(v => v.UpdatedAt)
            .IsRequired();

        builder.HasMany(v => v.StatusHistory)
            .WithOne()
            .HasForeignKey(h => h.VehicleId)
            .OnDelete(DeleteBehavior.Cascade);

        builder.Navigation(v => v.StatusHistory)
            .UsePropertyAccessMode(PropertyAccessMode.Field);
    }
}

public class VehicleStatusHistoryConfiguration : IEntityTypeConfiguration<VehicleStatusHistory>
{
    public void Configure(EntityTypeBuilder<VehicleStatusHistory> builder)
    {
        builder.ToTable("vehicle_status_histories");

        builder.HasKey(h => h.Id);
        builder.Property(h => h.Id).ValueGeneratedNever();

        builder.Property(h => h.FromStatus)
            .HasConversion<string>()
            .HasMaxLength(30)
            .IsRequired();

        builder.Property(h => h.ToStatus)
            .HasConversion<string>()
            .HasMaxLength(30)
            .IsRequired();

        builder.Property(h => h.ChangedBy)
            .HasMaxLength(100)
            .IsRequired();

        builder.Property(h => h.Notes)
            .HasMaxLength(500);

        builder.Property(h => h.ChangedAt)
            .IsRequired();

        builder.HasIndex(h => h.VehicleId);
        builder.HasIndex(h => h.ChangedAt);
    }
}
