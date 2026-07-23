using WhatsAppOrderNotification.Api.Data;

namespace WhatsAppOrderNotification.Api.Repositories;

public interface ICustomerRepository
{
    Task<List<Customer>> GetAllAsync();
    Task<Customer?> GetByIdAsync(int id);
    Task<bool> ExistsByDocumentAsync(string document, int? excludeId = null);
    Task AddAsync(Customer customer);
    Task<bool> SaveChangesAsync();
    void Remove(Customer customer);
}
