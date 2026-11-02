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
    public static readonly Guid YangwangU9Id = Guid.Parse("bbbbbbbb-6666-6666-6666-666666666666");
    public static readonly Guid YangwangU8Id = Guid.Parse("bbbbbbbb-7777-7777-7777-777777777777");
    public static readonly Guid SeaLion07Id = Guid.Parse("bbbbbbbb-8888-8888-8888-888888888888");
    public static readonly Guid SharkId = Guid.Parse("bbbbbbbb-9999-9999-9999-999999999999");
    public static readonly Guid Bao5Id = Guid.Parse("bbbbbbbb-aaaa-aaaa-aaaa-aaaaaaaaaaaa");

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

            // 6. BYD Yangwang U9 - Supercar Lançamento 2026 (1.306 cv, Blade 800V, DiSus-X)
            var u9 = new VehicleEntity(
                new Vin("LC0C74C4XR6678912"),
                "BYD",
                "Yangwang U9",
                "Supercar Edition 1306hp",
                2026,
                "Vermelho Solar / Carbono",
                new BatteryInfo(80.0m, 100),
                450,
                3.2m,
                "YANG999",
                "BYD Flagship Showroom",
                "São Paulo - SP (Faria Lima)",
                "/vehicles/byd_u9.png",
                VehicleStatus.ORDERED,
                "System",
                YangwangU9Id
            );
            u9.TransitionTo(VehicleStatus.VIN_ASSIGNED, "Special Operations", "VIN stamped for hypercar production slot.");
            u9.TransitionTo(VehicleStatus.IN_TRANSIT, "Air Cargo VIP", "Flown from Shenzhen to São Paulo Guarulhos.");
            u9.TransitionTo(VehicleStatus.RECEIVED, "Master Tech", "Arrived at Flagship Delivery Lounge.");
            u9.TransitionTo(VehicleStatus.INSPECTION, "Chief Engineer", "DiSus-X calibration and Blade 800V cell balancing test.");
            u9.TransitionTo(VehicleStatus.PREPARATION, "PDI Detailer", "High voltage ceramic coating and battery conditioning.");
            u9.TransitionTo(VehicleStatus.READY_FOR_DELIVERY, "Delivery Director", "Hypercar certified for VIP handover.");

            // 7. BYD Yangwang U8 - Super SUV Luxo Lançamento 2026 (1.197 cv, Giro 360°, Flutuação)
            var u8 = new VehicleEntity(
                new Vin("LC0C74C4XR7789023"),
                "BYD",
                "Yangwang U8",
                "Premium Edition 1197hp",
                2026,
                "Dourado Areia Imperial",
                new BatteryInfo(49.05m, 98),
                1000,
                8.0m,
                "U8TANK",
                "Pátio VIP de Desembarque",
                "São Paulo - SP (Av. Europa)",
                "/vehicles/byd_u8.png",
                VehicleStatus.ORDERED,
                "System",
                YangwangU8Id
            );
            u8.TransitionTo(VehicleStatus.VIN_ASSIGNED, "Logistics Command", "VIN assigned to Luxury SUV.");
            u8.TransitionTo(VehicleStatus.IN_TRANSIT, "Express Carrier", "Shipped with satellite tracking.");
            u8.TransitionTo(VehicleStatus.RECEIVED, "PDI Inspector", "Received at dealership.");
            u8.TransitionTo(VehicleStatus.INSPECTION, "Tech Specialist", "Quad-motor tank-turn calibration and waterproof sealing check.");

            // 8. BYD Sea Lion 07 EV - Lançamento Linha Ocean (e-Platform 3.0 Evo)
            var seaLion = new VehicleEntity(
                new Vin("LC0C74C4XR8890134"),
                "BYD",
                "Sea Lion 07",
                "Performance AWD 530hp",
                2026,
                "Azul Oceano Profundo",
                new BatteryInfo(80.64m, 92),
                550,
                15.0m,
                "SEA07EV",
                "Hub Logístico Portuário",
                "Santos - SP",
                "/vehicles/byd_sealion07.png",
                VehicleStatus.ORDERED,
                "System",
                SeaLion07Id
            );
            seaLion.TransitionTo(VehicleStatus.VIN_ASSIGNED, "Ocean Team", "VIN allocated.");
            seaLion.TransitionTo(VehicleStatus.IN_TRANSIT, "Logistics Fleet", "En route to delivery center.");

            // 9. BYD Shark - Picape Super Híbrida Lançamento 2026 (DMO 430cv)
            var shark = new VehicleEntity(
                new Vin("LC0C74C4XR9901245"),
                "BYD",
                "Shark",
                "DMO Super Hybrid AWD",
                2026,
                "Cinza Rocha Titânio",
                new BatteryInfo(29.58m, 88),
                840,
                22.0m,
                "SHK4300",
                "Centro de Distribuição Centro-Oeste",
                "Goiânia - GO",
                "/vehicles/byd_shark.png",
                VehicleStatus.ORDERED,
                "System",
                SharkId
            );
            shark.TransitionTo(VehicleStatus.VIN_ASSIGNED, "Commercial Fleet", "VIN generated.");
            shark.TransitionTo(VehicleStatus.IN_TRANSIT, "Trailer 404", "Heavy transport trailer.");
            shark.TransitionTo(VehicleStatus.RECEIVED, "Agronegócio Yard", "Discharged at yard.");
            shark.TransitionTo(VehicleStatus.INSPECTION, "Field Inspector", "Off-road and hybrid battery check.");
            shark.TransitionTo(VehicleStatus.PREPARATION, "Accessory Workshop", "Installation of bed cover and off-road protection.");

            // 10. BYD Fangchengbao Bao 5 - SUV Hardcore Lançamento (DMO 680cv)
            var bao5 = new VehicleEntity(
                new Vin("LC0C74C4XR0012356"),
                "BYD",
                "Fangchengbao Bao 5",
                "Explorer 680hp",
                2026,
                "Verde Floresta Militar",
                new BatteryInfo(31.8m, 95),
                1200,
                11.0m,
                "BAO5000",
                "Hub Sul",
                "Curitiba - PR",
                "/vehicles/byd_bao5.png",
                VehicleStatus.ORDERED,
                "System",
                Bao5Id
            );
            bao5.TransitionTo(VehicleStatus.VIN_ASSIGNED, "FCB Logistics", "VIN verified.");
            bao5.TransitionTo(VehicleStatus.IN_TRANSIT, "Freight Team", "Transferred to delivery center.");
            bao5.TransitionTo(VehicleStatus.RECEIVED, "South Yard", "Arrived at logistics park.");
            bao5.TransitionTo(VehicleStatus.INSPECTION, "Technician", "DMO platform diagnostic.");
            bao5.TransitionTo(VehicleStatus.PREPARATION, "Detailing", "PDI preparation.");
            bao5.TransitionTo(VehicleStatus.READY_FOR_DELIVERY, "Supervisor", "Inspection completed.");

            await context.Vehicles.AddRangeAsync(seal, dolphin, songPlus, yuanPlus, han, u9, u8, seaLion, shark, bao5);
            await context.SaveChangesAsync();

            logger.LogInformation("Successfully seeded 10 demonstration and launch vehicles (Seal, Dolphin, Song Plus, Yuan Plus, Han, Yangwang U9, Yangwang U8, Sea Lion 07, Shark, Bao 5).");
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "An error occurred while seeding vehicle demonstration data.");
        }
    }
}
