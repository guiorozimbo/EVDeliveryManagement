using EVDelivery.Delivery.Domain.Entities;
using EVDelivery.Delivery.Domain.Enums;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using DeliveryEntity = EVDelivery.Delivery.Domain.Entities.Delivery;

namespace EVDelivery.Delivery.Infrastructure.Persistence;

public static class DeliveryDbSeeder
{
    // Deterministic IDs matching known seed entities
    public static readonly Guid SealVehicleId = Guid.Parse("bbbbbbbb-1111-1111-1111-111111111111");
    public static readonly Guid DolphinVehicleId = Guid.Parse("bbbbbbbb-2222-2222-2222-222222222222");
    public static readonly Guid Customer1Id = Guid.Parse("11111111-1111-1111-1111-111111111111");
    public static readonly Guid Customer2Id = Guid.Parse("22222222-2222-2222-2222-222222222222");

    public static async Task SeedAsync(DeliveryDbContext context, ILogger logger)
    {
        try
        {
            if (await context.Deliveries.AnyAsync())
            {
                logger.LogInformation("Delivery database already seeded. Skipping.");
                return;
            }

            logger.LogInformation("Seeding initial demonstration deliveries...");

            // 1. Primary Screenshot Delivery (Matching BYD Seal)
            var sealDelivery = new DeliveryEntity(
                SealVehicleId,
                Customer1Id,
                Guid.NewGuid(),
                "São Paulo - SP (Av. Paulista, 1000 - Bela Vista)",
                "Av. Paulista, 1000 - Bela Vista, São Paulo - SP",
                DeliveryMethod.PICKUP_SERVICE_CENTER,
                new DateTimeOffset(2025, 3, 14, 8, 0, 0, TimeSpan.FromHours(-3)),
                new DateTimeOffset(2025, 3, 16, 18, 0, 0, TimeSpan.FromHours(-3)),
                new DateTimeOffset(2025, 3, 15, 10, 0, 0, TimeSpan.FromHours(-3)),
                "Customer requested morning handover and full ADAS demonstration."
            );

            // Complete 7 of 8 checklist items to match the screenshot "7 / 8 completed" exactly!
            var items = sealDelivery.Checklist.ToList();
            var tech = "João Silva (Technician)";

            var batteryItem = items.FirstOrDefault(i => i.Type == ChecklistType.Battery);
            batteryItem?.MarkCompleted(tech, "Battery capacity verified at 82.5 kWh, 82% SOC.");

            var tiresItem = items.FirstOrDefault(i => i.Type == ChecklistType.Tires);
            tiresItem?.MarkCompleted(tech, "Continental EcoContact 6 tires verified at 36 PSI.");

            var lightsItem = items.FirstOrDefault(i => i.Type == ChecklistType.Lights);
            lightsItem?.MarkCompleted(tech, "Full LED headlights, DRLs, and ambient lights checked.");

            var mediaItem = items.FirstOrDefault(i => i.Type == ChecklistType.Multimedia);
            mediaItem?.MarkCompleted(tech, "Rotating 15.6 screen and DiLink OS updated to latest build.");

            var adasItem = items.FirstOrDefault(i => i.Type == ChecklistType.ADAS);
            adasItem?.MarkCompleted(tech, "Radars, cameras, and lane assist calibrated.");

            var accItem = items.FirstOrDefault(i => i.Type == ChecklistType.Accessories);
            accItem?.MarkCompleted(tech, "V2L cable, emergency kit, floor mats verified.");

            var docItem = items.FirstOrDefault(i => i.Type == ChecklistType.Documentation);
            docItem?.MarkCompleted(tech, "Invoice, warranty card, and ownership transfer ready.");

            // Cleaning item left as Pending!

            // 2. Ready delivery for Dolphin
            var dolphinDelivery = new DeliveryEntity(
                DolphinVehicleId,
                Customer2Id,
                Guid.NewGuid(),
                "Campinas Delivery Center",
                "Rua Coronel Quirino, 850 - Cambuí, Campinas - SP",
                DeliveryMethod.PICKUP_SERVICE_CENTER,
                DateTimeOffset.UtcNow.AddDays(-1),
                DateTimeOffset.UtcNow.AddDays(2),
                DateTimeOffset.UtcNow.AddHours(4),
                "Customer scheduled for afternoon pickup."
            );

            foreach (var item in dolphinDelivery.Checklist)
            {
                item.MarkCompleted("Lucas Ferreira (Lead Tech)", "Verified during pre-delivery inspection.");
            }

            await context.Deliveries.AddRangeAsync(sealDelivery, dolphinDelivery);
            await context.SaveChangesAsync();

            logger.LogInformation("Successfully seeded 2 demonstration deliveries.");
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "An error occurred while seeding delivery demonstration data.");
        }
    }
}
