/**
 * Supplier registry.
 *
 * All supplier adapters expose the same interface:
 *   searchProducts(keyword, options)
 *   getProduct(supplierProductId)
 *   checkPriceAndStock(supplierProductId)
 *   placeOrder({ items, shippingAddress })
 *   getTracking(supplierOrderId)
 *
 * New suppliers can be added here without touching business logic.
 */

const aliexpress = require('./aliexpress');

const suppliers = {
  aliexpress,
};

/**
 * Get a supplier adapter by name.
 * @param {string} name - e.g. 'aliexpress'
 */
function getSupplier(name = 'aliexpress') {
  const adapter = suppliers[name];
  if (!adapter) throw new Error(`Unknown supplier: ${name}`);
  return adapter;
}

module.exports = { getSupplier, suppliers };
