import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import axios from 'axios'

const STATUS_LABELS = {
  pending: 'Order Received',
  awaiting_supplier: 'Processing',
  submitted: 'Submitted to Supplier',
  processing: 'Being Prepared',
  shipped: 'Shipped',
  delivered: 'Delivered',
  failed: 'Fulfilment Issue',
  cancelled: 'Cancelled',
  refunded: 'Refunded',
}

const STATUS_PILL = {
  pending: 'bg-yellow-100 text-yellow-700',
  awaiting_supplier: 'bg-blue-100 text-blue-700',
  submitted: 'bg-blue-100 text-blue-700',
  processing: 'bg-indigo-100 text-indigo-700',
  shipped: 'bg-emerald-100 text-emerald-700',
  delivered: 'bg-emerald-100 text-emerald-700',
  failed: 'bg-red-100 text-red-700',
  cancelled: 'bg-gray-100 text-gray-500',
  refunded: 'bg-gray-100 text-gray-500',
}

export default function Orders() {
  const [email, setEmail] = useState('')
  const [submitted, setSubmitted] = useState(false)
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  async function handleLookup(e) {
    e.preventDefault()
    if (!email.trim()) return
    setLoading(true)
    setError(null)
    try {
      const { data } = await axios.get(`/api/orders/by-email/${encodeURIComponent(email.trim())}`)
      setOrders(data)
      setSubmitted(true)
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to look up orders')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <h1 className="text-3xl font-bold text-gray-900 mb-2">Order History</h1>
      <p className="text-gray-500 text-sm mb-8">Enter the email address used at checkout to view your orders.</p>

      {/* Email lookup form */}
      <form onSubmit={handleLookup} className="flex gap-3 mb-10">
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="your@email.com"
          required
          className="flex-1 border border-gray-300 rounded-full px-5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-400"
        />
        <button
          type="submit"
          disabled={loading}
          className="bg-emerald-600 hover:bg-emerald-700 disabled:bg-gray-300 text-white font-semibold px-6 py-2.5 rounded-full text-sm transition-colors"
        >
          {loading ? 'Looking up…' : 'Look Up Orders'}
        </button>
      </form>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl px-5 py-4 mb-6 text-sm">
          {error}
        </div>
      )}

      {submitted && (
        <>
          {orders.length === 0 ? (
            <div className="text-center py-16 text-gray-400">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 mx-auto mb-4 opacity-40" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
              <p className="font-medium text-gray-500">No orders found for {email}</p>
              <p className="text-sm mt-1">Check your email address and try again.</p>
            </div>
          ) : (
            <div className="space-y-4">
              <p className="text-sm text-gray-500 mb-4">{orders.length} order{orders.length !== 1 ? 's' : ''} found</p>
              {orders.map((order) => (
                <div key={order._id} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
                  <div className="flex items-start justify-between gap-4 mb-4">
                    <div>
                      <p className="text-xs text-gray-400 mb-1">Order ID</p>
                      <p className="font-mono text-sm text-gray-700 break-all">{order._id}</p>
                    </div>
                    <span className={`flex-shrink-0 text-xs font-semibold px-3 py-1 rounded-full ${STATUS_PILL[order.fulfillmentStatus] || 'bg-gray-100 text-gray-500'}`}>
                      {STATUS_LABELS[order.fulfillmentStatus] || order.fulfillmentStatus}
                    </span>
                  </div>

                  {/* Items */}
                  <div className="space-y-1 mb-4">
                    {order.items?.map((item, i) => (
                      <div key={i} className="flex justify-between text-sm text-gray-600">
                        <span className="truncate max-w-[250px]">{item.name} × {item.quantity}</span>
                        <span className="font-medium text-gray-800">${(item.price * item.quantity).toFixed(2)}</span>
                      </div>
                    ))}
                  </div>

                  <div className="flex items-center justify-between text-sm border-t border-gray-100 pt-3">
                    <div className="text-gray-500">
                      {new Date(order.createdAt).toLocaleDateString('en-US', {
                        year: 'numeric', month: 'short', day: 'numeric',
                      })}
                    </div>
                    <div className="font-bold text-emerald-700">
                      Total: ${Number(order.totalPrice).toFixed(2)}
                    </div>
                  </div>

                  {/* Tracking */}
                  {order.supplierTrackingNumber && (
                    <div className="mt-3 pt-3 border-t border-gray-100 text-sm">
                      <span className="text-gray-500">Tracking: </span>
                      {order.supplierTrackingUrl ? (
                        <a
                          href={order.supplierTrackingUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-emerald-600 hover:underline"
                        >
                          {order.supplierTrackingNumber}
                        </a>
                      ) : (
                        <span className="text-gray-700">{order.supplierTrackingNumber}</span>
                      )}
                      {order.supplierCarrier && <span className="text-gray-400 ml-1">({order.supplierCarrier})</span>}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </>
      )}

      <div className="mt-12 text-center">
        <Link to="/products" className="text-emerald-600 hover:underline font-medium text-sm">
          ← Continue Shopping
        </Link>
      </div>
    </div>
  )
}
