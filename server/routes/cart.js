/**
 * Cart routes – MongoDB-backed, supports both authenticated users and guests.
 * Guests identify themselves via an `X-Session-Id` header (UUID stored client-side).
 */
const express = require('express');
const router = express.Router();
const Cart = require('../models/Cart');
const Product = require('../models/Product');
const { optionalAuth } = require('../middleware/auth');

router.use(optionalAuth);

function cartFilter(req) {
  if (req.user) return { userId: req.user.id };
  const sessionId = req.headers['x-session-id'];
  if (!sessionId) return null;
  return { sessionId };
}

// GET /api/cart
router.get('/', async (req, res) => {
  const filter = cartFilter(req);
  if (!filter) return res.json({ items: [], total: 0, itemCount: 0 });

  try {
    const cart = await Cart.findOne(filter);
    if (!cart) return res.json({ items: [], total: 0, itemCount: 0 });
    res.json({
      items: cart.items,
      total: cart.total,
      itemCount: cart.itemCount,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/cart/items  – add or increment a product
router.post('/items', async (req, res) => {
  const filter = cartFilter(req);
  if (!filter) return res.status(400).json({ error: 'Session ID or auth token required' });

  const { productId, quantity = 1 } = req.body;
  if (!productId) return res.status(400).json({ error: 'productId is required' });
  const qty = parseInt(quantity, 10);
  if (!qty || qty < 1) return res.status(400).json({ error: 'quantity must be a positive integer' });

  try {
    const product = await Product.findById(productId);
    if (!product) return res.status(404).json({ error: 'Product not found' });
    if (product.stockStatus === 'unavailable') {
      return res.status(400).json({ error: 'Product is out of stock' });
    }

    let cart = await Cart.findOne(filter);
    if (!cart) cart = new Cart(filter);

    const existing = cart.items.find((i) => i.productId.toString() === productId);
    if (existing) {
      existing.quantity += qty;
    } else {
      cart.items.push({
        productId: product._id,
        name: product.name,
        price: product.price,
        image: product.image,
        quantity: qty,
      });
    }
    cart.updatedAt = new Date();
    await cart.save();

    res.status(201).json({ items: cart.items, total: cart.total, itemCount: cart.itemCount });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PUT /api/cart/items/:productId  – set quantity (0 removes)
router.put('/items/:productId', async (req, res) => {
  const filter = cartFilter(req);
  if (!filter) return res.status(400).json({ error: 'Session ID or auth token required' });

  const { quantity } = req.body;
  const qty = parseInt(quantity, 10);
  if (qty == null || isNaN(qty) || qty < 0) {
    return res.status(400).json({ error: 'quantity must be a non-negative integer' });
  }

  try {
    const cart = await Cart.findOne(filter);
    if (!cart) return res.status(404).json({ error: 'Cart not found' });

    if (qty === 0) {
      cart.items = cart.items.filter((i) => i.productId.toString() !== req.params.productId);
    } else {
      const item = cart.items.find((i) => i.productId.toString() === req.params.productId);
      if (!item) return res.status(404).json({ error: 'Item not in cart' });
      item.quantity = qty;
    }
    cart.updatedAt = new Date();
    await cart.save();
    res.json({ items: cart.items, total: cart.total, itemCount: cart.itemCount });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE /api/cart/items/:productId
router.delete('/items/:productId', async (req, res) => {
  const filter = cartFilter(req);
  if (!filter) return res.status(400).json({ error: 'Session ID or auth token required' });

  try {
    const cart = await Cart.findOne(filter);
    if (!cart) return res.status(404).json({ error: 'Cart not found' });

    cart.items = cart.items.filter((i) => i.productId.toString() !== req.params.productId);
    cart.updatedAt = new Date();
    await cart.save();
    res.json({ items: cart.items, total: cart.total, itemCount: cart.itemCount });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE /api/cart  – clear entire cart
router.delete('/', async (req, res) => {
  const filter = cartFilter(req);
  if (!filter) return res.status(400).json({ error: 'Session ID or auth token required' });

  try {
    await Cart.findOneAndDelete(filter);
    res.json({ message: 'Cart cleared' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;