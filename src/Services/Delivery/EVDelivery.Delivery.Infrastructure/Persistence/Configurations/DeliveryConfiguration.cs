using EVDelivery.Delivery.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using DeliveryEntity = EVDelivery.Delivery.Domain.Entities.Delivery;

namespace EVDelivery.Delivery.Infrastructure.Persistence.Configurations;

public class DeliveryConfiguration : IEntityTypeConfiguration<DeliveryEntity>
{
    public void Configure(EntityTypeBuilder<DeliveryEntity> builder)
    {
        builder.ToTable("deliveries");

        builder.HasKey(d => d.Id);
        builder.Property(d => d.Id).ValueGeneratedNever();

        builder.Property(d => d.VehicleId)
            .IsRequired();

        builder.HasIndex(d => d.VehicleId);

        builder.Property(d => d.CustomerId)
            .IsRequired();

        builder.HasIndex(d => d.CustomerId);

        builder.Property(d => d.DeliveryCenterId)
            .IsRequired();

        builder.Property(d => d.DeliveryCenterName)
            .HasMaxLength(150)
            .IsRequired();

        builder.Property(d => d.DeliveryCenterAddress)
            .HasMaxLength(250)
            .IsRequired();

        builder.Property(d => d.DeliveryMethod)
            .HasConversion<string>()
            .HasMaxLength(30)
            .IsRequired();

        builder.Property(d => d.Status)
            .HasConversion<string>()
            .HasMaxLength(30)
            .IsRequired();

        builder.HasIndex(d => d.Status);
        builder.HasIndex(d => d.DeliveryAppointment);

        builder.Property(d => d.Notes)
            .HasMaxLength(1000);

        builder.Property(d => d.CreatedAt)
            .IsRequired();

        builder.Property(d => d.UpdatedAt)
            .IsRequired();

        builder.HasMany(d => d.Checklist)
            .WithOne()
            .HasForeignKey(c => c.DeliveryId)
            .OnDelete(DeleteBehavior.Cascade);

        builder.Navigation(d => d.Checklist)
            .UsePropertyAccessMode(PropertyAccessMode.Field);
    }
}

public class DeliveryChecklistItemConfiguration : IEntityTypeConfiguration<DeliveryChecklistItem>
{
    public void Configure(EntityTypeBuilder<DeliveryChecklistItem> builder)
    {
        builder.ToTable("delivery_checklist_items");

        builder.HasKey(c => c.Id);
        builder.Property(c => c.Id).ValueGeneratedNever();

        builder.Property(c => c.Type)
            .HasConversion<string>()
            .HasMaxLength(50)
            .IsRequired();

        builder.Property(c => c.Completed)
            .IsRequired();

        builder.Property(c => c.CompletedBy)
            .HasMaxLength(100);

        builder.Property(c => c.Notes)
            .HasMaxLength(500);

        builder.Property(c => c.IsMandatory)
            .IsRequired();

        builder.HasIndex(c => c.DeliveryId);
    }
}
