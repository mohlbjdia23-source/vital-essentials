/**
 * Checkout routes.
 *
 * POST /api/checkout/create-payment-intent
 *   - Validates cart items against DB prices
 *   - Creates a Stripe PaymentIntent with the server-calculated total
 *   - Stores a pending Order (idempotent via idempotencyKey)
 *
 * POST /api/checkout/confirm          (called by Stripe webhook internally)
 * POST /api/checkout/confirm-payment  (legacy – kept for backward compat)
 */

const express = require('express');
const router = express.Router();
const crypto = require('crypto');
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const Product = require('../models/Product');
const Order = require('../models/Order');
const Cart = require('../models/Cart');
const { optionalAuth } = require('../middleware/auth');
const { validateCheckout } = require('../lib/validation');
const { submitToSupplier } = require('../lib/fulfillment');

const FREE_SHIPPING_THRESHOLD = 50; // USD

// ─── Helper: calculate verified totals from DB ─────────────────────────────

async function calcServerTotal(items) {
  const ids = items.map((i) => i.productId);
  const products = await Product.find({ _id: { $in: ids } });
  const productMap = Object.fromEntries(products.map((p) => [p._id.toString(), p]));

  let subtotal = 0;
  const resolvedItems = [];

  for (const item of items) {
    const product = productMap[item.productId];
    if (!product) throw { status: 400, message: `Product ${item.productId} not found` };
    if (!product.isActive) throw { status: 400, message: `Product "${product.name}" is no longer available` };
    if (product.stock < item.quantity) {
      throw { status: 400, message: `Insufficient stock for "${product.name}"` };
    }

    const unitPrice = product.price;
    subtotal += unitPrice * item.quantity;
    resolvedItems.push({
      productId: product._id,
      supplierProductId: product.supplier?.productId,
      supplierSkuId: product.supplier?.skuId,
      name: product.name,
      image: product.image,
      price: unitPrice,
      cost: product.supplier?.cost,
      quantity: item.quantity,
    });
  }

  const shippingCost = subtotal >= FREE_SHIPPING_THRESHOLD ? 0 : 4.99;
  const totalPrice = subtotal + shippingCost;
  return { resolvedItems, subtotal, shippingCost, totalPrice };
}

// ─── POST /api/checkout/create-payment-intent ──────────────────────────────

router.post('/create-payment-intent', optionalAuth, async (req, res) => {
  const { items, shippingAddress, customer, currency = 'usd' } = req.body;

  // Build customer object from body or logged-in user
  const customerData = {
    name: customer?.name || shippingAddress?.name,
    email: customer?.email,
    phone: customer?.phone,
  };

  const { valid, errors } = validateCheckout({
    customer: customerData,
    shippingAddress: {
      line1: shippingAddress?.address || shippingAddress?.line1,
      city: shippingAddress?.city,
      country: shippingAddress?.country,
    },
    items,
  });
  if (!valid) return res.status(400).json({ errors });

  try {
    const { resolvedItems, subtotal, shippingCost, totalPrice } =
      await calcServerTotal(items);

    // Idempotency key = hash of customer email + sorted product IDs + quantities
    const idempotencyKey = crypto
      .createHash('sha256')
      .update(
        customerData.email +
          JSON.stringify(items.map((i) => `${i.productId}:${i.quantity}`).sort())
      )
      .digest('hex');

    // Check if an order with this idempotency key already has a paid intent
    const existingOrder = await Order.findOne({ idempotencyKey });
    if (existingOrder && existingOrder.paymentStatus === 'paid') {
      return res.status(409).json({ error: 'Order already placed' });
    }

    // Create or update the PaymentIntent
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(totalPrice * 100),
      currency,
      metadata: { idempotencyKey },
    });

    // Upsert a pending order so we can fulfil it after the webhook fires
    const shippingAddr = {
      line1: shippingAddress?.address || shippingAddress?.line1 || '',
      city: shippingAddress?.city || '',
      state: shippingAddress?.state || '',
      zip: shippingAddress?.zip || shippingAddress?.postal_code || '',
      country: shippingAddress?.country || 'US',
    };

    if (existingOrder) {
      existingOrder.stripePaymentIntentId = paymentIntent.id;
      await existingOrder.save();
    } else {
      await Order.create({
        userId: req.user?.id,
        customer: customerData,
        shippingAddress: shippingAddr,
        items: resolvedItems,
        subtotal,
        shippingCost,
        totalPrice,
        currency,
        paymentStatus: 'pending',
        fulfillmentStatus: 'pending',
        stripePaymentIntentId: paymentIntent.id,
        idempotencyKey,
        timeline: [{ status: 'pending', note: 'Order created, awaiting payment' }],
      });
    }

    res.json({
      clientSecret: paymentIntent.client_secret,
      orderId: existingOrder?._id,
      subtotal,
      shippingCost,
      totalPrice,
    });
  } catch (err) {
    if (err.status) return res.status(err.status).json({ error: err.message });
    res.status(500).json({ error: err.message });
  }
});

// ─── POST /api/checkout/confirm-payment  (legacy client-side confirmation) ─

router.post('/confirm-payment', optionalAuth, async (req, res) => {
  const { paymentIntentId } = req.body;
  if (!paymentIntentId) {
    return res.status(400).json({ error: 'paymentIntentId is required' });
  }

  try {
    const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);

    if (paymentIntent.status !== 'succeeded') {
      return res.status(400).json({ success: false, message: 'Payment not yet succeeded' });
    }

    const order = await Order.findOne({ stripePaymentIntentId: paymentIntentId });
    if (!order) return res.status(404).json({ error: 'Order not found' });

    if (order.paymentStatus !== 'paid') {
      order.paymentStatus = 'paid';
      order.fulfillmentStatus = 'awaiting_supplier';
      order.addEvent('paid', 'Payment confirmed (client-side)');
      await order.save();
      // Attempt supplier submission asynchronously
      submitToSupplier(order._id).catch(console.error);
    }

    res.json({
      success: true,
      order: {
        _id: order._id,
        customer: order.customer,
        items: order.items,
        totalPrice: order.totalPrice,
        fulfillmentStatus: order.fulfillmentStatus,
        stripePaymentIntentId: order.stripePaymentIntentId,
      },
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ─── Legacy: POST /api/checkout/create-intent (alias) ──────────────────────

router.post('/create-intent', optionalAuth, async (req, res) => {
  // Delegate to the new endpoint logic via redirect-alike passthrough
  const { amount, currency } = req.body;
  if (!amount || amount <= 0) {
    return res.status(400).json({ error: 'A valid amount is required' });
  }
  try {
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(amount * 100),
      currency: currency || 'usd',
    });
    res.json({ clientSecret: paymentIntent.client_secret });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
