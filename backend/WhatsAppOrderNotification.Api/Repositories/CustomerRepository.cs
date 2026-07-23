using Microsoft.EntityFrameworkCore;
using WhatsAppOrderNotification.Api.Data;

namespace WhatsAppOrderNotification.Api.Repositories;

public class CustomerRepository : ICustomerRepository
{
    private readonly AppDbContext _context;

    public CustomerRepository(AppDbContext context)
    {
        _context = context;
    }

    public Task<List<Customer>> GetAllAsync() =>
        _context.Customers.OrderBy(c => c.Id).ToListAsync();

    public Task<Customer?> GetByIdAsync(int id) =>
        _context.Customers.FirstOrDefaultAsync(c => c.Id == id);

    public Task<bool> ExistsByDocumentAsync(string document, int? excludeId = null) =>
        _context.Customers.AnyAsync(c => c.Document == document && c.Id != excludeId);

    public async Task AddAsync(Customer customer) =>
        await _context.Customers.AddAsync(customer);

    public void Remove(Customer customer) =>
        _context.Customers.Remove(customer);

    public async Task<bool> SaveChangesAsync() =>
        await _context.SaveChangesAsync() >= 0;
}
