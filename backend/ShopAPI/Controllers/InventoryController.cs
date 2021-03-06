using Microsoft.AspNetCore.Mvc;

[ApiController]
public class InventoryController : ControllerBase {
    private readonly IInventoryService _inventoryService;
    private readonly ILogger<InventoryController> _logger;

    public InventoryController(IInventoryService inventoryService, ILogger<InventoryController> logger)
    {
        _inventoryService = inventoryService;
        _logger = logger;
    }

    [HttpGet("/api/inventory")]
    public ActionResult GetCurrentInventory() {
        _logger.LogInformation("Getting all inventory...");
        var inventory = _inventoryService.GetCurrentInventory()
            .Select(pi => new ProductInventoryModel {
                Id = pi.Id,
                Product = ProductMapper.SerializeProductModel(pi.Product),
                IdealQuantity = pi.IdealQuantity,
                QuantityOnHand = pi.QuantityOnHand
            })
            .OrderBy(inventory => inventory.Product.Name)
            .ToList();

        return Ok(inventory);
    }

    [HttpPatch("/api/inventory")]
    public ActionResult UpdateInventory([FromBody] ShipmentModel shipment) {
        _logger.LogInformation($"Updating inventory for {shipment.ProductId} - Adjustment: {shipment.Adjustment}");
        var id = shipment.ProductId;
        var adjustment = shipment.Adjustment;
        var inventory = _inventoryService.UpdateUnitsAvailable(id, adjustment);
        return Ok(inventory);
    }
}