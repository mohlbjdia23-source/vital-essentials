import React, { useState, useEffect } from 'react'
import { CardElement, useStripe, useElements } from '@stripe/react-stripe-js'
import { useCart } from '../context/CartContext'
import { useAuth } from '../context/AuthContext'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'

const CARD_ELEMENT_OPTIONS = {
  style: {
    base: {
      fontSize: '16px',
      color: '#374151',
      '::placeholder': { color: '#9CA3AF' },
    },
    invalid: { color: '#EF4444' },
  },
}

export default function Checkout({ onBack }) {
  const stripe = useStripe()
  const elements = useElements()
  const { items, cartTotal, clearCart, setCartOpen } = useCart()
  const { auth } = useAuth()
  const navigate = useNavigate()

  const [form, setForm] = useState({
    name: '',
    email: '',
    address: '',
    city: '',
    state: '',
    zip: '',
    country: 'US',
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  // Pre-fill name + email from logged-in account
  useEffect(() => {
    if (auth?.user) {
      setForm((f) => ({
        ...f,
        name: f.name || auth.user.name || '',
        email: f.email || auth.user.email || '',
      }))
    }
  }, [auth])

  function handleChange(e) {
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }))
  }

  async function handleSubmit(e) {
    e.preventDefault()
    if (!stripe || !elements) return

    setLoading(true)
    setError(null)

    try {
      // Create payment intent on server – server calculates the verified total
      const headers = auth?.token ? { Authorization: `Bearer ${auth.token}` } : {}
      const { data } = await axios.post('/api/checkout/create-payment-intent', {
        items: items.map((i) => ({ productId: i._id, quantity: i.quantity })),
        customer: { name: form.name, email: form.email },
        shippingAddress: {
          name: form.name,
          address: form.address,
          line1: form.address,
          city: form.city,
          state: form.state,
          zip: form.zip,
          country: form.country,
        },
      }, { headers })

      const cardElement = elements.getElement(CardElement)
      const { error: stripeError, paymentIntent } = await stripe.confirmCardPayment(
        data.clientSecret,
        {
          payment_method: {
            card: cardElement,
            billing_details: {
              name: form.name,
              email: form.email,
              address: {
                line1: form.address,
                city: form.city,
                state: form.state,
                postal_code: form.zip,
                country: form.country,
              },
            },
          },
        }
      )

      if (stripeError) {
        setError(stripeError.message)
        setLoading(false)
        return
      }

      if (paymentIntent.status === 'succeeded') {
        // Notify server to finalise the order (idempotent – webhook will also handle this)
        let confirmedOrder = null
        try {
          const { data: confirmData } = await axios.post('/api/checkout/confirm-payment', {
            paymentIntentId: paymentIntent.id,
          })
          confirmedOrder = confirmData.order
        } catch {
          // Non-blocking; webhook will handle the state transition
        }

        clearCart()
        setCartOpen(false)
        navigate('/order-confirmation', {
          state: {
            orderDetails: {
              _id: confirmedOrder?._id,
              name: form.name,
              email: form.email,
              paymentIntentId: paymentIntent.id,
              total: data.totalPrice ?? cartTotal,
              subtotal: data.subtotal,
              shippingCost: data.shippingCost,
              items: items.map((i) => ({ name: i.name, quantity: i.quantity, price: i.price })),
            },
          },
        })
      }
    } catch (err) {
      setError(err.response?.data?.errors?.join(', ') || err.response?.data?.error || err.message || 'Payment failed. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex flex-col flex-1 overflow-hidden">
      {/* Back button */}
      <div className="px-5 py-2 border-b border-gray-100">
        <button
          onClick={onBack}
          className="flex items-center gap-1 text-sm text-emerald-600 hover:underline"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Back to Cart
        </button>
      </div>

      <div className="flex-1 overflow-y-auto px-5 py-4">
        {/* Order summary */}
        <div className="mb-5 bg-gray-50 rounded-xl p-4">
          <h3 className="font-semibold text-gray-700 mb-3 text-sm">Order Summary</h3>
          <ul className="space-y-2 text-sm">
            {items.map((item) => (
              <li key={item._id} className="flex justify-between text-gray-600">
                <span className="truncate max-w-[200px]">{item.name} × {item.quantity}</span>
                <span className="font-medium text-gray-800">${(item.price * item.quantity).toFixed(2)}</span>
              </li>
            ))}
          </ul>
          <div className="border-t border-gray-200 mt-3 pt-3 flex justify-between font-bold">
            <span>Total</span>
            <span className="text-emerald-700">${cartTotal.toFixed(2)}</span>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <h3 className="font-semibold text-gray-700 text-sm">Shipping Information</h3>

          <div className="grid grid-cols-2 gap-3">
            <div className="col-span-2">
              <label className="block text-xs font-medium text-gray-600 mb-1">Full Name *</label>
              <input
                name="name"
                value={form.name}
                onChange={handleChange}
                required
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-400"
                placeholder="Jane Doe"
              />
            </div>
            <div className="col-span-2">
              <label className="block text-xs font-medium text-gray-600 mb-1">Email *</label>
              <input
                name="email"
                type="email"
                value={form.email}
                onChange={handleChange}
                required
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-400"
                placeholder="jane@example.com"
              />
            </div>
            <div className="col-span-2">
              <label className="block text-xs font-medium text-gray-600 mb-1">Address *</label>
              <input
                name="address"
                value={form.address}
                onChange={handleChange}
                required
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-400"
                placeholder="123 Main St"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">City *</label>
              <input
                name="city"
                value={form.city}
                onChange={handleChange}
                required
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-400"
                placeholder="New York"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">State *</label>
              <input
                name="state"
                value={form.state}
                onChange={handleChange}
                required
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-400"
                placeholder="NY"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">ZIP Code *</label>
              <input
                name="zip"
                value={form.zip}
                onChange={handleChange}
                required
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-400"
                placeholder="10001"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Country *</label>
              <select
                name="country"
                value={form.country}
                onChange={handleChange}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-400"
              >
                <option value="US">United States</option>
                <option value="CA">Canada</option>
                <option value="GB">United Kingdom</option>
                <option value="AU">Australia</option>
              </select>
            </div>
          </div>

          <div>
            <h3 className="font-semibold text-gray-700 text-sm mb-2">Payment</h3>
            <div className="border border-gray-300 rounded-lg px-3 py-3 bg-white">
              <CardElement options={CARD_ELEMENT_OPTIONS} />
            </div>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg px-4 py-3">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading || !stripe}
            className="w-full bg-emerald-600 hover:bg-emerald-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white font-bold py-3 rounded-xl transition-colors flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                </svg>
                Processing…
              </>
            ) : (
              `Pay $${cartTotal.toFixed(2)}`
            )}
          </button>
        </form>
      </div>
    </div>
  )
}
