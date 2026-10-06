using EVDelivery.Vehicle.Application.DTOs;
using EVDelivery.Vehicle.Domain.Common;
using EVDelivery.Vehicle.Domain.Enums;
using EVDelivery.Vehicle.Domain.Repositories;
using EVDelivery.Vehicle.Domain.ValueObjects;
using FluentValidation;
using Microsoft.Extensions.Logging;
using VehicleEntity = EVDelivery.Vehicle.Domain.Entities.Vehicle;

namespace EVDelivery.Vehicle.Application.Services;

public interface IVehicleApplicationService
{
    Task<PagedResult<VehicleDto>> GetPagedAsync(
        int page = 1,
        int pageSize = 10,
        string? search = null,
        string? status = null,
        string? sortBy = null,
        bool isAsc = true,
        CancellationToken cancellationToken = default);

    Task<VehicleDetailDto?> GetByIdAsync(Guid id, CancellationToken cancellationToken = default);
    Task<VehicleDetailDto?> GetByVinAsync(string vin, CancellationToken cancellationToken = default);
    Task<IReadOnlyList<VehicleHistoryDto>> GetHistoryAsync(Guid id, CancellationToken cancellationToken = default);
    Task<VehicleDetailDto> CreateAsync(CreateVehicleRequest request, CancellationToken cancellationToken = default);
    Task<VehicleDetailDto> UpdateAsync(Guid id, UpdateVehicleRequest request, CancellationToken cancellationToken = default);
    Task<VehicleDetailDto> UpdateStatusAsync(Guid id, UpdateVehicleStatusRequest request, CancellationToken cancellationToken = default);
    Task<VehicleDetailDto> UpdateTelemetryAsync(Guid id, UpdateVehicleTelemetryRequest request, CancellationToken cancellationToken = default);
    Task<bool> DeleteAsync(Guid id, CancellationToken cancellationToken = default);
}

public class VehicleApplicationService : IVehicleApplicationService
{
    private readonly IVehicleRepository _repository;
    private readonly IValidator<CreateVehicleRequest> _createValidator;
    private readonly IValidator<UpdateVehicleRequest> _updateValidator;
    private readonly IValidator<UpdateVehicleStatusRequest> _statusValidator;
    private readonly ILogger<VehicleApplicationService> _logger;

    public VehicleApplicationService(
        IVehicleRepository repository,
        IValidator<CreateVehicleRequest> createValidator,
        IValidator<UpdateVehicleRequest> updateValidator,
        IValidator<UpdateVehicleStatusRequest> statusValidator,
        ILogger<VehicleApplicationService> logger)
    {
        _repository = repository;
        _createValidator = createValidator;
        _updateValidator = updateValidator;
        _statusValidator = statusValidator;
        _logger = logger;
    }

    public async Task<PagedResult<VehicleDto>> GetPagedAsync(
        int page = 1,
        int pageSize = 10,
        string? search = null,
        string? status = null,
        string? sortBy = null,
        bool isAsc = true,
        CancellationToken cancellationToken = default)
    {
        page = Math.Max(1, page);
        pageSize = Math.Clamp(pageSize, 1, 100);

        VehicleStatus? filterStatus = null;
        if (!string.IsNullOrWhiteSpace(status) && Enum.TryParse<VehicleStatus>(status, true, out var parsedStatus))
        {
            filterStatus = parsedStatus;
        }

        var (items, totalCount) = await _repository.GetPagedAsync(page, pageSize, search, filterStatus, sortBy, isAsc, cancellationToken);
        var dtos = items.Select(MapToDto).ToList();

        return new PagedResult<VehicleDto>(dtos, totalCount, page, pageSize);
    }

    public async Task<VehicleDetailDto?> GetByIdAsync(Guid id, CancellationToken cancellationToken = default)
    {
        var vehicle = await _repository.GetByIdAsync(id, cancellationToken);
        return vehicle == null ? null : MapToDetailDto(vehicle);
    }

