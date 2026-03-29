import React from 'react'
import { Link } from 'react-router-dom'
import { useCart } from '../context/CartContext'

export default function ProductCard({ product }) {
  const { addToCart } = useCart()

  const inStock = product.stock == null || product.stock > 0

  function handleAddToCart(e) {
    e.preventDefault()
    if (inStock) addToCart(product, 1)
  }

  return (
    <Link
      to={`/products/${product._id}`}
      className="group bg-white rounded-2xl shadow-sm hover:shadow-md transition-shadow overflow-hidden flex flex-col border border-gray-100"
    >
      {/* Image */}
      <div className="relative h-52 bg-gray-100 overflow-hidden">
        {product.image ? (
          <img
            src={product.image}
            alt={product.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-gray-300">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>
        )}
        {/* Stock badge */}
        {!inStock && (
          <span className="absolute top-2 right-2 bg-red-500 text-white text-xs font-semibold px-2 py-0.5 rounded-full">
            Out of Stock
          </span>
        )}
        {inStock && product.stock != null && product.stock <= 5 && (
          <span className="absolute top-2 right-2 bg-amber-400 text-white text-xs font-semibold px-2 py-0.5 rounded-full">
            Only {product.stock} left
          </span>
        )}
      </div>

      {/* Content */}
      <div className="p-4 flex flex-col flex-1">
        <h3 className="font-semibold text-gray-800 text-sm leading-snug line-clamp-2 mb-1 group-hover:text-emerald-600 transition-colors">
          {product.name}
        </h3>
        {product.description && (
          <p className="text-xs text-gray-500 line-clamp-2 mb-3 flex-1">
            {product.description}
          </p>
        )}
        <div className="flex items-center justify-between mt-auto pt-2">
          <span className="text-lg font-bold text-emerald-700">
            ${Number(product.price).toFixed(2)}
          </span>
          <button
            onClick={handleAddToCart}
            disabled={!inStock}
            className="bg-emerald-600 hover:bg-emerald-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white text-xs font-semibold px-3 py-1.5 rounded-full transition-colors"
          >
            {inStock ? 'Add to Cart' : 'Sold Out'}
          </button>
        </div>
      </div>
    </Link>
  )
}
