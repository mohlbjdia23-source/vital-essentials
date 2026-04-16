/**
 * Fulfillment orchestration.
 *
 * Responsible for the bridge between a paid order and the supplier.
 * Called after payment succeeds (Stripe webhook or payment confirmation).
 */

const Order = require('../models/Order');
const { getSupplier } = require('../suppliers/index');

const MAX_SUBMIT_ATTEMPTS = 3;

/**
 * Submit a paid order to the appropriate supplier.
 * Safe to call multiple times – idempotent on success.
 *
 * @param {string|object} orderOrId  - Order document or its _id
 */
async function submitToSupplier(orderOrId) {
  let order = orderOrId;
  if (typeof orderOrId === 'string' || orderOrId.constructor.name === 'ObjectId') {
    order = await Order.findById(orderOrId);
  }
  if (!order) throw new Error('Order not found');

  // Already fulfilled – skip
  if (['submitted', 'processing', 'shipped', 'delivered'].includes(order.fulfillmentStatus)) {
    return order;
  }

  if (order.paymentStatus !== 'paid') {
    throw new Error('Cannot submit unpaid order to supplier');
  }

  if (order.supplierSubmitAttempts >= MAX_SUBMIT_ATTEMPTS) {
    // Mark as permanently failed so admin can intervene
    order.fulfillmentStatus = 'failed';
    order.addEvent('failed', `Max supplier submission attempts (${MAX_SUBMIT_ATTEMPTS}) reached`);
    await order.save();
    return order;
  }

  order.supplierSubmitAttempts += 1;
  order.fulfillmentStatus = 'awaiting_supplier';

  try {
    // Group items by supplier (for now always aliexpress)
    const supplierName = order.items[0]?.supplierProductId ? 'aliexpress' : 'manual';
    const supplier = getSupplier(supplierName);

    const supplierItems = order.items
      .filter((i) => i.supplierProductId)
      .map((i) => ({
        supplierProductId: i.supplierProductId,
        supplierSkuId: i.supplierSkuId,
        quantity: i.quantity,
      }));

    if (supplierItems.length === 0) {
      // Manual fulfilment – no automated submission
      order.fulfillmentStatus = 'processing';
      order.addEvent('processing', 'Manual fulfilment – no supplier items to submit');
      await order.save();
      return order;
    }

    const result = await supplier.placeOrder({
      items: supplierItems,
      shippingAddress: {
        name: order.customer.name,
        ...order.shippingAddress,
        phone: order.customer.phone || '',
      },
    });

    order.supplierOrderId = result.supplierOrderId;
    order.fulfillmentStatus = 'submitted';
    order.supplierLastError = undefined;
    order.addEvent('submitted', `Supplier order ${result.supplierOrderId} created`);
  } catch (err) {
    order.supplierLastError = err.message;
    // If still under retry limit keep in awaiting state; next attempt can retry
    if (order.supplierSubmitAttempts >= MAX_SUBMIT_ATTEMPTS) {
      order.fulfillmentStatus = 'failed';
      order.addEvent('failed', `Supplier submission failed: ${err.message}`);
    } else {
      order.fulfillmentStatus = 'awaiting_supplier';
      order.addEvent(
        'awaiting_supplier',
        `Supplier submission attempt ${order.supplierSubmitAttempts} failed: ${err.message}`
      );
    }
  }

  await order.save();
  return order;
}

/**
 * Refresh tracking information for a shipped order from the supplier.
 * @param {string|object} orderOrId
 */
async function refreshTracking(orderOrId) {
  let order = orderOrId;
  if (typeof orderOrId === 'string' || orderOrId.constructor.name === 'ObjectId') {
    order = await Order.findById(orderOrId);
  }
  if (!order) throw new Error('Order not found');
  if (!order.supplierOrderId) return order;

  const supplierName = order.items[0]?.supplierProductId ? 'aliexpress' : 'manual';
  const supplier = getSupplier(supplierName);

  try {
    const tracking = await supplier.getTracking(order.supplierOrderId);
    if (tracking.trackingNumber) {
      order.supplierTrackingNumber = tracking.trackingNumber;
      order.supplierCarrier = tracking.carrier;
      order.supplierTrackingUrl = tracking.trackingUrl;
      if (order.fulfillmentStatus === 'submitted' || order.fulfillmentStatus === 'processing') {
        order.fulfillmentStatus = 'shipped';
        order.addEvent('shipped', `Tracking: ${tracking.trackingNumber} (${tracking.carrier})`);
      }
      await order.save();
    }
  } catch (err) {
    // Non-fatal – tracking lookup can fail transiently
    console.error(`Tracking refresh failed for order ${order._id}:`, err.message);
  }

  return order;
}

module.exports = { submitToSupplier, refreshTracking };
