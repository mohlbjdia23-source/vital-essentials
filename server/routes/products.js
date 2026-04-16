const express = require('express');
const router = express.Router();
const Product = require('../models/Product');
const { requireAuth, requireAdmin, optionalAuth } = require('../middleware/auth');
const { validateProduct } = require('../lib/validation');

// ─── GET /api/products  – public, paginated, filterable ────────────────────
router.get('/', async (req, res) => {
  try {
    const {
      search,
      category,
      limit = 20,
      page = 1,
      sort = 'createdAt',
      order = 'desc',
    } = req.query;

    const filter = { isActive: true };

    if (category && category !== 'All') {
      filter.category = category;
    }

    if (search) {
      // Use text index if available, fall back to regex
      try {
        filter.$text = { $search: search };
      } catch {
        filter.$or = [
          { name: { $regex: search, $options: 'i' } },
          { description: { $regex: search, $options: 'i' } },
        ];
      }
    }

    const pageNum = Math.max(1, parseInt(page, 10));
    const limitNum = Math.min(100, Math.max(1, parseInt(limit, 10)));
    const skip = (pageNum - 1) * limitNum;
    const sortOrder = order === 'asc' ? 1 : -1;
    const sortField = ['price', 'name', 'createdAt', 'stock'].includes(sort) ? sort : 'createdAt';

    const [products, total] = await Promise.all([
      Product.find(filter)
        .sort({ [sortField]: sortOrder })
        .skip(skip)
        .limit(limitNum),
      Product.countDocuments(filter),
    ]);

    res.json({
      products,
      total,
      page: pageNum,
      totalPages: Math.ceil(total / limitNum),
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ─── GET /api/products/:id ─────────────────────────────────────────────────
router.get('/:id', async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ message: 'Product not found' });
    res.json(product);
  } catch (err) {
    if (err.name === 'CastError') return res.status(400).json({ message: 'Invalid product ID' });
    res.status(500).json({ message: err.message });
  }
});

// ─── Admin-only write operations ────────────────────────────────────────────

// POST /api/products
router.post('/', requireAuth, requireAdmin, async (req, res) => {
  const { valid, errors } = validateProduct(req.body);
  if (!valid) return res.status(400).json({ errors });

  try {
    const product = new Product({
      name: req.body.name,
      description: req.body.description,
      price: req.body.price,
      compareAtPrice: req.body.compareAtPrice,
      image: req.body.image,
      images: req.body.images,
      stock: req.body.stock,
      category: req.body.category,
      tags: req.body.tags,
      supplier: req.body.supplier,
      isActive: req.body.isActive !== false,
    });
    const newProduct = await product.save();
    res.status(201).json(newProduct);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// PUT /api/products/:id
router.put('/:id', requireAuth, requireAdmin, async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ message: 'Product not found' });

    const updatableFields = [
      'name', 'description', 'price', 'compareAtPrice', 'image', 'images',
      'stock', 'category', 'tags', 'supplier', 'isActive',
    ];
    updatableFields.forEach((field) => {
      if (req.body[field] !== undefined) product[field] = req.body[field];
    });

    const updatedProduct = await product.save();
    res.json(updatedProduct);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// DELETE /api/products/:id  – soft-delete (set isActive = false)
router.delete('/:id', requireAuth, requireAdmin, async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ message: 'Product not found' });
    product.isActive = false;
    await product.save();
    res.json({ message: 'Product deactivated' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;