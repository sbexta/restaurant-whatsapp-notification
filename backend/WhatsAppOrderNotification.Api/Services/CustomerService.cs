using WhatsAppOrderNotification.Api.Data;
using WhatsAppOrderNotification.Api.Dtos;
using WhatsAppOrderNotification.Api.Repositories;

namespace WhatsAppOrderNotification.Api.Services;

public class CustomerService : ICustomerService
{
    private readonly ICustomerRepository _repository;
    private readonly IReadyNotificationClient _notificationClient;

    public CustomerService(ICustomerRepository repository, IReadyNotificationClient notificationClient)
    {
        _repository = repository;
        _notificationClient = notificationClient;
    }

    public Task<List<Customer>> GetAllAsync() => _repository.GetAllAsync();

    public Task<Customer?> GetByIdAsync(int id) => _repository.GetByIdAsync(id);

    public async Task<CustomerOperationResult> CreateAsync(CreateCustomerRequest request)
    {
        var name = request.Name.Trim();
        var document = request.Document.Trim();
        var phone = request.Phone.Trim();

        if (name.Length == 0 || phone.Length == 0 || document.Length == 0)
        {
            return CustomerOperationResult.Fail("Nombre, cédula y teléfono son obligatorios.");
        }

        if (await _repository.ExistsByDocumentAsync(document))
        {
            return CustomerOperationResult.Fail("Ya existe un cliente con esa cédula.");
        }

        var customer = new Customer
        {
            Name = name,
            Document = document,
            Phone = phone,
            Status = CustomerStatus.Pendiente,
            CreatedAt = DateTime.UtcNow
        };

        await _repository.AddAsync(customer);
        await _repository.SaveChangesAsync();

        return CustomerOperationResult.Ok(customer);
    }

    public async Task<CustomerOperationResult> UpdateAsync(int id, UpdateCustomerRequest request)
    {
        var customer = await _repository.GetByIdAsync(id);
        if (customer is null)
        {
            return CustomerOperationResult.Fail("Cliente no encontrado.");
        }

        var name = request.Name.Trim();
        var document = request.Document.Trim();
        var phone = request.Phone.Trim();

        if (name.Length == 0 || phone.Length == 0 || document.Length == 0)
        {
            return CustomerOperationResult.Fail("Nombre, cédula y teléfono son obligatorios.");
        }

        if (await _repository.ExistsByDocumentAsync(document, excludeId: id))
        {
            return CustomerOperationResult.Fail("Ya existe un cliente con esa cédula.");
        }

        customer.Name = name;
        customer.Document = document;
        customer.Phone = phone;

        await _repository.SaveChangesAsync();

        return CustomerOperationResult.Ok(customer);
    }

    public async Task<bool> DeleteAsync(int id)
    {
        var customer = await _repository.GetByIdAsync(id);
        if (customer is null)
        {
            return false;
        }

        _repository.Remove(customer);
        await _repository.SaveChangesAsync();
        return true;
    }

    public async Task<CustomerOperationResult> MarkAsReadyAsync(int id)
    {
        var customer = await _repository.GetByIdAsync(id);
        if (customer is null)
        {
            return CustomerOperationResult.Fail("Cliente no encontrado.");
        }

        if (customer.Status != CustomerStatus.Pendiente)
        {
            return CustomerOperationResult.Fail("El cliente no está en estado Pendiente.");
        }

        var notified = await _notificationClient.SendAsync(customer.Name, customer.Phone);
        if (!notified)
        {
            return CustomerOperationResult.Fail("No se pudo enviar la notificación de WhatsApp.");
        }

        customer.Status = CustomerStatus.Listo;
        await _repository.SaveChangesAsync();

        return CustomerOperationResult.Ok(customer);
    }
}
