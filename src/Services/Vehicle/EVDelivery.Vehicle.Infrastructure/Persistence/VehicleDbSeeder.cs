using EVDelivery.Vehicle.Domain.Enums;
using EVDelivery.Vehicle.Domain.ValueObjects;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using VehicleEntity = EVDelivery.Vehicle.Domain.Entities.Vehicle;

namespace EVDelivery.Vehicle.Infrastructure.Persistence;

public static class VehicleDbSeeder
{
    public static readonly Guid SealVehicleId = Guid.Parse("bbbbbbbb-1111-1111-1111-111111111111");
    public static readonly Guid DolphinVehicleId = Guid.Parse("bbbbbbbb-2222-2222-2222-222222222222");
    public static readonly Guid SongPlusVehicleId = Guid.Parse("bbbbbbbb-3333-3333-3333-333333333333");
    public static readonly Guid YuanPlusVehicleId = Guid.Parse("bbbbbbbb-4444-4444-4444-444444444444");
    public static readonly Guid HanVehicleId = Guid.Parse("bbbbbbbb-5555-5555-5555-555555555555");

    public static async Task SeedAsync(VehicleDbContext context, ILogger logger)
    {
        try
        {
            if (await context.Vehicles.AnyAsync())
            {
                logger.LogInformation("Vehicle database already contains records. Skipping seed.");
                return;
            }

            logger.LogInformation("Seeding initial demonstration vehicles...");

            // 1. Primary Screenshot Reference Vehicle: BYD Seal
            var seal = new VehicleEntity(
                new Vin("LC0C74C4XR1234567"),
                "BYD",
                "Seal",
                "Premium",
                2024,
                "White",
                new BatteryInfo(82.5m, 82),
                420,
                18.0m,
                null,
                "Port of Santos - SP",
                "São Paulo - SP (Av. Paulista, 1000)",
                "/vehicles/byd_seal.png",
                VehicleStatus.ORDERED,
                "System",
                SealVehicleId
            );
            seal.TransitionTo(VehicleStatus.VIN_ASSIGNED, "Logistics Agent", "VIN assigned after production release.");
            seal.TransitionTo(VehicleStatus.IN_TRANSIT, "Maritime Freight", "Loaded onto vessel to Port of Santos.");

            // 2. BYD Dolphin - Ready for delivery
            var dolphin = new VehicleEntity(
                new Vin("LC0C74C4XR2345678"),
                "BYD",
                "Dolphin",
                "GS",
                2024,
                "Pink / Gray",
                new BatteryInfo(44.9m, 95),
                291,
                12.5m,
                "BRA2E24",
                "Campinas Delivery Center",
                "Campinas - SP",
                "/vehicles/byd_dolphin.png",
                VehicleStatus.ORDERED,
                "System",
                DolphinVehicleId
            );
            dolphin.TransitionTo(VehicleStatus.VIN_ASSIGNED, "System", "VIN allocated.");
            dolphin.TransitionTo(VehicleStatus.IN_TRANSIT, "Carrier", "Dispatched from logistics park.");
            dolphin.TransitionTo(VehicleStatus.RECEIVED, "Yard Inspector", "Vehicle arrived at dealer.");
            dolphin.TransitionTo(VehicleStatus.INSPECTION, "Technician", "Pre-delivery inspection underway.");
            dolphin.TransitionTo(VehicleStatus.PREPARATION, "Detailing Team", "Charging, firmware verification, and cleaning.");
            dolphin.TransitionTo(VehicleStatus.READY_FOR_DELIVERY, "Workshop Supervisor", "PDI completed. Ready for customer pickup.");

            // 3. BYD Song Plus - In Preparation
            var songPlus = new VehicleEntity(
                new Vin("LC0C74C4XR3456789"),
                "BYD",
                "Song Plus",
                "DM-i Premium",
                2024,
                "Delan Black",
                new BatteryInfo(18.3m, 60),
                1105,
                24.0m,
                null,
                "Curitiba Delivery Center",
                "Curitiba - PR",
                "/vehicles/byd_song_plus.png",
                VehicleStatus.ORDERED,
                "System",
                SongPlusVehicleId
            );
            songPlus.TransitionTo(VehicleStatus.VIN_ASSIGNED, "System", "VIN confirmed.");
            songPlus.TransitionTo(VehicleStatus.IN_TRANSIT, "Transport Logistics", "On transport trailer.");
            songPlus.TransitionTo(VehicleStatus.RECEIVED, "Yard Inspector", "Unloaded at distribution hub.");
            songPlus.TransitionTo(VehicleStatus.INSPECTION, "PDI Inspector", "Initial mechanical check.");
            songPlus.TransitionTo(VehicleStatus.PREPARATION, "PDI Technician", "Accessory installation and system check.");

            // 4. BYD Yuan Plus - VIN Assigned
            var yuanPlus = new VehicleEntity(
                new Vin("LC0C74C4XR4567890"),
                "BYD",
                "Yuan Plus",
                "EV 510",
                2024,
                "Surfing Blue",
                new BatteryInfo(60.48m, 100),
                423,
                5.0m,
                null,
                "Assembly Yard",
                "Rio de Janeiro - RJ",
                "/vehicles/byd_yuan_plus.png",
                VehicleStatus.ORDERED,
                "System",
                YuanPlusVehicleId
            );
            yuanPlus.TransitionTo(VehicleStatus.VIN_ASSIGNED, "Plant Controller", "VIN stamped and assigned to order.");

            // 5. BYD Han - Delivered
            var han = new VehicleEntity(
                new Vin("LC0C74C4XR5678901"),
                "BYD",
                "Han",
                "EV AWD Executive",
                2024,
                "Mountain Green",
                new BatteryInfo(85.4m, 98),
                521,
                42.0m,
                "EVB9H10",
                "Customer Garage",
                "São Paulo - SP",
                "/vehicles/byd_han.png",
                VehicleStatus.ORDERED,
                "System",
                HanVehicleId
            );
            han.TransitionTo(VehicleStatus.VIN_ASSIGNED, "System", "VIN verified.");
            han.TransitionTo(VehicleStatus.IN_TRANSIT, "Logistics", "Shipped.");
            han.TransitionTo(VehicleStatus.RECEIVED, "Staff", "Received.");
            han.TransitionTo(VehicleStatus.INSPECTION, "Tech", "Inspected.");
            han.TransitionTo(VehicleStatus.PREPARATION, "Tech", "Prepared.");
            han.TransitionTo(VehicleStatus.READY_FOR_DELIVERY, "Supervisor", "Ready.");
            han.TransitionTo(VehicleStatus.DELIVERY_SCHEDULED, "Sales", "Appointment scheduled.");
            han.TransitionTo(VehicleStatus.DELIVERY_IN_PROGRESS, "Delivery Specialist", "Customer handover started.");
            han.TransitionTo(VehicleStatus.DELIVERED, "Customer", "Keys and docs signed and accepted.");

            await context.Vehicles.AddRangeAsync(seal, dolphin, songPlus, yuanPlus, han);
            await context.SaveChangesAsync();

            logger.LogInformation("Successfully seeded 5 demonstration vehicles.");
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "An error occurred while seeding vehicle demonstration data.");
        }
    }
}
