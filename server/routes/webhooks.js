/**
 * Stripe webhook handler.
 *
 * Mounted BEFORE express.json() so it can receive the raw body needed
 * for signature verification.
 *
 * Events handled:
 *   payment_intent.succeeded   → mark order as paid, submit to supplier
 *   payment_intent.payment_failed → mark order payment as failed
 *   charge.refunded             → mark order as refunded
 */

const express = require('express');
const router = express.Router();
const rateLimit = require('express-rate-limit');
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const Order = require('../models/Order');
const { submitToSupplier } = require('../lib/fulfillment');

const WEBHOOK_SECRET = process.env.STRIPE_WEBHOOK_SECRET;

// Stripe sends a small number of retries; 100/min is generous for legitimate traffic
const webhookLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
});

router.post('/', webhookLimiter, express.raw({ type: 'application/json' }), async (req, res) => {
  let event;

  try {
    if (WEBHOOK_SECRET) {
      const sig = req.headers['stripe-signature'];
      event = stripe.webhooks.constructEvent(req.body, sig, WEBHOOK_SECRET);
    } else {
      // Development fallback – parse body directly (not secure for production)
      event = JSON.parse(req.body);
    }
  } catch (err) {
    // Do not echo err.message back to the client to prevent XSS via exception text
    console.error('Webhook signature verification failed:', err.message);
    return res.status(400).json({ error: 'Webhook verification failed' });
  }

  try {
    switch (event.type) {
      case 'payment_intent.succeeded': {
        const pi = event.data.object;
        // Ensure the payment intent ID is a string before using in query
        const piId = typeof pi.id === 'string' ? pi.id : null;
        if (!piId) break;
        const order = await Order.findOne({ stripePaymentIntentId: piId });
        if (order && order.paymentStatus !== 'paid') {
          order.paymentStatus = 'paid';
          order.stripeChargeId = typeof pi.latest_charge === 'string' ? pi.latest_charge : undefined;
          order.fulfillmentStatus = 'awaiting_supplier';
          order.addEvent('paid', 'Stripe payment succeeded');
          await order.save();
          // Non-blocking supplier submission
          submitToSupplier(order._id).catch((err) =>
            console.error('Supplier submit failed for order', String(order._id), ':', err.message)
          );
        }
        break;
      }

      case 'payment_intent.payment_failed': {
        const pi = event.data.object;
        const piId = typeof pi.id === 'string' ? pi.id : null;
        if (!piId) break;
        const order = await Order.findOne({ stripePaymentIntentId: piId });
        if (order && order.paymentStatus === 'pending') {
          order.paymentStatus = 'failed';
          const failMsg = pi.last_payment_error?.message;
          order.addEvent('failed', failMsg ? 'Payment failed' : 'Payment failed');
          await order.save();
        }
        break;
      }

      case 'charge.refunded': {
        const charge = event.data.object;
        const piId = typeof charge.payment_intent === 'string' ? charge.payment_intent : null;
        if (!piId) break;
        const order = await Order.findOne({ stripePaymentIntentId: piId });
        if (order) {
          const fullyRefunded = charge.amount_refunded === charge.amount;
          order.paymentStatus = fullyRefunded ? 'refunded' : 'partially_refunded';
          if (fullyRefunded) {
            order.fulfillmentStatus = 'refunded';
            order.addEvent('refunded', 'Charge fully refunded');
          } else {
            order.addEvent('refunded', 'Charge partially refunded');
          }
          await order.save();
        }
        break;
      }

      default:
        // Unhandled event types – ignored
        break;
    }

    res.json({ received: true });
  } catch (err) {
    console.error('Webhook processing error:', err);
    // Return 200 to prevent Stripe from retrying for internal errors
    res.json({ received: true, warning: 'Internal processing error' });
  }
});

module.exports = router;
