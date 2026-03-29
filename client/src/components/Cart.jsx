import React, { useEffect } from 'react'
import { useCart } from '../context/CartContext'
import Checkout from './Checkout'
import { useState } from 'react'

export default function Cart() {
  const { items, isCartOpen, setCartOpen, cartTotal, removeFromCart, updateQuantity } = useCart()
  const [showCheckout, setShowCheckout] = useState(false)

  // Close on ESC
  useEffect(() => {
    function onKey(e) {
      if (e.key === 'Escape') setCartOpen(false)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [setCartOpen])

  // Prevent body scroll when open
  useEffect(() => {
    document.body.style.overflow = isCartOpen ? 'hidden' : ''
    return () => { document.body.style.overflow = '' }
  }, [isCartOpen])

  if (!isCartOpen) return null

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/50 z-50 transition-opacity"
        onClick={() => { setCartOpen(false); setShowCheckout(false) }}
        aria-hidden="true"
      />

      {/* Sidebar */}
      <aside className="fixed top-0 right-0 h-full w-full max-w-md bg-white z-50 shadow-2xl flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
          <h2 className="text-lg font-bold text-gray-800">
            {showCheckout ? 'Checkout' : 'Your Cart'}
          </h2>
          <button
            onClick={() => { setCartOpen(false); setShowCheckout(false) }}
            className="p-2 text-gray-400 hover:text-gray-700 transition-colors rounded-full hover:bg-gray-100"
            aria-label="Close cart"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {showCheckout ? (
          <Checkout onBack={() => setShowCheckout(false)} />
        ) : (
          <>
            {/* Cart Items */}
            <div className="flex-1 overflow-y-auto px-5 py-4">
              {items.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-gray-400 gap-4">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13l-1.5 6h13M9 21a1 1 0 1 0 2 0 1 1 0 0 0-2 0zm8 0a1 1 0 1 0 2 0 1 1 0 0 0-2 0z" />
                  </svg>
                  <p className="text-lg font-medium">Your cart is empty</p>
                  <button
                    onClick={() => setCartOpen(false)}
                    className="text-emerald-600 hover:underline text-sm"
                  >
                    Continue Shopping
                  </button>
                </div>
              ) : (
                <ul className="space-y-4">
                  {items.map((item) => (
                    <li key={item._id} className="flex gap-4 py-3 border-b border-gray-100 last:border-0">
                      {/* Image */}
                      <div className="w-16 h-16 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
                        {item.image ? (
                          <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-gray-300">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                          </div>
                        )}
                      </div>

                      {/* Details */}
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-gray-800 text-sm truncate">{item.name}</p>
                        <p className="text-emerald-700 font-semibold text-sm mt-0.5">
                          ${Number(item.price).toFixed(2)}
                        </p>
                        {/* Quantity controls */}
                        <div className="flex items-center gap-2 mt-2">
                          <button
                            onClick={() => updateQuantity(item._id, item.quantity - 1)}
                            className="w-6 h-6 rounded-full border border-gray-300 flex items-center justify-center text-gray-600 hover:bg-gray-100 text-sm"
                          >
                            −
                          </button>
                          <span className="text-sm font-medium w-5 text-center">{item.quantity}</span>
                          <button
                            onClick={() => updateQuantity(item._id, item.quantity + 1)}
                            className="w-6 h-6 rounded-full border border-gray-300 flex items-center justify-center text-gray-600 hover:bg-gray-100 text-sm"
                          >
                            +
                          </button>
                        </div>
                      </div>

                      {/* Subtotal + Remove */}
                      <div className="flex flex-col items-end justify-between flex-shrink-0">
                        <p className="text-sm font-bold text-gray-800">
                          ${(item.price * item.quantity).toFixed(2)}
                        </p>
                        <button
                          onClick={() => removeFromCart(item._id)}
                          className="text-xs text-red-400 hover:text-red-600 transition-colors"
                          aria-label={`Remove ${item.name}`}
                        >
                          Remove
                        </button>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            {/* Footer */}
            {items.length > 0 && (
              <div className="border-t border-gray-100 px-5 py-4 bg-gray-50">
                <div className="flex justify-between items-center mb-4">
                  <span className="font-semibold text-gray-700">Total</span>
                  <span className="text-xl font-bold text-emerald-700">${cartTotal.toFixed(2)}</span>
                </div>
                <button
                  onClick={() => setShowCheckout(true)}
                  className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3 rounded-xl transition-colors"
                >
                  Proceed to Checkout
                </button>
              </div>
            )}
          </>
        )}
      </aside>
    </>
  )
}
