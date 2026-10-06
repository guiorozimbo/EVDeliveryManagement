using EVDelivery.Vehicle.Application.DTOs;
using EVDelivery.Vehicle.Application.Services;
using Microsoft.AspNetCore.Mvc;

namespace EVDelivery.Vehicle.API.Controllers;

[ApiController]
[Route("api/[controller]")]
[Produces("application/json")]
public class VehiclesController : ControllerBase
{
    private readonly IVehicleApplicationService _vehicleService;
    private readonly ILogger<VehiclesController> _logger;

    public VehiclesController(IVehicleApplicationService vehicleService, ILogger<VehiclesController> logger)
    {
        _vehicleService = vehicleService;
        _logger = logger;
    }

    /// <summary>
    /// Retrieves a paginated list of vehicles with optional search, status filtering, and sorting.
    /// </summary>
    [HttpGet]
    [ProducesResponseType(typeof(PagedResult<VehicleDto>), StatusCodes.Status200OK)]
    public async Task<ActionResult<PagedResult<VehicleDto>>> GetPaged(
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 10,
        [FromQuery] string? search = null,
        [FromQuery] string? status = null,
        [FromQuery] string? sortBy = null,
        [FromQuery] bool isAsc = true,
        CancellationToken cancellationToken = default)
    {
        var result = await _vehicleService.GetPagedAsync(page, pageSize, search, status, sortBy, isAsc, cancellationToken);
        return Ok(result);
    }

    /// <summary>
    /// Retrieves full vehicle details and status history by vehicle ID.
    /// </summary>
    [HttpGet("{id:guid}")]
    [ProducesResponseType(typeof(VehicleDetailDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<ActionResult<VehicleDetailDto>> GetById(Guid id, CancellationToken cancellationToken = default)
    {
        var vehicle = await _vehicleService.GetByIdAsync(id, cancellationToken);
        if (vehicle == null)
            return NotFound(new { message = $"Vehicle with ID '{id}' was not found." });

        return Ok(vehicle);
    }

    /// <summary>
    /// Retrieves full vehicle details by VIN.
    /// </summary>
    [HttpGet("vin/{vin}")]
    [ProducesResponseType(typeof(VehicleDetailDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<ActionResult<VehicleDetailDto>> GetByVin(string vin, CancellationToken cancellationToken = default)
    {
        var vehicle = await _vehicleService.GetByVinAsync(vin, cancellationToken);
        if (vehicle == null)
            return NotFound(new { message = $"Vehicle with VIN '{vin}' was not found." });

        return Ok(vehicle);
    }

    /// <summary>
    /// Retrieves vehicle lifecycle status history.
    /// </summary>
    [HttpGet("{id:guid}/history")]
    [ProducesResponseType(typeof(IReadOnlyList<VehicleHistoryDto>), StatusCodes.Status200OK)]
    public async Task<ActionResult<IReadOnlyList<VehicleHistoryDto>>> GetHistory(Guid id, CancellationToken cancellationToken = default)
    {
        var history = await _vehicleService.GetHistoryAsync(id, cancellationToken);
        return Ok(history);
    }

    /// <summary>
    /// Registers a new vehicle in the system.
    /// </summary>
    [HttpPost]
    [ProducesResponseType(typeof(VehicleDetailDto), StatusCodes.Status201Created)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status422UnprocessableEntity)]
    public async Task<ActionResult<VehicleDetailDto>> Create([FromBody] CreateVehicleRequest request, CancellationToken cancellationToken = default)
    {
        var created = await _vehicleService.CreateAsync(request, cancellationToken);
        return CreatedAtAction(nameof(GetById), new { id = created.Id }, created);
    }

    /// <summary>
    /// Updates vehicle metadata.
    /// </summary>
    [HttpPut("{id:guid}")]
    [ProducesResponseType(typeof(VehicleDetailDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<ActionResult<VehicleDetailDto>> Update(Guid id, [FromBody] UpdateVehicleRequest request, CancellationToken cancellationToken = default)
    {
        var updated = await _vehicleService.UpdateAsync(id, request, cancellationToken);
        return Ok(updated);
    }

    /// <summary>
    /// Transitions vehicle status following domain state machine invariants.
    /// </summary>
    [HttpPost("{id:guid}/status")]
    [ProducesResponseType(typeof(VehicleDetailDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status409Conflict)]
    public async Task<ActionResult<VehicleDetailDto>> UpdateStatus(Guid id, [FromBody] UpdateVehicleStatusRequest request, CancellationToken cancellationToken = default)
    {
        var updated = await _vehicleService.UpdateStatusAsync(id, request, cancellationToken);
        return Ok(updated);
    }

    /// <summary>
    /// Updates vehicle telemetry readings (battery percentage, odometer).
    /// </summary>
    [HttpPatch("{id:guid}/telemetry")]
    [ProducesResponseType(typeof(VehicleDetailDto), StatusCodes.Status200OK)]
    public async Task<ActionResult<VehicleDetailDto>> UpdateTelemetry(Guid id, [FromBody] UpdateVehicleTelemetryRequest request, CancellationToken cancellationToken = default)
    {
        var updated = await _vehicleService.UpdateTelemetryAsync(id, request, cancellationToken);
        return Ok(updated);
    }

    /// <summary>
    /// Deletes a vehicle by ID.
    /// </summary>
    [HttpDelete("{id:guid}")]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> Delete(Guid id, CancellationToken cancellationToken = default)
    {
        var deleted = await _vehicleService.DeleteAsync(id, cancellationToken);
        if (!deleted)
            return NotFound(new { message = $"Vehicle with ID '{id}' was not found." });

        return NoContent();
    }
}
