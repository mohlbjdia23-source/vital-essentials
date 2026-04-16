/**
 * Lightweight validation helpers.
 * Returns { valid: boolean, errors: string[] }
 */

function validateCheckout({ customer, shippingAddress, items }) {
  const errors = [];

  if (!customer?.name?.trim()) errors.push('Customer name is required');
  if (!customer?.email?.trim()) errors.push('Customer email is required');
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(customer?.email || '')) {
    errors.push('Customer email is invalid');
  }

  if (!shippingAddress?.line1?.trim()) errors.push('Shipping address line 1 is required');
  if (!shippingAddress?.city?.trim()) errors.push('Shipping city is required');
  if (!shippingAddress?.country?.trim()) errors.push('Shipping country is required');

  if (!Array.isArray(items) || items.length === 0) {
    errors.push('Order must contain at least one item');
  } else {
    items.forEach((item, i) => {
      if (!item.productId) errors.push(`Item ${i + 1}: productId is required`);
      if (!Number.isInteger(item.quantity) || item.quantity < 1) {
        errors.push(`Item ${i + 1}: quantity must be a positive integer`);
      }
    });
  }

  return { valid: errors.length === 0, errors };
}

function validateProduct({ name, price }) {
  const errors = [];
  if (!name?.trim()) errors.push('Product name is required');
  if (price == null || isNaN(price) || price < 0) errors.push('Price must be a non-negative number');
  return { valid: errors.length === 0, errors };
}

function validateUserRegistration({ name, email, password }) {
  const errors = [];
  if (!name?.trim()) errors.push('Name is required');
  if (!email?.trim()) errors.push('Email is required');
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email || '')) errors.push('Email is invalid');
  if (!password || password.length < 8) errors.push('Password must be at least 8 characters');
  return { valid: errors.length === 0, errors };
}

module.exports = { validateCheckout, validateProduct, validateUserRegistration };
