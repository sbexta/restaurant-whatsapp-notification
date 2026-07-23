using System.ComponentModel.DataAnnotations;

namespace WhatsAppOrderNotification.Api.Dtos;

public class UpdateCustomerRequest
{
    [Required, MinLength(1)]
    public string Name { get; set; } = string.Empty;

    [Required, MinLength(1)]
    public string Document { get; set; } = string.Empty;

    [Required, MinLength(1)]
    public string Phone { get; set; } = string.Empty;
}
