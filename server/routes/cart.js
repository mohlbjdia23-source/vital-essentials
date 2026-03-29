// Shopping Cart Endpoints

const express = require('express');
const router = express.Router();

// Mock database for cart items
let cart = [];

// GET /cart - Retrieve user cart
router.get('/cart', (req, res) => {
    res.json(cart);
});

// POST /cart/items - Add product to cart
router.post('/cart/items', (req, res) => {
    const { id, product, quantity } = req.body;
    cart.push({ id, product, quantity });
    res.status(201).json({ message: 'Item added to cart', item: { id, product, quantity } });
});

// PUT /cart/items/:id - Update quantity
router.put('/cart/items/:id', (req, res) => {
    const { id } = req.params;
    const { quantity } = req.body;
    const item = cart.find(item => item.id === id);
    if (item) {
        item.quantity = quantity;
        res.json({ message: 'Item quantity updated', item });
    } else {
        res.status(404).json({ message: 'Item not found' });
    }
});

// DELETE /cart/items/:id - Remove item
router.delete('/cart/items/:id', (req, res) => {
    const { id } = req.params;
    cart = cart.filter(item => item.id !== id);
    res.json({ message: 'Item removed from cart' });
});

// POST /cart/checkout - Convert cart to order
router.post('/cart/checkout', (req, res) => {
    if (cart.length === 0) {
        return res.status(400).json({ message: 'Cart is empty' });
    }
    // Here, you would typically handle order processing
    res.json({ message: 'Order placed', order: cart });
    cart = []; // Clear the cart after checkout
});

module.exports = router;