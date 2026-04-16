const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      maxlength: 100,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    passwordHash: {
      type: String,
      required: true,
    },
    role: {
      type: String,
      enum: ['customer', 'admin'],
      default: 'customer',
    },
    // Saved default shipping address
    address: {
      line1: String,
      city: String,
      state: String,
      zip: String,
      country: { type: String, default: 'US' },
    },
    resetToken: String,
    resetTokenExpiry: Date,
  },
  { timestamps: true }
);

// Never return the password hash in JSON responses
userSchema.set('toJSON', {
  transform(_doc, ret) {
    delete ret.passwordHash;
    delete ret.resetToken;
    delete ret.resetTokenExpiry;
    return ret;
  },
});

// Instance helper – verify a plaintext password
userSchema.methods.verifyPassword = function (plaintext) {
  return bcrypt.compare(plaintext, this.passwordHash);
};

// Static helper – hash a plaintext password
userSchema.statics.hashPassword = function (plaintext) {
  return bcrypt.hash(plaintext, 12);
};

userSchema.index({ email: 1 });

module.exports = mongoose.model('User', userSchema);