    public async Task<VehicleDetailDto?> GetByVinAsync(string vin, CancellationToken cancellationToken = default)
    {
        var vehicle = await _repository.GetByVinAsync(vin, cancellationToken);
        return vehicle == null ? null : MapToDetailDto(vehicle);
    }

    public async Task<IReadOnlyList<VehicleHistoryDto>> GetHistoryAsync(Guid id, CancellationToken cancellationToken = default)
    {
        var vehicle = await _repository.GetByIdAsync(id, cancellationToken);
        if (vehicle == null)
            return Array.Empty<VehicleHistoryDto>();

        return vehicle.StatusHistory
            .OrderByDescending(h => h.ChangedAt)
            .Select(h => new VehicleHistoryDto(
                h.Id,
                h.VehicleId,
                h.FromStatus.ToString(),
                h.ToStatus.ToString(),
                h.ChangedAt,
                h.ChangedBy,
                h.Notes))
            .ToList();
    }

    public async Task<VehicleDetailDto> CreateAsync(CreateVehicleRequest request, CancellationToken cancellationToken = default)
    {
        var validationResult = await _createValidator.ValidateAsync(request, cancellationToken);
        if (!validationResult.IsValid)
            throw new ValidationException(validationResult.Errors);

        if (await _repository.ExistsByVinAsync(request.Vin, cancellationToken))
            throw new DomainException($"A vehicle with VIN '{request.Vin}' already exists.");

        var initialStatus = VehicleStatus.ORDERED;
        if (!string.IsNullOrWhiteSpace(request.InitialStatus) && Enum.TryParse<VehicleStatus>(request.InitialStatus, true, out var parsedStatus))
        {
            initialStatus = parsedStatus;
        }

        var vin = new Vin(request.Vin);
        var battery = new BatteryInfo(request.BatteryCapacityKwh, request.BatteryLevelPercentage);

        var vehicle = new VehicleEntity(
            vin,
            request.Brand,
            request.Model,
            request.Version,
            request.Year,
            request.Color,
            battery,
            request.EstimatedRangeKm,
            request.OdometerKm,
            request.LicensePlate,
            request.Location,
            request.DeliveryCenter,
            request.ImageUrl,
            initialStatus,
            request.CreatedBy ?? "System"
        );

        await _repository.AddAsync(vehicle, cancellationToken);
        await _repository.SaveChangesAsync(cancellationToken);

        _logger.LogInformation("Vehicle created successfully: {Vin} (Id: {Id})", vehicle.Vin.Value, vehicle.Id);

        return MapToDetailDto(vehicle);
    }

    public async Task<VehicleDetailDto> UpdateAsync(Guid id, UpdateVehicleRequest request, CancellationToken cancellationToken = default)
    {
        var validationResult = await _updateValidator.ValidateAsync(request, cancellationToken);
        if (!validationResult.IsValid)
            throw new ValidationException(validationResult.Errors);

        var vehicle = await _repository.GetByIdAsync(id, cancellationToken)
            ?? throw new KeyNotFoundException($"Vehicle with Id '{id}' not found.");

        vehicle.UpdateDetails(
            request.Brand,
            request.Model,
            request.Version,
            request.Year,
            request.Color,
            request.EstimatedRangeKm,
            request.LicensePlate,
            request.Location,
            request.DeliveryCenter,
            request.ImageUrl
        );

        await _repository.UpdateAsync(vehicle, cancellationToken);
        await _repository.SaveChangesAsync(cancellationToken);

        _logger.LogInformation("Vehicle updated successfully: {Id}", vehicle.Id);

        return MapToDetailDto(vehicle);
    }

