namespace WhatsAppOrderNotification.Api.Services;

public interface IReadyNotificationClient
{
    Task<bool> SendAsync(string name, string phone);
}
