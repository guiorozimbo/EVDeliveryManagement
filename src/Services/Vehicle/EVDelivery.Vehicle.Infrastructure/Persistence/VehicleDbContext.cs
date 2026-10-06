using EVDelivery.Vehicle.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using VehicleEntity = EVDelivery.Vehicle.Domain.Entities.Vehicle;

namespace EVDelivery.Vehicle.Infrastructure.Persistence;

public class VehicleDbContext : DbContext
{
    public VehicleDbContext(DbContextOptions<VehicleDbContext> options) : base(options) { }

    public DbSet<VehicleEntity> Vehicles => Set<VehicleEntity>();
    public DbSet<VehicleStatusHistory> VehicleStatusHistories => Set<VehicleStatusHistory>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);
        modelBuilder.ApplyConfigurationsFromAssembly(typeof(VehicleDbContext).Assembly);
    }
}
