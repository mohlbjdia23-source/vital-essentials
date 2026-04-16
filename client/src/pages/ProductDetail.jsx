import React, { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import axios from 'axios'
import { useCart } from '../context/CartContext'
import ProductCard from '../components/ProductCard'

export default function ProductDetail() {
  const { id } = useParams()
  const { addToCart, setCartOpen } = useCart()
  const [product, setProduct] = useState(null)
  const [related, setRelated] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [quantity, setQuantity] = useState(1)
  const [added, setAdded] = useState(false)

  useEffect(() => {
    setLoading(true)
    setError(null)
    setQuantity(1)
    setAdded(false)

    axios.get(`/api/products/${id}`)
      .then((res) => {
        setProduct(res.data)
        // Fetch related
        return axios.get('/api/products?limit=8')
      })
      .then((res) => {
        const all = res.data.products || res.data
        setRelated(all.filter((p) => p._id !== id).slice(0, 4))
      })
      .catch((err) => setError(err.response?.data?.message || err.message || 'Product not found'))
      .finally(() => setLoading(false))
  }, [id])

  function handleAddToCart() {
    if (!product) return
    addToCart(product, quantity)
    setAdded(true)
    setTimeout(() => setAdded(false), 2000)
  }

  function handleBuyNow() {
    if (!product) return
    addToCart(product, quantity)
    setCartOpen(true)
  }

  const inStock = product?.stockStatus !== 'unavailable' && (product?.stock == null || product?.stock > 0)

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-10 animate-pulse">
          <div className="bg-gray-200 rounded-2xl h-96" />
          <div className="space-y-4">
            <div className="h-8 bg-gray-200 rounded w-3/4" />
            <div className="h-6 bg-gray-200 rounded w-1/4" />
            <div className="h-4 bg-gray-100 rounded w-full" />
            <div className="h-4 bg-gray-100 rounded w-full" />
            <div className="h-4 bg-gray-100 rounded w-2/3" />
            <div className="h-12 bg-gray-200 rounded-full w-full mt-6" />
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 text-center">
        <div className="bg-red-50 border border-red-200 text-red-700 rounded-2xl px-8 py-10 inline-block">
          <p className="text-xl font-bold mb-2">Product Not Found</p>
          <p className="text-sm mb-4">{error}</p>
          <Link to="/products" className="text-emerald-600 hover:underline font-medium">
            ← Back to Products
          </Link>
        </div>
      </div>
    )
  }

  if (!product) return null

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      {/* Breadcrumb */}
      <nav className="text-sm text-gray-500 mb-8 flex items-center gap-2">
        <Link to="/" className="hover:text-emerald-600">Home</Link>
        <span>/</span>
        <Link to="/products" className="hover:text-emerald-600">Products</Link>
        <span>/</span>
        <span className="text-gray-800 font-medium truncate max-w-xs">{product.name}</span>
      </nav>

      {/* Product */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-10 lg:gap-16 mb-16">
        {/* Image */}
        <div className="bg-gray-100 rounded-3xl overflow-hidden aspect-square flex items-center justify-center">
          {product.image ? (
            <img
              src={product.image}
              alt={product.name}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="text-gray-300">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-32 w-32" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
          )}
        </div>

        {/* Info */}
        <div>
          {product.category && (
            <span className="inline-block bg-emerald-50 text-emerald-700 text-xs font-semibold px-3 py-1 rounded-full mb-3 uppercase tracking-wide">
              {product.category}
            </span>
          )}
          <h1 className="text-2xl md:text-3xl font-extrabold text-gray-900 mb-3 leading-snug">
            {product.name}
          </h1>
          <div className="flex items-baseline gap-3 mb-4">
            <p className="text-3xl font-bold text-emerald-700">
              ${Number(product.price).toFixed(2)}
            </p>
            {product.compareAtPrice && product.compareAtPrice > product.price && (
              <p className="text-lg text-gray-400 line-through">
                ${Number(product.compareAtPrice).toFixed(2)}
              </p>
            )}
          </div>

          {/* Stock status */}
          <div className="flex items-center gap-2 mb-5">
            <span className={`w-2.5 h-2.5 rounded-full ${inStock ? 'bg-green-500' : 'bg-red-400'}`} />
            <span className={`text-sm font-medium ${inStock ? 'text-green-700' : 'text-red-600'}`}>
              {inStock
                ? product.stock != null
                  ? product.stock <= 5
                    ? `Only ${product.stock} left in stock`
                    : 'In Stock'
                  : 'In Stock'
                : 'Out of Stock'}
            </span>
          </div>

          {product.description && (
            <p className="text-gray-600 text-base leading-relaxed mb-6">{product.description}</p>
          )}

          {/* Quantity selector */}
          {inStock && (
            <div className="flex items-center gap-4 mb-6">
              <span className="text-sm font-medium text-gray-700">Quantity:</span>
              <div className="flex items-center border border-gray-300 rounded-full overflow-hidden">
                <button
                  onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                  className="px-4 py-2 text-gray-600 hover:bg-gray-50 text-lg font-medium"
                >
                  −
                </button>
                <span className="w-10 text-center text-sm font-semibold">{quantity}</span>
                <button
                  onClick={() => setQuantity((q) => product.stock != null ? Math.min(product.stock, q + 1) : q + 1)}
                  className="px-4 py-2 text-gray-600 hover:bg-gray-50 text-lg font-medium"
                >
                  +
                </button>
              </div>
            </div>
          )}

          {/* Action buttons */}
          <div className="flex flex-col sm:flex-row gap-3">
            <button
              onClick={handleAddToCart}
              disabled={!inStock}
              className={`flex-1 font-bold py-3.5 rounded-full transition-all ${
                added
                  ? 'bg-green-500 text-white'
                  : inStock
                    ? 'bg-emerald-600 hover:bg-emerald-700 text-white'
                    : 'bg-gray-200 text-gray-400 cursor-not-allowed'
              }`}
            >
              {added ? '✓ Added to Cart' : inStock ? 'Add to Cart' : 'Out of Stock'}
            </button>
            {inStock && (
              <button
                onClick={handleBuyNow}
                className="flex-1 border-2 border-emerald-600 text-emerald-700 font-bold py-3.5 rounded-full hover:bg-emerald-50 transition-all"
              >
                Buy Now
              </button>
            )}
          </div>

          {/* Perks */}
          <div className="mt-6 space-y-2 text-sm text-gray-500">
            <div className="flex items-center gap-2">
              <span>🚚</span>
              <span>Free shipping on orders over $50</span>
            </div>
            <div className="flex items-center gap-2">
              <span>↩️</span>
              <span>30-day hassle-free returns</span>
            </div>
            <div className="flex items-center gap-2">
              <span>🔒</span>
              <span>Secure checkout with Stripe</span>
            </div>
          </div>
        </div>
      </div>

      {/* Related Products */}
      {related.length > 0 && (
        <section>
          <h2 className="text-2xl font-bold text-gray-900 mb-6">You May Also Like</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
            {related.map((p) => <ProductCard key={p._id} product={p} />)}
          </div>
        </section>
      )}
    </div>
  )
}
