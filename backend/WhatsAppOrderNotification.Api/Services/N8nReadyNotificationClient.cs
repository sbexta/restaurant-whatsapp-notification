using System.Net.Http.Json;

namespace WhatsAppOrderNotification.Api.Services;

public class N8nReadyNotificationClient : IReadyNotificationClient
{
    private readonly HttpClient _httpClient;
    private readonly IConfiguration _configuration;
    private readonly ILogger<N8nReadyNotificationClient> _logger;

    public N8nReadyNotificationClient(HttpClient httpClient, IConfiguration configuration, ILogger<N8nReadyNotificationClient> logger)
    {
        _httpClient = httpClient;
        _configuration = configuration;
        _logger = logger;
    }

    public async Task<bool> SendAsync(string name, string phone)
    {
        var webhookUrl = _configuration["N8n:WebhookUrl"];
        if (string.IsNullOrWhiteSpace(webhookUrl))
        {
            _logger.LogError("N8n:WebhookUrl no está configurado.");
            return false;
        }

        var webhookSecret = _configuration["N8n:WebhookSecret"];

        try
        {
            using var request = new HttpRequestMessage(HttpMethod.Post, webhookUrl)
            {
                Content = JsonContent.Create(new { name, phone })
            };
            if (!string.IsNullOrWhiteSpace(webhookSecret))
            {
                request.Headers.Add("X-Webhook-Secret", webhookSecret);
            }

            var response = await _httpClient.SendAsync(request);
            if (!response.IsSuccessStatusCode)
            {
                _logger.LogWarning("El webhook de n8n respondió con {StatusCode}.", response.StatusCode);
            }

            return response.IsSuccessStatusCode;
        }
        catch (HttpRequestException ex)
        {
            _logger.LogWarning(ex, "No se pudo contactar el webhook de n8n en {WebhookUrl}.", webhookUrl);
            return false;
        }
    }
}
