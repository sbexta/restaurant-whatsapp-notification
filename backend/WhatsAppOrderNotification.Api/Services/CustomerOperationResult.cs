using WhatsAppOrderNotification.Api.Data;

namespace WhatsAppOrderNotification.Api.Services;

public class CustomerOperationResult
{
    public bool Success { get; private init; }
    public string? Error { get; private init; }
    public Customer? Customer { get; private init; }

    public static CustomerOperationResult Ok(Customer customer) =>
        new() { Success = true, Customer = customer };

    public static CustomerOperationResult Fail(string error) =>
        new() { Success = false, Error = error };
}
