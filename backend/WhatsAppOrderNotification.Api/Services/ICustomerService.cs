using WhatsAppOrderNotification.Api.Data;
using WhatsAppOrderNotification.Api.Dtos;

namespace WhatsAppOrderNotification.Api.Services;

public interface ICustomerService
{
    Task<List<Customer>> GetAllAsync();
    Task<Customer?> GetByIdAsync(int id);
    Task<CustomerOperationResult> CreateAsync(CreateCustomerRequest request);
    Task<CustomerOperationResult> UpdateAsync(int id, UpdateCustomerRequest request);
    Task<bool> DeleteAsync(int id);
    Task<CustomerOperationResult> MarkAsReadyAsync(int id);
}
