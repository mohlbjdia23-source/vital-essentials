import React from 'react'
import { Link, useLocation } from 'react-router-dom'

export default function OrderConfirmation() {
  const { state } = useLocation()
  const order = state?.orderDetails

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
                {order.total != null && (
                  <div className="border-t border-gray-200 mt-3 pt-3 flex justify-between font-bold text-sm">
                    <span>Total Paid</span>
                    <span className="text-emerald-700">${Number(order.total).toFixed(2)}</span>
                  </div>
                )}
              </>
            )}

            {order.paymentIntentId && (
              <p className="text-xs text-gray-400 mt-3 truncate">
                Ref: {order.paymentIntentId}
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
