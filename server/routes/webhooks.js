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
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const Order = require('../models/Order');
const { submitToSupplier } = require('../lib/fulfillment');

const WEBHOOK_SECRET = process.env.STRIPE_WEBHOOK_SECRET;

router.post('/', express.raw({ type: 'application/json' }), async (req, res) => {
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
    console.error('Webhook signature verification failed:', err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  try {
    switch (event.type) {
      case 'payment_intent.succeeded': {
        const pi = event.data.object;
        const order = await Order.findOne({ stripePaymentIntentId: pi.id });
        if (order && order.paymentStatus !== 'paid') {
          order.paymentStatus = 'paid';
          order.stripeChargeId = pi.latest_charge;
          order.fulfillmentStatus = 'awaiting_supplier';
          order.addEvent('paid', `Stripe payment ${pi.id} succeeded`);
          await order.save();
          // Non-blocking supplier submission
          submitToSupplier(order._id).catch((err) =>
            console.error(`Supplier submit failed for order ${order._id}:`, err.message)
          );
        }
        break;
      }

      case 'payment_intent.payment_failed': {
        const pi = event.data.object;
        const order = await Order.findOne({ stripePaymentIntentId: pi.id });
        if (order && order.paymentStatus === 'pending') {
          order.paymentStatus = 'failed';
          order.addEvent('failed', `Payment failed: ${pi.last_payment_error?.message || 'unknown'}`);
          await order.save();
        }
        break;
      }

      case 'charge.refunded': {
        const charge = event.data.object;
        const order = await Order.findOne({ stripePaymentIntentId: charge.payment_intent });
        if (order) {
          const fullyRefunded = charge.amount_refunded === charge.amount;
          order.paymentStatus = fullyRefunded ? 'refunded' : 'partially_refunded';
          if (fullyRefunded) {
            order.fulfillmentStatus = 'refunded';
            order.addEvent('refunded', `Charge ${charge.id} fully refunded`);
          } else {
            order.addEvent('refunded', `Charge ${charge.id} partially refunded`);
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
    res.json({ received: true, warning: err.message });
  }
});

module.exports = router;
