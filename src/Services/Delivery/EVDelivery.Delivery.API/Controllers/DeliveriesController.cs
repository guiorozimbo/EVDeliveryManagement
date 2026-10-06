using EVDelivery.Delivery.Application.DTOs;
using EVDelivery.Delivery.Application.Services;
using Microsoft.AspNetCore.Mvc;

namespace EVDelivery.Delivery.API.Controllers;

[ApiController]
[Route("api/[controller]")]
[Produces("application/json")]
public class DeliveriesController : ControllerBase
{
    private readonly IDeliveryApplicationService _deliveryService;
    private readonly ILogger<DeliveriesController> _logger;

    public DeliveriesController(IDeliveryApplicationService deliveryService, ILogger<DeliveriesController> logger)
    {
        _deliveryService = deliveryService;
        _logger = logger;
    }

    /// <summary>
    /// Retrieves a paginated list of deliveries with optional filters for vehicle, customer, status, and sorting.
    /// </summary>
    [HttpGet]
    [ProducesResponseType(typeof(PagedResult<DeliveryDto>), StatusCodes.Status200OK)]
    public async Task<ActionResult<PagedResult<DeliveryDto>>> GetPaged(
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 10,
        [FromQuery] Guid? vehicleId = null,
        [FromQuery] Guid? customerId = null,
        [FromQuery] string? status = null,
        [FromQuery] string? sortBy = null,
        [FromQuery] bool isAsc = true,
        CancellationToken cancellationToken = default)
    {
        var result = await _deliveryService.GetPagedAsync(page, pageSize, vehicleId, customerId, status, sortBy, isAsc, cancellationToken);
        return Ok(result);
    }

    /// <summary>
    /// Retrieves delivery details including inspection checklist by delivery ID.
    /// </summary>
    [HttpGet("{id:guid}")]
    [ProducesResponseType(typeof(DeliveryDetailDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<ActionResult<DeliveryDetailDto>> GetById(Guid id, CancellationToken cancellationToken = default)
    {
        var delivery = await _deliveryService.GetByIdAsync(id, cancellationToken);
        if (delivery == null)
            return NotFound(new { message = $"Delivery with ID '{id}' was not found." });

        return Ok(delivery);
    }

    /// <summary>
    /// Retrieves active or scheduled delivery details by vehicle ID.
    /// </summary>
    [HttpGet("vehicle/{vehicleId:guid}")]
    [ProducesResponseType(typeof(DeliveryDetailDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<ActionResult<DeliveryDetailDto>> GetByVehicleId(Guid vehicleId, CancellationToken cancellationToken = default)
    {
        var delivery = await _deliveryService.GetByVehicleIdAsync(vehicleId, cancellationToken);
        if (delivery == null)
            return NotFound(new { message = $"No active delivery found for Vehicle ID '{vehicleId}'." });

        return Ok(delivery);
    }

    /// <summary>
    /// Retrieves checklist items for a specific delivery.
    /// </summary>
    [HttpGet("{id:guid}/checklist")]
    [ProducesResponseType(typeof(IReadOnlyList<DeliveryChecklistItemDto>), StatusCodes.Status200OK)]
    public async Task<ActionResult<IReadOnlyList<DeliveryChecklistItemDto>>> GetChecklist(Guid id, CancellationToken cancellationToken = default)
    {
        var checklist = await _deliveryService.GetChecklistAsync(id, cancellationToken);
        return Ok(checklist);
    }

    /// <summary>
    /// Creates a new delivery record.
    /// </summary>
    [HttpPost]
    [ProducesResponseType(typeof(DeliveryDetailDto), StatusCodes.Status201Created)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status409Conflict)]
    public async Task<ActionResult<DeliveryDetailDto>> Create([FromBody] CreateDeliveryRequest request, CancellationToken cancellationToken = default)
    {
        var created = await _deliveryService.CreateAsync(request, cancellationToken);
        return CreatedAtAction(nameof(GetById), new { id = created.Id }, created);
    }

    /// <summary>
    /// Schedules or updates delivery appointment date and time window.
    /// </summary>
    [HttpPost("{id:guid}/schedule")]
    [ProducesResponseType(typeof(DeliveryDetailDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<ActionResult<DeliveryDetailDto>> Schedule(Guid id, [FromBody] ScheduleDeliveryRequest request, CancellationToken cancellationToken = default)
    {
        var scheduled = await _deliveryService.ScheduleAsync(id, request, cancellationToken);
        return Ok(scheduled);
    }

    /// <summary>
    /// Updates a specific checklist item (marks complete/incomplete with technician signature).
    /// </summary>
    [HttpPut("{id:guid}/checklist/{itemId:guid}")]
    [ProducesResponseType(typeof(DeliveryDetailDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<ActionResult<DeliveryDetailDto>> UpdateChecklistItem(
        Guid id,
        Guid itemId,
        [FromBody] UpdateChecklistItemRequest request,
        CancellationToken cancellationToken = default)
    {
        var updated = await _deliveryService.UpdateChecklistItemAsync(id, itemId, request, cancellationToken);
        return Ok(updated);
    }

    /// <summary>
    /// Initiates vehicle handover process. Fails if vehicle is not READY_FOR_DELIVERY.
    /// </summary>
    [HttpPost("{id:guid}/start")]
    [ProducesResponseType(typeof(DeliveryDetailDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status409Conflict)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<ActionResult<DeliveryDetailDto>> Start(Guid id, [FromBody] StartDeliveryRequest request, CancellationToken cancellationToken = default)
    {
        var started = await _deliveryService.StartAsync(id, request, cancellationToken);
        return Ok(started);
    }

    /// <summary>
    /// Completes the delivery handover. Fails if mandatory checklist items are incomplete.
    /// </summary>
    [HttpPost("{id:guid}/complete")]
    [ProducesResponseType(typeof(DeliveryDetailDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status409Conflict)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<ActionResult<DeliveryDetailDto>> Complete(Guid id, CancellationToken cancellationToken = default)
    {
        var completed = await _deliveryService.CompleteAsync(id, cancellationToken);
        return Ok(completed);
    }

    /// <summary>
    /// Cancels a delivery with a reason.
    /// </summary>
    [HttpPost("{id:guid}/cancel")]
    [ProducesResponseType(typeof(DeliveryDetailDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status409Conflict)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<ActionResult<DeliveryDetailDto>> Cancel(Guid id, [FromBody] CancelDeliveryRequest request, CancellationToken cancellationToken = default)
    {
        var cancelled = await _deliveryService.CancelAsync(id, request, cancellationToken);
        return Ok(cancelled);
    }

    /// <summary>
    /// Deletes a delivery record.
    /// </summary>
    [HttpDelete("{id:guid}")]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> Delete(Guid id, CancellationToken cancellationToken = default)
    {
        var deleted = await _deliveryService.DeleteAsync(id, cancellationToken);
        if (!deleted)
            return NotFound(new { message = $"Delivery with ID '{id}' was not found." });

        return NoContent();
    }
}
