import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import axios from 'axios'
import ProductCard from '../components/ProductCard'

const CATEGORIES = [
  { name: 'Skincare', emoji: '🌿', bg: 'bg-green-50', border: 'border-green-200', text: 'text-green-700' },
  { name: 'Electronics', emoji: '⚡', bg: 'bg-blue-50', border: 'border-blue-200', text: 'text-blue-700' },
  { name: 'Home Goods', emoji: '🏠', bg: 'bg-yellow-50', border: 'border-yellow-200', text: 'text-yellow-700' },
  { name: 'Wellness', emoji: '💊', bg: 'bg-purple-50', border: 'border-purple-200', text: 'text-purple-700' },
  { name: 'Fitness', emoji: '🏋️', bg: 'bg-red-50', border: 'border-red-200', text: 'text-red-700' },
  { name: 'Beauty', emoji: '✨', bg: 'bg-pink-50', border: 'border-pink-200', text: 'text-pink-700' },
  { name: 'Nutrition', emoji: '🥗', bg: 'bg-lime-50', border: 'border-lime-200', text: 'text-lime-700' },
  { name: 'Kitchen', emoji: '🍳', bg: 'bg-orange-50', border: 'border-orange-200', text: 'text-orange-700' },
  { name: 'Pet Care', emoji: '🐾', bg: 'bg-amber-50', border: 'border-amber-200', text: 'text-amber-700' },
]

function SkeletonCard() {
  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden animate-pulse">
      <div className="h-52 bg-gray-200" />
      <div className="p-4 space-y-2">
        <div className="h-4 bg-gray-200 rounded w-3/4" />
        <div className="h-3 bg-gray-100 rounded w-full" />
        <div className="h-3 bg-gray-100 rounded w-2/3" />
        <div className="flex justify-between items-center pt-2">
          <div className="h-6 bg-gray-200 rounded w-16" />
          <div className="h-8 bg-gray-200 rounded-full w-24" />
        </div>
      </div>
    </div>
  )
}

export default function Home() {
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    axios.get('/api/products?limit=8')
      .then((res) => setProducts(res.data.products || res.data))
      .catch(() => setProducts([]))
      .finally(() => setLoading(false))
  }, [])

  return (
    <div>
      {/* Hero */}
      <section className="relative bg-gradient-to-br from-emerald-600 via-emerald-700 to-teal-800 text-white overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-10 left-10 w-72 h-72 bg-white rounded-full" />
          <div className="absolute bottom-0 right-20 w-96 h-96 bg-white rounded-full" />
        </div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 md:py-32">
          <div className="max-w-2xl">
            <span className="inline-block bg-white/20 text-white text-xs font-semibold px-3 py-1 rounded-full mb-4 uppercase tracking-wider">
              Free shipping on orders over $50
            </span>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold leading-tight mb-6">
              Everything You Need,<br />
              <span className="text-emerald-300">Delivered to You</span>
            </h1>
            <p className="text-lg md:text-xl text-emerald-100 mb-8 max-w-xl">
              Discover premium everyday essentials — from skincare to electronics — curated for your lifestyle and delivered fast.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Link
                to="/products"
                className="inline-flex items-center justify-center gap-2 bg-white text-emerald-700 font-bold px-8 py-3.5 rounded-full hover:bg-emerald-50 transition-colors text-lg shadow-lg"
              >
                Shop Now
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                </svg>
              </Link>
              <Link
                to="/products"
                className="inline-flex items-center justify-center gap-2 border-2 border-white/50 text-white font-semibold px-8 py-3.5 rounded-full hover:bg-white/10 transition-colors text-lg"
              >
                Browse Catalog
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Trust badges */}
      <section className="bg-white border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
            {[
              { icon: '🚚', title: 'Fast Shipping', sub: 'Orders ship in 1–3 days' },
              { icon: '🔒', title: 'Secure Payments', sub: 'Protected by Stripe' },
              { icon: '↩️', title: 'Easy Returns', sub: '30-day hassle-free' },
              { icon: '⭐', title: 'Top Quality', sub: 'Curated & verified' },
            ].map((b) => (
              <div key={b.title} className="flex flex-col items-center gap-1 py-2">
                <span className="text-2xl">{b.icon}</span>
                <p className="font-semibold text-gray-800 text-sm">{b.title}</p>
                <p className="text-xs text-gray-500">{b.sub}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Products */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-2xl md:text-3xl font-bold text-gray-900">Featured Products</h2>
            <p className="text-gray-500 mt-1 text-sm">Hand-picked essentials just for you</p>
          </div>
          <Link
            to="/products"
            className="hidden sm:inline-flex items-center gap-1 text-emerald-600 font-semibold hover:underline text-sm"
          >
            View All
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {loading
            ? Array.from({ length: 8 }).map((_, i) => <SkeletonCard key={i} />)
            : products.slice(0, 8).map((p) => <ProductCard key={p._id} product={p} />)
          }
        </div>

        {!loading && products.length === 0 && (
          <div className="text-center py-16 text-gray-400">
            <p className="text-lg">No products available yet.</p>
            <p className="text-sm mt-1">Check back soon!</p>
          </div>
        )}

        <div className="mt-8 text-center sm:hidden">
          <Link
            to="/products"
            className="inline-flex items-center gap-1 text-emerald-600 font-semibold hover:underline"
          >
            View All Products →
          </Link>
        </div>
      </section>

      {/* Categories */}
      <section className="bg-gray-50 py-14">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">Shop by Category</h2>
          <p className="text-gray-500 text-sm mb-8">Find exactly what you're looking for</p>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {CATEGORIES.map((cat) => (
              <Link
                key={cat.name}
                to={`/products?category=${encodeURIComponent(cat.name)}`}
                className={`flex flex-col items-center gap-2 p-5 rounded-2xl border-2 ${cat.bg} ${cat.border} hover:shadow-md transition-all group`}
              >
                <span className="text-3xl group-hover:scale-110 transition-transform">{cat.emoji}</span>
                <span className={`font-semibold text-sm ${cat.text}`}>{cat.name}</span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Banner */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
        <div className="bg-gradient-to-r from-emerald-600 to-teal-600 rounded-3xl p-10 md:p-14 text-white text-center">
          <h2 className="text-2xl md:text-3xl font-extrabold mb-3">Ready to Shop?</h2>
          <p className="text-emerald-100 mb-6 text-lg">
            Thousands of products waiting for you. Free shipping over $50.
          </p>
          <Link
            to="/products"
            className="inline-flex items-center gap-2 bg-white text-emerald-700 font-bold px-8 py-3 rounded-full hover:bg-emerald-50 transition-colors shadow-lg"
          >
            Browse All Products
          </Link>
        </div>
      </section>
    </div>
  )
}
