using EVDelivery.Delivery.Application.DTOs;
using EVDelivery.Delivery.Domain.Common;
using EVDelivery.Delivery.Domain.Enums;
using EVDelivery.Delivery.Domain.Repositories;
using FluentValidation;
using Microsoft.Extensions.Logging;
using DeliveryEntity = EVDelivery.Delivery.Domain.Entities.Delivery;

namespace EVDelivery.Delivery.Application.Services;

public interface IDeliveryApplicationService
{
    Task<PagedResult<DeliveryDto>> GetPagedAsync(
        int page = 1,
        int pageSize = 10,
        Guid? vehicleId = null,
        Guid? customerId = null,
        string? status = null,
        string? sortBy = null,
        bool isAsc = true,
        CancellationToken cancellationToken = default);

    Task<DeliveryDetailDto?> GetByIdAsync(Guid id, CancellationToken cancellationToken = default);
    Task<DeliveryDetailDto?> GetByVehicleIdAsync(Guid vehicleId, CancellationToken cancellationToken = default);
    Task<IReadOnlyList<DeliveryChecklistItemDto>> GetChecklistAsync(Guid id, CancellationToken cancellationToken = default);
    Task<DeliveryDetailDto> CreateAsync(CreateDeliveryRequest request, CancellationToken cancellationToken = default);
    Task<DeliveryDetailDto> ScheduleAsync(Guid id, ScheduleDeliveryRequest request, CancellationToken cancellationToken = default);
    Task<DeliveryDetailDto> UpdateChecklistItemAsync(Guid id, Guid itemId, UpdateChecklistItemRequest request, CancellationToken cancellationToken = default);
    Task<DeliveryDetailDto> StartAsync(Guid id, StartDeliveryRequest request, CancellationToken cancellationToken = default);
    Task<DeliveryDetailDto> CompleteAsync(Guid id, CancellationToken cancellationToken = default);
    Task<DeliveryDetailDto> CancelAsync(Guid id, CancelDeliveryRequest request, CancellationToken cancellationToken = default);
    Task<bool> DeleteAsync(Guid id, CancellationToken cancellationToken = default);
}

public class DeliveryApplicationService : IDeliveryApplicationService
{
    private readonly IDeliveryRepository _repository;
    private readonly IValidator<CreateDeliveryRequest> _createValidator;
    private readonly IValidator<ScheduleDeliveryRequest> _scheduleValidator;
    private readonly IValidator<UpdateChecklistItemRequest> _checklistValidator;
    private readonly ILogger<DeliveryApplicationService> _logger;

    public DeliveryApplicationService(
        IDeliveryRepository repository,
        IValidator<CreateDeliveryRequest> createValidator,
        IValidator<ScheduleDeliveryRequest> scheduleValidator,
        IValidator<UpdateChecklistItemRequest> checklistValidator,
        ILogger<DeliveryApplicationService> logger)
    {
        _repository = repository;
        _createValidator = createValidator;
        _scheduleValidator = scheduleValidator;
        _checklistValidator = checklistValidator;
        _logger = logger;
    }

    public async Task<PagedResult<DeliveryDto>> GetPagedAsync(
        int page = 1,
        int pageSize = 10,
        Guid? vehicleId = null,
        Guid? customerId = null,
        string? status = null,
        string? sortBy = null,
        bool isAsc = true,
        CancellationToken cancellationToken = default)
    {
        page = Math.Max(1, page);
        pageSize = Math.Clamp(pageSize, 1, 100);

        DeliveryStatus? filterStatus = null;
        if (!string.IsNullOrWhiteSpace(status) && Enum.TryParse<DeliveryStatus>(status, true, out var parsedStatus))
        {
            filterStatus = parsedStatus;
        }

        var (items, totalCount) = await _repository.GetPagedAsync(page, pageSize, vehicleId, customerId, filterStatus, sortBy, isAsc, cancellationToken);
        var dtos = items.Select(MapToDto).ToList();

        return new PagedResult<DeliveryDto>(dtos, totalCount, page, pageSize);
    }

    public async Task<DeliveryDetailDto?> GetByIdAsync(Guid id, CancellationToken cancellationToken = default)
    {
        var delivery = await _repository.GetByIdAsync(id, cancellationToken);
        return delivery == null ? null : MapToDetailDto(delivery);
    }

    public async Task<DeliveryDetailDto?> GetByVehicleIdAsync(Guid vehicleId, CancellationToken cancellationToken = default)
    {
        var delivery = await _repository.GetByVehicleIdAsync(vehicleId, cancellationToken);
        return delivery == null ? null : MapToDetailDto(delivery);
    }

