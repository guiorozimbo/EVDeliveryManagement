using EVDelivery.Delivery.Domain.Common;
using EVDelivery.Delivery.Domain.Enums;

namespace EVDelivery.Delivery.Domain.Entities;

public class DeliveryChecklistItem : Entity
{
    public Guid DeliveryId { get; private set; }
    public ChecklistType Type { get; private set; }
    public bool Completed { get; private set; }
    public DateTimeOffset? CompletedAt { get; private set; }
    public string? CompletedBy { get; private set; }
    public string? Notes { get; private set; }
    public bool IsMandatory { get; private set; }

    // Required by EF Core
    private DeliveryChecklistItem() { }

    public DeliveryChecklistItem(Guid deliveryId, ChecklistType type, bool isMandatory = true)
    {
        DeliveryId = deliveryId;
        Type = type;
        Completed = false;
        IsMandatory = isMandatory;
    }

    public void MarkCompleted(string completedBy, string? notes = null)
    {
        if (string.IsNullOrWhiteSpace(completedBy))
            throw new DomainException("CompletedBy technician signature is required to complete checklist item.");

        Completed = true;
        CompletedAt = DateTimeOffset.UtcNow;
        CompletedBy = completedBy.Trim();
        if (!string.IsNullOrWhiteSpace(notes))
        {
            Notes = notes.Trim();
        }
    }

    public void MarkPending(string resetBy, string? notes = null)
    {
        Completed = false;
        CompletedAt = null;
        CompletedBy = null;
        Notes = notes?.Trim();
    }
}
