using Microsoft.AspNetCore.Mvc;
using WhatsAppOrderNotification.Api.Dtos;
using WhatsAppOrderNotification.Api.Services;

namespace WhatsAppOrderNotification.Api.Controllers;

[ApiController]
[Route("customers")]
public class CustomersController : ControllerBase
{
    private readonly ICustomerService _customerService;

    public CustomersController(ICustomerService customerService)
    {
        _customerService = customerService;
    }

    [HttpGet]
    public async Task<IActionResult> GetAll()
    {
        var customers = await _customerService.GetAllAsync();
        return Ok(customers);
    }

    [HttpPost]
    public async Task<IActionResult> Create([FromBody] CreateCustomerRequest request)
    {
        var result = await _customerService.CreateAsync(request);
        if (!result.Success)
        {
            return Conflict(new { error = result.Error });
        }

        return CreatedAtAction(nameof(GetAll), new { id = result.Customer!.Id }, result.Customer);
    }

    [HttpPut("{id:int}")]
    public async Task<IActionResult> Update(int id, [FromBody] UpdateCustomerRequest request)
    {
        var result = await _customerService.UpdateAsync(id, request);
        if (!result.Success)
        {
            return result.Error == "Cliente no encontrado."
                ? NotFound(new { error = result.Error })
                : Conflict(new { error = result.Error });
        }

        return Ok(result.Customer);
    }

    [HttpDelete("{id:int}")]
    public async Task<IActionResult> Delete(int id)
    {
        var deleted = await _customerService.DeleteAsync(id);
        return deleted ? NoContent() : NotFound();
    }

    [HttpPost("{id:int}/ready")]
    public async Task<IActionResult> MarkAsReady(int id)
    {
        var result = await _customerService.MarkAsReadyAsync(id);
        if (!result.Success)
        {
            return result.Error switch
            {
                "Cliente no encontrado." => NotFound(new { error = result.Error }),
                "No se pudo enviar la notificación de WhatsApp." => StatusCode(StatusCodes.Status502BadGateway, new { error = result.Error }),
                _ => Conflict(new { error = result.Error })
            };
        }

        return Ok(result.Customer);
    }
}
