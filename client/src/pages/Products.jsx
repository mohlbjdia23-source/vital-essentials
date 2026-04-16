import React, { useEffect, useState, useCallback } from 'react'
import { useSearchParams } from 'react-router-dom'
import axios from 'axios'
import ProductCard from '../components/ProductCard'

const CATEGORIES = ['All', 'Skincare', 'Electronics', 'Home Goods', 'Wellness', 'Fitness', 'Beauty', 'Other']
const SORT_OPTIONS = [
  { value: 'createdAt:desc', label: 'Newest' },
  { value: 'price:asc', label: 'Price: Low to High' },
  { value: 'price:desc', label: 'Price: High to Low' },
  { value: 'name:asc', label: 'Name A–Z' },
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

export default function Products() {
  const [searchParams, setSearchParams] = useSearchParams()
  const [products, setProducts] = useState([])
  const [total, setTotal] = useState(0)
  const [totalPages, setTotalPages] = useState(1)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const searchQuery = searchParams.get('search') || ''
  const categoryParam = searchParams.get('category') || 'All'
  const pageParam = parseInt(searchParams.get('page') || '1', 10)
  const sortParam = searchParams.get('sort') || 'createdAt:desc'

  const [localSearch, setLocalSearch] = useState(searchQuery)
  const [activeCategory, setActiveCategory] = useState(categoryParam)

  const fetchProducts = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const [sortField, sortOrder] = sortParam.split(':')
      const params = {
        page: pageParam,
        limit: 12,
        sort: sortField,
        order: sortOrder,
      }
      if (searchQuery) params.search = searchQuery
      if (categoryParam !== 'All') params.category = categoryParam

      const { data } = await axios.get('/api/products', { params })
      setProducts(data.products || data)
      setTotal(data.total || 0)
      setTotalPages(data.totalPages || 1)
    } catch (err) {
      setError(err.message || 'Failed to load products')
    } finally {
      setLoading(false)
    }
  }, [searchQuery, categoryParam, pageParam, sortParam])

  useEffect(() => {
    fetchProducts()
  }, [fetchProducts])

  // Sync URL params to local state when URL changes externally (e.g. category links from Home)
  useEffect(() => {
    setLocalSearch(searchQuery)
    setActiveCategory(categoryParam)
  }, [searchQuery, categoryParam])

  function buildParams(overrides = {}) {
    const base = {}
    const s = overrides.search !== undefined ? overrides.search : (localSearch.trim() || searchQuery)
    const cat = overrides.category !== undefined ? overrides.category : activeCategory
    const page = overrides.page !== undefined ? overrides.page : 1
    const sort = overrides.sort !== undefined ? overrides.sort : sortParam
    if (s) base.search = s
    if (cat !== 'All') base.category = cat
    if (page > 1) base.page = page
    if (sort !== 'createdAt:desc') base.sort = sort
    return base
  }

  function handleSearch(e) {
    e.preventDefault()
    setSearchParams(buildParams({ search: localSearch.trim(), page: 1 }))
  }

  function handleCategoryClick(cat) {
    setActiveCategory(cat)
    setSearchParams(buildParams({ category: cat, page: 1 }))
  }

  function handleSortChange(e) {
    setSearchParams(buildParams({ sort: e.target.value, page: 1 }))
  }

  function handlePageChange(newPage) {
    setSearchParams(buildParams({ page: newPage }))
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  function clearFilters() {
    setLocalSearch('')
    setActiveCategory('All')
    setSearchParams({})
  }

  const hasFilters = searchQuery || categoryParam !== 'All'

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      {/* Page title */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">All Products</h1>
        <p className="text-gray-500 mt-1 text-sm">
          {loading ? 'Loading…' : `${total} product${total !== 1 ? 's' : ''} found`}
        </p>
      </div>

      {/* Search + Sort */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <form onSubmit={handleSearch} className="flex-1">
          <div className="relative max-w-lg">
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
                onClick={() => { setLocalSearch(''); setSearchParams(buildParams({ search: '', page: 1 })) }}
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
        </form>

        <select
          value={sortParam}
          onChange={handleSortChange}
          className="border border-gray-300 rounded-full px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-400 bg-white"
        >
          {SORT_OPTIONS.map((o) => (
            <option key={o.value} value={o.value}>{o.label}</option>
          ))}
        </select>
      </div>

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
      ) : products.length === 0 ? (
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
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {products.map((p) => <ProductCard key={p._id} product={p} />)}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 mt-12">
              <button
                onClick={() => handlePageChange(pageParam - 1)}
                disabled={pageParam <= 1}
                className="px-4 py-2 rounded-full border text-sm font-medium disabled:opacity-40 disabled:cursor-not-allowed hover:bg-gray-50 transition-colors"
              >
                ← Prev
              </button>
              {Array.from({ length: totalPages }, (_, i) => i + 1)
                .filter((p) => p === 1 || p === totalPages || Math.abs(p - pageParam) <= 1)
                .reduce((acc, p, idx, arr) => {
                  if (idx > 0 && p - arr[idx - 1] > 1) acc.push('…')
                  acc.push(p)
                  return acc
                }, [])
                .map((p, i) =>
                  p === '…' ? (
                    <span key={`ellipsis-${i}`} className="px-2 text-gray-400">…</span>
                  ) : (
                    <button
                      key={p}
                      onClick={() => handlePageChange(p)}
                      className={`w-9 h-9 rounded-full text-sm font-medium transition-colors ${
                        p === pageParam
                          ? 'bg-emerald-600 text-white'
                          : 'border hover:bg-gray-50 text-gray-700'
                      }`}
                    >
                      {p}
                    </button>
                  )
                )}
              <button
                onClick={() => handlePageChange(pageParam + 1)}
                disabled={pageParam >= totalPages}
                className="px-4 py-2 rounded-full border text-sm font-medium disabled:opacity-40 disabled:cursor-not-allowed hover:bg-gray-50 transition-colors"
              >
                Next →
              </button>
            </div>
          )}
        </>
      )}
    </div>
  )
}
