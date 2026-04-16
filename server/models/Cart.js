const mongoose = require('mongoose');

const cartItemSchema = new mongoose.Schema(
  {
    productId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product',
      required: true,
    },
    name: { type: String, required: true },
    price: { type: Number, required: true },
    image: String,
    quantity: { type: Number, required: true, min: 1, default: 1 },
  },
  { _id: false }
);

const cartSchema = new mongoose.Schema(
  {
    // Authenticated users have a userId; guests use a session token stored client-side
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      index: true,
      sparse: true,
    },
    sessionId: {
      type: String,
      index: true,
      sparse: true,
    },
    items: [cartItemSchema],
    // Expire guest carts after 30 days of inactivity
    updatedAt: { type: Date, default: Date.now, index: { expireAfterSeconds: 60 * 60 * 24 * 30 } },
  },
  { timestamps: true }
);

// Total helpers
cartSchema.virtual('total').get(function () {
  return this.items.reduce((sum, i) => sum + i.price * i.quantity, 0);
});

cartSchema.virtual('itemCount').get(function () {
  return this.items.reduce((sum, i) => sum + i.quantity, 0);
});

module.exports = mongoose.model('Cart', cartSchema);