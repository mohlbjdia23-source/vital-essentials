import React, { useEffect, useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import axios from 'axios'

const STATUS_LABELS = {
  pending: 'Order Received',
  awaiting_supplier: 'Processing',
  submitted: 'Submitted to Supplier',
  processing: 'Being Prepared',
  shipped: 'Shipped',
  delivered: 'Delivered',
  failed: 'Fulfilment Issue – Contact Support',
  cancelled: 'Cancelled',
  refunded: 'Refunded',
}

const STATUS_COLOURS = {
  pending: 'text-yellow-600 bg-yellow-50',
  awaiting_supplier: 'text-blue-600 bg-blue-50',
  submitted: 'text-blue-600 bg-blue-50',
  processing: 'text-indigo-600 bg-indigo-50',
  shipped: 'text-emerald-700 bg-emerald-50',
  delivered: 'text-emerald-700 bg-emerald-50',
  failed: 'text-red-600 bg-red-50',
  cancelled: 'text-gray-500 bg-gray-100',
  refunded: 'text-gray-500 bg-gray-100',
}

export default function OrderConfirmation() {
  const { state } = useLocation()
  const navOrder = state?.orderDetails

  const [liveOrder, setLiveOrder] = useState(null)
  const [loadingLive, setLoadingLive] = useState(false)

  // If we have a persisted order ID, fetch the live version from the server
  useEffect(() => {
    if (!navOrder?._id) return
    setLoadingLive(true)
    axios
      .get(`/api/orders/${navOrder._id}`)
      .then((res) => setLiveOrder(res.data))
      .catch(() => null)
      .finally(() => setLoadingLive(false))
  }, [navOrder?._id])

  const order = liveOrder || navOrder

  return (
    <div className="min-h-[70vh] flex items-center justify-center px-4 py-16 bg-gray-50">
      <div className="max-w-lg w-full bg-white rounded-3xl shadow-md p-8 md:p-12 text-center">
        {/* Success Icon */}
        <div className="mx-auto mb-6 w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
          </svg>
        </div>

        <h1 className="text-3xl font-extrabold text-gray-900 mb-2">Order Confirmed!</h1>
        <p className="text-gray-500 text-base mb-8">
          Thank you for your purchase. You'll receive a confirmation email shortly.
        </p>

        {/* Fulfilment status badge */}
        {order?.fulfillmentStatus && (
          <div className={`inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full text-sm font-semibold mb-6 ${STATUS_COLOURS[order.fulfillmentStatus] || 'text-gray-600 bg-gray-100'}`}>
            <span className="w-1.5 h-1.5 rounded-full bg-current" />
            {STATUS_LABELS[order.fulfillmentStatus] || order.fulfillmentStatus}
            {loadingLive && <span className="ml-1 opacity-50 text-xs">(refreshing…)</span>}
          </div>
        )}

        {/* Order details */}
        {order && (
          <div className="bg-gray-50 rounded-2xl p-5 mb-8 text-left">
            <h2 className="font-bold text-gray-800 text-sm mb-4 uppercase tracking-wider">Order Summary</h2>

            {order.name && (
              <p className="text-sm text-gray-600 mb-1">
                <span className="font-medium text-gray-800">Name:</span> {order.name}
              </p>
            )}
            {order.email && (
              <p className="text-sm text-gray-600 mb-3">
                <span className="font-medium text-gray-800">Email:</span> {order.email}
              </p>
            )}

            {order.items && order.items.length > 0 && (
              <>
                <div className="border-t border-gray-200 pt-3 mt-3 space-y-1.5">
                  {order.items.map((item, i) => (
                    <div key={i} className="flex justify-between text-sm text-gray-600">
                      <span className="truncate max-w-[220px]">{item.name} × {item.quantity}</span>
                      <span className="font-medium text-gray-800">${(item.price * item.quantity).toFixed(2)}</span>
                    </div>
                  ))}
                </div>

                {/* Shipping line */}
                {order.shippingCost != null && (
                  <div className="flex justify-between text-sm text-gray-500 mt-2">
                    <span>Shipping</span>
                    <span>{order.shippingCost === 0 ? 'Free' : `$${Number(order.shippingCost).toFixed(2)}`}</span>
                  </div>
                )}

                {(order.total ?? order.totalPrice) != null && (
                  <div className="border-t border-gray-200 mt-3 pt-3 flex justify-between font-bold text-sm">
                    <span>Total Paid</span>
                    <span className="text-emerald-700">${Number(order.total ?? order.totalPrice).toFixed(2)}</span>
                  </div>
                )}
              </>
            )}

            {/* Tracking info */}
            {(liveOrder?.supplierTrackingNumber) && (
              <div className="border-t border-gray-200 mt-3 pt-3 text-sm">
                <p className="font-medium text-gray-800 mb-1">Tracking</p>
                <p className="text-gray-600">
                  {liveOrder.supplierCarrier && <span>{liveOrder.supplierCarrier}: </span>}
                  {liveOrder.supplierTrackingUrl ? (
                    <a
                      href={liveOrder.supplierTrackingUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-emerald-600 hover:underline"
                    >
                      {liveOrder.supplierTrackingNumber}
                    </a>
                  ) : (
                    liveOrder.supplierTrackingNumber
                  )}
                </p>
              </div>
            )}

            {(order.paymentIntentId || liveOrder?.stripePaymentIntentId) && (
              <p className="text-xs text-gray-400 mt-3 truncate">
                Ref: {order.paymentIntentId || liveOrder?.stripePaymentIntentId}
              </p>
            )}
          </div>
        )}

        {/* Next steps */}
        <div className="bg-emerald-50 rounded-2xl p-4 mb-8 text-sm text-emerald-800 text-left space-y-1.5">
          <p className="font-semibold mb-2">What happens next?</p>
          <div className="flex items-start gap-2">
            <span className="mt-0.5">📧</span>
            <span>A confirmation email has been sent to your inbox.</span>
          </div>
          <div className="flex items-start gap-2">
            <span className="mt-0.5">📦</span>
            <span>Your order will be prepared and shipped within 1–3 business days.</span>
          </div>
          <div className="flex items-start gap-2">
            <span className="mt-0.5">🚚</span>
            <span>You'll receive tracking information once your order ships.</span>
          </div>
        </div>

        <Link
          to="/products"
          className="inline-flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-8 py-3.5 rounded-full transition-colors shadow-md"
        >
          Continue Shopping
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
          </svg>
        </Link>
      </div>
    </div>
  )
}
