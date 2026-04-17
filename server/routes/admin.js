/**
 * Admin routes – all require admin role.
 *
 * Product catalog sync with supplier:
 *   POST /api/admin/products/import   – import a product from supplier by ID
 *   POST /api/admin/products/sync     – refresh price/stock for active products
 *
 * Fulfillment queue:
 *   GET  /api/admin/fulfillment/queue – orders awaiting supplier submission
 *   POST /api/admin/fulfillment/:id/submit  – manually trigger supplier submission
 *   POST /api/admin/fulfillment/:id/cancel  – cancel an order
 *
 * Refunds:
 *   POST /api/admin/orders/:id/refund
 */

const express = require('express');
const router = express.Router();
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const Product = require('../models/Product');
const Order = require('../models/Order');
const { requireAuth, requireAdmin } = require('../middleware/auth');
const { getSupplier } = require('../suppliers/index');
const { submitToSupplier } = require('../lib/fulfillment');

router.use(requireAuth, requireAdmin);

// ─── Catalog: import a new product from supplier ───────────────────────────

/**
 * POST /api/admin/products/import
 * Body: { supplierName, supplierProductId, price, category }
 *
 * Fetches product data from the supplier and creates a local Product record.
 * The admin must supply a retail `price` (markup over supplier cost).
 */
router.post('/products/import', async (req, res) => {
  const { supplierName = 'aliexpress', supplierProductId, price, category } = req.body;
  if (!supplierProductId || typeof supplierProductId !== 'string') {
    return res.status(400).json({ error: 'supplierProductId is required and must be a string' });
  }
  if (!price || isNaN(price)) return res.status(400).json({ error: 'retail price is required' });

  try {
    const adapter = getSupplier(supplierName);
    const raw = await adapter.getProduct(supplierProductId);

    // Check if already imported (supplierProductId already validated as string above)
    const existing = await Product.findOne({ 'supplier.productId': supplierProductId.slice(0, 200) });
    if (existing) {
      return res.status(409).json({ error: 'Product already imported', product: existing });
    }

    const product = await Product.create({
      name: raw.name,
      description: raw.description,
      price: parseFloat(price),
      images: raw.images,
      image: raw.image,
      category: category || 'Other',
      stock: 100, // assume in-stock; will be refined on sync
      supplier: {
        name: supplierName,
        productId: raw.supplierProductId,
        url: raw.url,
        cost: raw.cost,
        currency: raw.currency,
        shippingProfile: raw.shippingProfile,
        processingDays: raw.processingDays,
        lastSyncedAt: new Date(),
        syncStatus: 'synced',
      },
    });

    res.status(201).json(product);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ─── Catalog: sync price and stock for all active supplier products ─────────

/**
 * POST /api/admin/products/sync
 * Refreshes cost and stock for all products that have supplier data.
 */
router.post('/products/sync', async (req, res) => {
  try {
    const products = await Product.find({
      isActive: true,
      'supplier.productId': { $exists: true, $ne: '' },
    });

    const results = [];
    for (const product of products) {
      try {
        const adapter = getSupplier(product.supplier.name || 'aliexpress');
        const { cost, stockAvailable } = await adapter.checkPriceAndStock(product.supplier.productId);

        product.supplier.cost = cost;
        product.supplier.lastSyncedAt = new Date();
        product.supplier.syncStatus = 'synced';
        product.stock = stockAvailable ? (product.stock || 10) : 0;
        await product.save();

        results.push({ id: product._id, status: 'synced', cost, stockAvailable });
      } catch (err) {
        product.supplier.syncStatus = 'error';
        product.supplier.lastSyncedAt = new Date();
        await product.save();
        results.push({ id: product._id, status: 'error', error: err.message });
      }
    }

    res.json({ synced: results.filter((r) => r.status === 'synced').length, results });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ─── Fulfillment queue ─────────────────────────────────────────────────────

/**
 * GET /api/admin/fulfillment/queue
 * Orders that are paid but have not yet been successfully submitted to a supplier.
 */
router.get('/fulfillment/queue', async (req, res) => {
  try {
    const orders = await Order.find({
      paymentStatus: 'paid',
      fulfillmentStatus: { $in: ['awaiting_supplier', 'failed'] },
    }).sort({ createdAt: 1 });
    res.json(orders);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/**
 * POST /api/admin/fulfillment/:id/submit
 * Manually trigger supplier submission for an order.
 */
router.post('/fulfillment/:id/submit', async (req, res) => {
  try {
    const order = await submitToSupplier(req.params.id);
    res.json(order);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/**
 * POST /api/admin/fulfillment/:id/cancel
 */
router.post('/fulfillment/:id/cancel', async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ error: 'Order not found' });
    if (['shipped', 'delivered'].includes(order.fulfillmentStatus)) {
      return res.status(400).json({ error: 'Cannot cancel an already shipped order' });
    }
    order.fulfillmentStatus = 'cancelled';
    order.addEvent('cancelled', req.body.reason || 'Cancelled by admin');
    await order.save();
    res.json(order);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ─── Refund ────────────────────────────────────────────────────────────────

/**
 * POST /api/admin/orders/:id/refund
 * Body: { amount? } – omit for full refund
 */
router.post('/orders/:id/refund', async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ error: 'Order not found' });
    if (!order.stripePaymentIntentId) {
      return res.status(400).json({ error: 'No payment intent linked to this order' });
    }

    const refundParams = {
      payment_intent: order.stripePaymentIntentId,
    };
    if (req.body.amount) {
      refundParams.amount = Math.round(parseFloat(req.body.amount) * 100);
    }

    const refund = await stripe.refunds.create(refundParams);

    const isPartial = refund.amount < order.totalPrice * 100;
    order.paymentStatus = isPartial ? 'partially_refunded' : 'refunded';
    order.fulfillmentStatus = 'refunded';
    order.refundId = refund.id;
    order.addEvent('refunded', `Refund ${refund.id} issued ($${(refund.amount / 100).toFixed(2)})`);
    await order.save();

    res.json({ refund, order });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
