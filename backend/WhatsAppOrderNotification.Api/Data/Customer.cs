namespace WhatsAppOrderNotification.Api.Data;

public class Customer
{
    public int Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string Document { get; set; } = string.Empty;
    public string Phone { get; set; } = string.Empty;
    public CustomerStatus Status { get; set; } = CustomerStatus.Pendiente;
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
}