    public async Task<VehicleDetailDto> UpdateStatusAsync(Guid id, UpdateVehicleStatusRequest request, CancellationToken cancellationToken = default)
    {
        var validationResult = await _statusValidator.ValidateAsync(request, cancellationToken);
        if (!validationResult.IsValid)
            throw new ValidationException(validationResult.Errors);

        var vehicle = await _repository.GetByIdAsync(id, cancellationToken)
            ?? throw new KeyNotFoundException($"Vehicle with Id '{id}' not found.");

        var targetStatus = Enum.Parse<VehicleStatus>(request.NewStatus, true);
        vehicle.TransitionTo(targetStatus, request.ChangedBy ?? "User", request.Notes);

        await _repository.UpdateAsync(vehicle, cancellationToken);
        await _repository.SaveChangesAsync(cancellationToken);

        _logger.LogInformation("Vehicle {Id} status transitioned to {Status} by {ChangedBy}",
            vehicle.Id, targetStatus, request.ChangedBy ?? "User");

        return MapToDetailDto(vehicle);
    }

    public async Task<VehicleDetailDto> UpdateTelemetryAsync(Guid id, UpdateVehicleTelemetryRequest request, CancellationToken cancellationToken = default)
    {
        var vehicle = await _repository.GetByIdAsync(id, cancellationToken)
            ?? throw new KeyNotFoundException($"Vehicle with Id '{id}' not found.");

        if (request.BatteryLevelPercentage.HasValue)
        {
            vehicle.UpdateBattery(request.BatteryLevelPercentage.Value);
        }

        if (request.OdometerKm.HasValue)
        {
            vehicle.UpdateOdometer(request.OdometerKm.Value);
        }

        await _repository.UpdateAsync(vehicle, cancellationToken);
        await _repository.SaveChangesAsync(cancellationToken);

        return MapToDetailDto(vehicle);
    }

    public async Task<bool> DeleteAsync(Guid id, CancellationToken cancellationToken = default)
    {
        var vehicle = await _repository.GetByIdAsync(id, cancellationToken);
        if (vehicle == null) return false;

        await _repository.DeleteAsync(vehicle, cancellationToken);
        await _repository.SaveChangesAsync(cancellationToken);

        _logger.LogInformation("Vehicle deleted successfully: {Id}", id);
        return true;
    }

    private static VehicleDto MapToDto(VehicleEntity vehicle)
    {
        return new VehicleDto(
            vehicle.Id,
            vehicle.Vin.Value,
            vehicle.Brand,
            vehicle.Model,
            vehicle.Version,
            vehicle.Year,
            vehicle.Color,
            vehicle.Battery.CapacityKwh,
            vehicle.Battery.LevelPercentage,
            vehicle.EstimatedRangeKm,
            vehicle.OdometerKm,
            vehicle.LicensePlate,
            vehicle.Location,
            vehicle.DeliveryCenter,
            vehicle.ImageUrl,
            vehicle.Status.ToString(),
            vehicle.CreatedAt,
            vehicle.UpdatedAt
        );
    }

    private static VehicleDetailDto MapToDetailDto(VehicleEntity vehicle)
    {
        var history = vehicle.StatusHistory
            .OrderByDescending(h => h.ChangedAt)
            .Select(h => new VehicleHistoryDto(
                h.Id,
                h.VehicleId,
                h.FromStatus.ToString(),
                h.ToStatus.ToString(),
                h.ChangedAt,
                h.ChangedBy,
                h.Notes))
            .ToList();

        return new VehicleDetailDto(
            vehicle.Id,
            vehicle.Vin.Value,
            vehicle.Brand,
            vehicle.Model,
            vehicle.Version,
            vehicle.Year,
            vehicle.Color,
            vehicle.Battery.CapacityKwh,
            vehicle.Battery.LevelPercentage,
            vehicle.EstimatedRangeKm,
            vehicle.OdometerKm,
            vehicle.LicensePlate,
            vehicle.Location,
            vehicle.DeliveryCenter,
            vehicle.ImageUrl,
            vehicle.Status.ToString(),
            vehicle.CreatedAt,
            vehicle.UpdatedAt,
            history
        );
    }
}
