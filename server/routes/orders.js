const express = require('express');
const router = express.Router();
const Order = require('../models/Order');
const { requireAuth, requireAdmin, optionalAuth } = require('../middleware/auth');
const { refreshTracking } = require('../lib/fulfillment');
const { isValidEmail } = require('../lib/validation');

// ─── GET /api/orders  – admin sees all; authenticated user sees own orders ──
router.get('/', requireAuth, async (req, res) => {
  try {
    const filter = req.user.role === 'admin' ? {} : { userId: req.user.id };

    const {
      page = 1,
      limit = 20,
      fulfillmentStatus,
      paymentStatus,
    } = req.query;

    // Whitelist status values to prevent injection
    const validFulfillment = ['pending','awaiting_supplier','submitted','processing','shipped','delivered','failed','cancelled','refunded'];
    const validPayment = ['pending','paid','failed','refunded','partially_refunded'];
    if (fulfillmentStatus && validFulfillment.includes(fulfillmentStatus)) filter.fulfillmentStatus = fulfillmentStatus;
    if (paymentStatus && validPayment.includes(paymentStatus)) filter.paymentStatus = paymentStatus;

    const pageNum = Math.max(1, parseInt(page, 10));
    const limitNum = Math.min(100, Math.max(1, parseInt(limit, 10)));
    const skip = (pageNum - 1) * limitNum;

    const [orders, total] = await Promise.all([
      Order.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limitNum),
      Order.countDocuments(filter),
    ]);

    res.json({ orders, total, page: pageNum, totalPages: Math.ceil(total / limitNum) });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ─── GET /api/orders/by-email/:email  – guest order lookup ────────────────
router.get('/by-email/:email', async (req, res) => {
  const email = req.params.email;

  // Validate email before using in DB query to prevent NoSQL injection
  if (!isValidEmail(email)) {
    return res.status(400).json({ message: 'Invalid email address' });
  }

  try {
    const orders = await Order.find({ 'customer.email': email.toLowerCase() })
      .sort({ createdAt: -1 })
      .limit(10);
    res.json(orders);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ─── GET /api/orders/:id ───────────────────────────────────────────────────
router.get('/:id', optionalAuth, async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ message: 'Order not found' });

    // Non-admin users can only view their own orders
    if (req.user && req.user.role !== 'admin') {
      if (order.userId && order.userId.toString() !== req.user.id) {
        return res.status(403).json({ message: 'Access denied' });
      }
    }

    res.json(order);
  } catch (err) {
    if (err.name === 'CastError') return res.status(400).json({ message: 'Invalid order ID' });
    res.status(500).json({ message: err.message });
  }
});

// ─── POST /api/orders  – admin manual order creation ──────────────────────
router.post('/', requireAuth, requireAdmin, async (req, res) => {
  try {
    const order = new Order({
      items: req.body.items,
      totalPrice: req.body.totalPrice,
      subtotal: req.body.subtotal || req.body.totalPrice,
      customer: req.body.customer,
      shippingAddress: req.body.shippingAddress,
    });
    const newOrder = await order.save();
    res.status(201).json(newOrder);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// ─── PUT /api/orders/:id  – admin status / note update ────────────────────
router.put('/:id', requireAuth, requireAdmin, async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ message: 'Order not found' });

    const { fulfillmentStatus, paymentStatus, adminNote, trackingNumber, carrier } = req.body;

    const validFulfillment = ['pending','awaiting_supplier','submitted','processing','shipped','delivered','failed','cancelled','refunded'];
    const validPayment = ['pending','paid','failed','refunded','partially_refunded'];

    if (fulfillmentStatus && validFulfillment.includes(fulfillmentStatus)) {
      order.fulfillmentStatus = fulfillmentStatus;
      order.addEvent(fulfillmentStatus, 'Admin updated status');
    }
    if (paymentStatus && validPayment.includes(paymentStatus)) order.paymentStatus = paymentStatus;
    if (typeof adminNote === 'string') order.adminNote = adminNote.slice(0, 1000);
    if (trackingNumber && typeof trackingNumber === 'string') {
      order.supplierTrackingNumber = trackingNumber.slice(0, 100);
      order.supplierCarrier = carrier && typeof carrier === 'string' ? carrier.slice(0, 100) : order.supplierCarrier;
      order.addEvent('shipped', 'Tracking set by admin');
      if (order.fulfillmentStatus !== 'shipped') order.fulfillmentStatus = 'shipped';
    }

    const updatedOrder = await order.save();
    res.json(updatedOrder);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// ─── POST /api/orders/:id/refresh-tracking  – pull latest from supplier ───
router.post('/:id/refresh-tracking', requireAuth, requireAdmin, async (req, res) => {
  try {
    const order = await refreshTracking(req.params.id);
    res.json(order);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;