    public async Task<IReadOnlyList<DeliveryChecklistItemDto>> GetChecklistAsync(Guid id, CancellationToken cancellationToken = default)
    {
        var delivery = await _repository.GetByIdAsync(id, cancellationToken);
        if (delivery == null)
            return Array.Empty<DeliveryChecklistItemDto>();

        return delivery.Checklist
            .Select(c => new DeliveryChecklistItemDto(
                c.Id,
                c.DeliveryId,
                c.Type.ToString(),
                c.Completed,
                c.CompletedAt,
                c.CompletedBy,
                c.Notes,
                c.IsMandatory))
            .ToList();
    }

    public async Task<DeliveryDetailDto> CreateAsync(CreateDeliveryRequest request, CancellationToken cancellationToken = default)
    {
        var validationResult = await _createValidator.ValidateAsync(request, cancellationToken);
        if (!validationResult.IsValid)
            throw new ValidationException(validationResult.Errors);

        var existing = await _repository.GetByVehicleIdAsync(request.VehicleId, cancellationToken);
        if (existing != null && existing.Status != DeliveryStatus.CANCELLED)
        {
            throw new DomainException($"An active delivery process already exists for Vehicle ID '{request.VehicleId}'.");
        }

        var method = DeliveryMethod.PICKUP_SERVICE_CENTER;
        if (!string.IsNullOrWhiteSpace(request.DeliveryMethod) && Enum.TryParse<DeliveryMethod>(request.DeliveryMethod, true, out var parsedMethod))
        {
            method = parsedMethod;
        }

        var delivery = new DeliveryEntity(
            request.VehicleId,
            request.CustomerId,
            request.DeliveryCenterId,
            request.DeliveryCenterName,
            request.DeliveryCenterAddress ?? "Delivery Center Hub",
            method,
            request.DeliveryWindowStart,
            request.DeliveryWindowEnd,
            request.DeliveryAppointment,
            request.Notes
        );

        await _repository.AddAsync(delivery, cancellationToken);
        await _repository.SaveChangesAsync(cancellationToken);

        _logger.LogInformation("Delivery created successfully: Id {DeliveryId} for Vehicle {VehicleId}", delivery.Id, delivery.VehicleId);

        return MapToDetailDto(delivery);
    }

    public async Task<DeliveryDetailDto> ScheduleAsync(Guid id, ScheduleDeliveryRequest request, CancellationToken cancellationToken = default)
    {
        var validationResult = await _scheduleValidator.ValidateAsync(request, cancellationToken);
        if (!validationResult.IsValid)
            throw new ValidationException(validationResult.Errors);

        var delivery = await _repository.GetByIdAsync(id, cancellationToken)
            ?? throw new KeyNotFoundException($"Delivery with Id '{id}' was not found.");

        delivery.Schedule(request.AppointmentTime, request.WindowStart, request.WindowEnd);

        await _repository.UpdateAsync(delivery, cancellationToken);
        await _repository.SaveChangesAsync(cancellationToken);

        _logger.LogInformation("Delivery {DeliveryId} appointment scheduled for {Appointment}", delivery.Id, request.AppointmentTime);

        return MapToDetailDto(delivery);
    }

    public async Task<DeliveryDetailDto> UpdateChecklistItemAsync(Guid id, Guid itemId, UpdateChecklistItemRequest request, CancellationToken cancellationToken = default)
    {
        var validationResult = await _checklistValidator.ValidateAsync(request, cancellationToken);
        if (!validationResult.IsValid)
            throw new ValidationException(validationResult.Errors);

        var delivery = await _repository.GetByIdAsync(id, cancellationToken)
            ?? throw new KeyNotFoundException($"Delivery with Id '{id}' was not found.");

        delivery.UpdateChecklistItem(itemId, request.Completed, request.Technician, request.Notes);

        await _repository.UpdateAsync(delivery, cancellationToken);
        await _repository.SaveChangesAsync(cancellationToken);

        _logger.LogInformation("Checklist item {ItemId} on Delivery {DeliveryId} updated to Completed={Completed} by {Technician}",
            itemId, delivery.Id, request.Completed, request.Technician);

        return MapToDetailDto(delivery);
    }

