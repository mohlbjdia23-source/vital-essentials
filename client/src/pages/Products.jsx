import React, { useEffect, useState, useCallback } from 'react'
import { useSearchParams } from 'react-router-dom'
import axios from 'axios'
import ProductCard from '../components/ProductCard'

const CATEGORIES = ['All', 'Skincare', 'Electronics', 'Home Goods', 'Wellness', 'Fitness', 'Beauty', 'Other']

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

export default function Products() {
  const [searchParams, setSearchParams] = useSearchParams()
  const [allProducts, setAllProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const searchQuery = searchParams.get('search') || ''
  const categoryParam = searchParams.get('category') || 'All'

  const [localSearch, setLocalSearch] = useState(searchQuery)
  const [activeCategory, setActiveCategory] = useState(categoryParam)

  useEffect(() => {
    setLoading(true)
    setError(null)
    axios.get('/api/products')
      .then((res) => setAllProducts(res.data.products || res.data))
      .catch((err) => setError(err.message || 'Failed to load products'))
      .finally(() => setLoading(false))
  }, [])

  // Sync URL params to local state
  useEffect(() => {
    setLocalSearch(searchQuery)
    setActiveCategory(categoryParam)
  }, [searchQuery, categoryParam])

  function handleSearch(e) {
    e.preventDefault()
    const params = {}
    if (localSearch.trim()) params.search = localSearch.trim()
    if (activeCategory !== 'All') params.category = activeCategory
    setSearchParams(params)
  }

  function handleCategoryClick(cat) {
    setActiveCategory(cat)
    const params = {}
    if (localSearch.trim()) params.search = localSearch.trim()
    if (cat !== 'All') params.category = cat
    setSearchParams(params)
  }

  function clearFilters() {
    setLocalSearch('')
    setActiveCategory('All')
    setSearchParams({})
  }

  const filtered = allProducts.filter((p) => {
    const matchesSearch =
      !searchQuery ||
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (p.description && p.description.toLowerCase().includes(searchQuery.toLowerCase()))
    const matchesCat =
      activeCategory === 'All' ||
      (p.category && p.category.toLowerCase() === activeCategory.toLowerCase())
    return matchesSearch && matchesCat
  })

  const hasFilters = searchQuery || activeCategory !== 'All'

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      {/* Page title */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">All Products</h1>
        <p className="text-gray-500 mt-1 text-sm">
          {loading ? 'Loading…' : `${filtered.length} product${filtered.length !== 1 ? 's' : ''} found`}
        </p>
      </div>

      {/* Search */}
      <form onSubmit={handleSearch} className="mb-6">
        <div className="flex gap-2">
          <div className="relative flex-1 max-w-lg">
            <input
              type="text"
              value={localSearch}
              onChange={(e) => setLocalSearch(e.target.value)}
              placeholder="Search products by name or description…"
              className="w-full border border-gray-300 rounded-full px-5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-400 focus:border-transparent"
            />
            {localSearch && (
              <button
                type="button"
                onClick={() => { setLocalSearch(''); setSearchParams(activeCategory !== 'All' ? { category: activeCategory } : {}) }}
                className="absolute right-10 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            )}
            <button
              type="submit"
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-emerald-600"
              aria-label="Search"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-4.35-4.35M17 11A6 6 0 1 1 5 11a6 6 0 0 1 12 0z" />
              </svg>
            </button>
          </div>
        </div>
      </form>

      {/* Category filters */}
      <div className="flex flex-wrap gap-2 mb-8">
        {CATEGORIES.map((cat) => (
          <button
            key={cat}
            onClick={() => handleCategoryClick(cat)}
            className={`px-4 py-1.5 rounded-full text-sm font-medium border transition-all ${
              activeCategory === cat
                ? 'bg-emerald-600 text-white border-emerald-600'
                : 'bg-white text-gray-600 border-gray-200 hover:border-emerald-400 hover:text-emerald-600'
            }`}
          >
            {cat}
          </button>
        ))}
        {hasFilters && (
          <button
            onClick={clearFilters}
            className="px-4 py-1.5 rounded-full text-sm font-medium text-red-500 border border-red-200 hover:bg-red-50 transition-all"
          >
            Clear Filters
          </button>
        )}
      </div>

      {/* Error */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl px-5 py-4 mb-6 text-sm">
          {error}
        </div>
      )}

      {/* Grid */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {Array.from({ length: 12 }).map((_, i) => <SkeletonCard key={i} />)}
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-20 text-gray-400">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 mx-auto mb-4 opacity-40" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <p className="text-lg font-medium text-gray-500">No products found</p>
          <p className="text-sm mt-1">Try adjusting your search or filters</p>
          {hasFilters && (
            <button onClick={clearFilters} className="mt-4 text-emerald-600 hover:underline font-medium text-sm">
              Clear all filters
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {filtered.map((p) => <ProductCard key={p._id} product={p} />)}
        </div>
      )}
    </div>
  )
}
