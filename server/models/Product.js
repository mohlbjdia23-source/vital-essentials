const mongoose = require('mongoose');

const productSchema = new mongoose.Schema(
  {
    // ── Storefront fields ────────────────────────────────────────────────────
    name: { type: String, required: true, trim: true },
    description: { type: String, default: '' },
    price: { type: Number, required: true, min: 0 },
    compareAtPrice: { type: Number, min: 0 }, // crossed-out "was" price
    images: [{ type: String }],           // ordered list; first is primary
    image: { type: String },              // legacy / shorthand alias → first of images
    category: {
      type: String,
      enum: ['Skincare', 'Electronics', 'Home Goods', 'Wellness', 'Fitness', 'Beauty', 'Other'],
      default: 'Other',
    },
    tags: [String],
    stock: { type: Number, default: 0 },
    stockStatus: {
      type: String,
      enum: ['in_stock', 'low_stock', 'backordered', 'unavailable'],
      default: 'in_stock',
    },
    isActive: { type: Boolean, default: true },

    // ── Supplier / dropshipping fields ───────────────────────────────────────
    supplier: {
      name: { type: String, default: 'aliexpress' }, // 'aliexpress' | 'manual' | ...
      productId: String,     // external product ID from supplier
      skuId: String,         // specific variant/SKU ID
      url: String,           // deep link to supplier product page
      cost: { type: Number, min: 0 },    // supplier cost (not shown to customers)
      currency: { type: String, default: 'USD' },
      shippingProfile: { type: String, default: 'ePacket' },
      processingDays: { type: Number, default: 3 },
      lastSyncedAt: Date,
      syncStatus: {
        type: String,
        enum: ['pending', 'synced', 'error', 'manual'],
        default: 'manual',
      },
    },
  },
  { timestamps: true }
);

// Computed margin helper (not stored)
productSchema.virtual('margin').get(function () {
  if (!this.supplier || !this.supplier.cost) return null;
  return Number((this.price - this.supplier.cost).toFixed(2));
});

// Keep legacy `image` field in sync with the first entry of `images[]`
productSchema.pre('save', function (next) {
  if (this.images && this.images.length > 0) {
    this.image = this.images[0];
  } else if (this.image && (!this.images || this.images.length === 0)) {
    this.images = [this.image];
  }
  // Auto-derive stockStatus from stock count
  if (this.stock === 0) {
    this.stockStatus = 'unavailable';
  } else if (this.stock <= 5) {
    this.stockStatus = 'low_stock';
  } else {
    this.stockStatus = 'in_stock';
  }
  next();
});

productSchema.index({ category: 1, isActive: 1 });
productSchema.index({ 'supplier.productId': 1 });
productSchema.index({ name: 'text', description: 'text' });

module.exports = mongoose.model('Product', productSchema);