using EVDelivery.Delivery.Application.DTOs;
using EVDelivery.Delivery.Domain.Enums;
using FluentValidation;

namespace EVDelivery.Delivery.Application.Validators;

public class CreateDeliveryRequestValidator : AbstractValidator<CreateDeliveryRequest>
{
    public CreateDeliveryRequestValidator()
    {
        RuleFor(x => x.VehicleId)
            .NotEmpty().WithMessage("VehicleId is required.");

        RuleFor(x => x.CustomerId)
            .NotEmpty().WithMessage("CustomerId is required.");

        RuleFor(x => x.DeliveryCenterName)
            .NotEmpty().WithMessage("Delivery center name is required.")
            .MaximumLength(150);

        RuleFor(x => x.DeliveryMethod)
            .Must(m => string.IsNullOrWhiteSpace(m) || Enum.TryParse<DeliveryMethod>(m, true, out _))
            .WithMessage("Invalid delivery method.");

        RuleFor(x => x)
            .Must(x => !x.DeliveryWindowStart.HasValue || !x.DeliveryWindowEnd.HasValue || x.DeliveryWindowStart <= x.DeliveryWindowEnd)
            .WithMessage("DeliveryWindowStart must be before or equal to DeliveryWindowEnd.");
    }
}

public class ScheduleDeliveryRequestValidator : AbstractValidator<ScheduleDeliveryRequest>
{
    public ScheduleDeliveryRequestValidator()
    {
        RuleFor(x => x.AppointmentTime)
            .NotEmpty().WithMessage("Appointment time is required.");

        RuleFor(x => x)
            .Must(x => !x.WindowStart.HasValue || !x.WindowEnd.HasValue || x.WindowStart <= x.WindowEnd)
            .WithMessage("WindowStart must be before or equal to WindowEnd.");
    }
}

public class UpdateChecklistItemRequestValidator : AbstractValidator<UpdateChecklistItemRequest>
{
    public UpdateChecklistItemRequestValidator()
    {
        RuleFor(x => x.Technician)
            .NotEmpty().WithMessage("Technician signature/name is required.");
    }
}