    public async Task<DeliveryDetailDto> StartAsync(Guid id, StartDeliveryRequest request, CancellationToken cancellationToken = default)
    {
        var delivery = await _repository.GetByIdAsync(id, cancellationToken)
            ?? throw new KeyNotFoundException($"Delivery with Id '{id}' was not found.");

        var vehicleStatus = request.VehicleStatus ?? "READY_FOR_DELIVERY";
        delivery.Start(vehicleStatus);

        await _repository.UpdateAsync(delivery, cancellationToken);
        await _repository.SaveChangesAsync(cancellationToken);

        _logger.LogInformation("Delivery {DeliveryId} started by {StartedBy}", delivery.Id, request.StartedBy ?? "Technician");

        return MapToDetailDto(delivery);
    }

    public async Task<DeliveryDetailDto> CompleteAsync(Guid id, CancellationToken cancellationToken = default)
    {
        var delivery = await _repository.GetByIdAsync(id, cancellationToken)
            ?? throw new KeyNotFoundException($"Delivery with Id '{id}' was not found.");

        delivery.Complete();

        await _repository.UpdateAsync(delivery, cancellationToken);
        await _repository.SaveChangesAsync(cancellationToken);

        _logger.LogInformation("Delivery {DeliveryId} completed successfully.", delivery.Id);

        return MapToDetailDto(delivery);
    }

    public async Task<DeliveryDetailDto> CancelAsync(Guid id, CancelDeliveryRequest request, CancellationToken cancellationToken = default)
    {
        if (string.IsNullOrWhiteSpace(request.Reason))
            throw new DomainException("A cancellation reason is required.");

        var delivery = await _repository.GetByIdAsync(id, cancellationToken)
            ?? throw new KeyNotFoundException($"Delivery with Id '{id}' was not found.");

        delivery.Cancel(request.Reason);

        await _repository.UpdateAsync(delivery, cancellationToken);
        await _repository.SaveChangesAsync(cancellationToken);

        _logger.LogInformation("Delivery {DeliveryId} cancelled. Reason: {Reason}", delivery.Id, request.Reason);

        return MapToDetailDto(delivery);
    }

    public async Task<bool> DeleteAsync(Guid id, CancellationToken cancellationToken = default)
    {
        var delivery = await _repository.GetByIdAsync(id, cancellationToken);
        if (delivery == null) return false;

        await _repository.DeleteAsync(delivery, cancellationToken);
        await _repository.SaveChangesAsync(cancellationToken);

        _logger.LogInformation("Delivery deleted successfully: {Id}", id);
        return true;
    }

    private static ChecklistSummaryDto BuildSummary(IReadOnlyCollection<EVDelivery.Delivery.Domain.Entities.DeliveryChecklistItem> checklist)
    {
        var total = checklist.Count;
        var completed = checklist.Count(c => c.Completed);
        var mandatory = checklist.Count(c => c.IsMandatory);
        var completedMandatory = checklist.Count(c => c.IsMandatory && c.Completed);

        return new ChecklistSummaryDto(
            total,
            completed,
            mandatory,
            completedMandatory,
            mandatory > 0 && mandatory == completedMandatory
        );
    }

    private static DeliveryDto MapToDto(DeliveryEntity delivery)
    {
        return new DeliveryDto(
            delivery.Id,
            delivery.VehicleId,
            delivery.CustomerId,
            delivery.DeliveryCenterId,
            delivery.DeliveryCenterName,
            delivery.DeliveryCenterAddress,
            delivery.DeliveryAppointment,
            delivery.DeliveryWindowStart,
            delivery.DeliveryWindowEnd,
            delivery.DeliveryMethod.ToString(),
            delivery.Status.ToString(),
            delivery.Notes,
            delivery.CreatedAt,
            delivery.UpdatedAt,
            BuildSummary(delivery.Checklist)
        );
    }

    private static DeliveryDetailDto MapToDetailDto(DeliveryEntity delivery)
    {
        var checklistDtos = delivery.Checklist
            .Select(c => new DeliveryChecklistItemDto(
                c.Id,
                c.DeliveryId,
                c.Type.ToString(),
                c.Completed,
                c.CompletedAt,
                c.CompletedBy,
                c.Notes,
                c.IsMandatory))
            .ToList();

        return new DeliveryDetailDto(
            delivery.Id,
            delivery.VehicleId,
            delivery.CustomerId,
            delivery.DeliveryCenterId,
            delivery.DeliveryCenterName,
            delivery.DeliveryCenterAddress,
            delivery.DeliveryAppointment,
            delivery.DeliveryWindowStart,
            delivery.DeliveryWindowEnd,
            delivery.DeliveryMethod.ToString(),
            delivery.Status.ToString(),
            delivery.Notes,
            delivery.CreatedAt,
            delivery.UpdatedAt,
            BuildSummary(delivery.Checklist),
            checklistDtos
        );
    }
}
