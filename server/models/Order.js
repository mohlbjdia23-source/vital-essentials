const mongoose = require('mongoose');

const orderItemSchema = new mongoose.Schema(
  {
    productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product' },
    supplierProductId: String,  // AliExpress product ID at time of order
    supplierSkuId: String,
    name: { type: String, required: true },
    image: String,
    price: { type: Number, required: true },  // customer-facing unit price
    cost: Number,                              // supplier cost at time of order
    quantity: { type: Number, required: true, min: 1 },
  },
  { _id: false }
);

const timelineEventSchema = new mongoose.Schema(
  {
    status: String,
    note: String,
    createdAt: { type: Date, default: Date.now },
  },
  { _id: false }
);

const orderSchema = new mongoose.Schema(
  {
    // ── Customer ─────────────────────────────────────────────────────────────
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', index: true, sparse: true },
    customer: {
      name: { type: String, required: true },
      email: { type: String, required: true },
      phone: String,
    },
    shippingAddress: {
      line1: { type: String, required: true },
      city: { type: String, required: true },
      state: String,
      zip: String,
      country: { type: String, default: 'US' },
    },

    // ── Items ─────────────────────────────────────────────────────────────────
    items: [orderItemSchema],
    subtotal: { type: Number, required: true },
    shippingCost: { type: Number, default: 0 },
    totalPrice: { type: Number, required: true },
    currency: { type: String, default: 'usd' },

    // ── Payment ──────────────────────────────────────────────────────────────
    paymentStatus: {
      type: String,
      enum: ['pending', 'paid', 'failed', 'refunded', 'partially_refunded'],
      default: 'pending',
      index: true,
    },
    stripePaymentIntentId: { type: String, index: true, sparse: true },
    stripeChargeId: String,
    refundId: String,
    idempotencyKey: { type: String, unique: true, sparse: true },

    // ── Fulfillment ──────────────────────────────────────────────────────────
    fulfillmentStatus: {
      type: String,
      enum: [
        'pending',            // awaiting payment confirmation
        'awaiting_supplier',  // paid, to be submitted to supplier
        'submitted',          // sent to supplier, waiting acceptance
        'processing',         // supplier acknowledged
        'shipped',            // supplier provided tracking
        'delivered',          // confirmed delivered
        'failed',             // supplier submission failed
        'cancelled',          // cancelled before fulfilment
        'refunded',           // refund issued
      ],
      default: 'pending',
      index: true,
    },
    supplierOrderId: String,   // ID returned by supplier (e.g. AliExpress order ID)
    supplierTrackingNumber: String,
    supplierCarrier: String,
    supplierTrackingUrl: String,
    supplierSubmitAttempts: { type: Number, default: 0 },
    supplierLastError: String,

    // ── Lifecycle notes ───────────────────────────────────────────────────────
    adminNote: String,
    timeline: [timelineEventSchema],

    // ── Legacy status field (kept for compatibility) ──────────────────────────
    status: {
      type: String,
      enum: ['pending', 'shipped', 'delivered', 'cancelled'],
      default: 'pending',
    },
  },
  { timestamps: true }
);

// Keep legacy `status` in sync with fulfillmentStatus
orderSchema.pre('save', function (next) {
  const map = {
    shipped: 'shipped',
    delivered: 'delivered',
    cancelled: 'cancelled',
    refunded: 'cancelled',
  };
  this.status = map[this.fulfillmentStatus] || 'pending';
  next();
});

// Helper to push a timeline event
orderSchema.methods.addEvent = function (status, note) {
  this.timeline.push({ status, note });
};

orderSchema.index({ 'customer.email': 1 });
orderSchema.index({ createdAt: -1 });

module.exports = mongoose.model('Order', orderSchema);