using Microsoft.AspNetCore.Mvc;

[ApiController]
public class OrderController : ControllerBase {
    private readonly ILogger<OrderController> _logger;
    private readonly IOrderService _orderService;
    private readonly ICustomerService _customerService;

    public OrderController(ILogger<OrderController> logger, IOrderService orderService, ICustomerService customerService)
    {
        _logger = logger;
        _orderService = orderService;
        _customerService = customerService;
    }

    [HttpPost("/api/invoice")]
    public ActionResult GenerateNewOrder([FromBody] InvoiceModel invoice) {
        _logger.LogInformation("Generating invoice");
        var order = OrderMapper.SerializerInvoiceToOrder(invoice);
        order.Customer = _customerService.GetById(invoice.CustomerId);
        _orderService.GenerateOpenOrder(order);
        return Ok();
    }
}