import React, { useState, useRef, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useCart } from '../context/CartContext'
import { useAuth } from '../context/AuthContext'

export default function Header() {
  const { cartCount, setCartOpen } = useCart()
  const { auth, logout } = useAuth()
  const [menuOpen, setMenuOpen] = useState(false)
  const [accountOpen, setAccountOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const navigate = useNavigate()
  const accountRef = useRef(null)

  // Close account dropdown when clicking outside
  useEffect(() => {
    function handler(e) {
      if (accountRef.current && !accountRef.current.contains(e.target)) {
        setAccountOpen(false)
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  function handleSearch(e) {
    e.preventDefault()
    if (searchQuery.trim()) {
      navigate(`/products?search=${encodeURIComponent(searchQuery.trim())}`)
      setMenuOpen(false)
    }
  }

  return (
    <header className="bg-white shadow-md sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 flex-shrink-0">
            <div className="w-8 h-8 bg-emerald-600 rounded-full flex items-center justify-center">
              <span className="text-white font-bold text-sm">VE</span>
            </div>
            <span className="text-xl font-bold text-emerald-700 hidden sm:block">
              Vital Essentials
            </span>
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-6">
            <Link
              to="/"
              className="text-gray-600 hover:text-emerald-600 font-medium transition-colors"
            >
              Home
            </Link>
            <Link
              to="/products"
              className="text-gray-600 hover:text-emerald-600 font-medium transition-colors"
            >
              Products
            </Link>
            <Link
              to="/orders"
              className="text-gray-600 hover:text-emerald-600 font-medium transition-colors"
            >
              My Orders
            </Link>
          </nav>

          {/* Search Bar */}
          <form onSubmit={handleSearch} className="hidden md:flex items-center gap-2 flex-1 max-w-xs mx-6">
            <div className="relative w-full">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search products…"
                className="w-full border border-gray-300 rounded-full px-4 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-400 focus:border-transparent"
              />
              <button
                type="submit"
                className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-emerald-600"
                aria-label="Search"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-4.35-4.35M17 11A6 6 0 1 1 5 11a6 6 0 0 1 12 0z" />
                </svg>
              </button>
            </div>
          </form>

          {/* Account + Cart + Hamburger */}
          <div className="flex items-center gap-3">
            {/* Account button */}
            <div className="relative hidden md:block" ref={accountRef}>
              {auth ? (
                <>
                  <button
                    onClick={() => setAccountOpen(!accountOpen)}
                    className="flex items-center gap-1.5 text-gray-600 hover:text-emerald-600 transition-colors text-sm font-medium"
                    aria-label="Account menu"
                  >
                    <div className="w-7 h-7 bg-emerald-100 text-emerald-700 rounded-full flex items-center justify-center font-bold text-xs">
                      {auth.user?.name?.[0]?.toUpperCase() || 'U'}
                    </div>
                    <span className="hidden lg:block max-w-[100px] truncate">{auth.user?.name?.split(' ')[0]}</span>
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>
                  {accountOpen && (
                    <div className="absolute right-0 top-full mt-2 w-44 bg-white rounded-xl shadow-lg border border-gray-100 py-1 z-50">
                      <Link
                        to="/orders"
                        onClick={() => setAccountOpen(false)}
                        className="block px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50"
                      >
                        My Orders
                      </Link>
                      <button
                        onClick={() => { logout(); setAccountOpen(false) }}
                        className="w-full text-left px-4 py-2.5 text-sm text-red-600 hover:bg-red-50"
                      >
                        Sign Out
                      </button>
                    </div>
                  )}
                </>
              ) : (
                <Link
                  to="/account"
                  className="text-gray-600 hover:text-emerald-600 transition-colors"
                  aria-label="Sign in"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5.121 17.804A9 9 0 1 1 18.88 6.196M15 10a3 3 0 1 1-6 0 3 3 0 0 1 6 0z" />
                  </svg>
                </Link>
              )}
            </div>

            <button
              onClick={() => setCartOpen(true)}
              className="relative p-2 text-gray-600 hover:text-emerald-600 transition-colors"
              aria-label="Open cart"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13l-1.5 6h13M7 13H5.4M9 21a1 1 0 1 0 2 0 1 1 0 0 0-2 0zm8 0a1 1 0 1 0 2 0 1 1 0 0 0-2 0z" />
              </svg>
              {cartCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-emerald-600 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
                  {cartCount > 99 ? '99+' : cartCount}
                </span>
              )}
            </button>

            {/* Hamburger */}
            <button
              className="md:hidden p-2 text-gray-600 hover:text-emerald-600"
              onClick={() => setMenuOpen(!menuOpen)}
              aria-label="Toggle menu"
            >
              {menuOpen ? (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              ) : (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              )}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {menuOpen && (
          <div className="md:hidden pb-4 border-t border-gray-100">
            <nav className="flex flex-col gap-3 pt-4">
              <Link
                to="/"
                onClick={() => setMenuOpen(false)}
                className="text-gray-700 hover:text-emerald-600 font-medium px-2"
              >
                Home
              </Link>
              <Link
                to="/products"
                onClick={() => setMenuOpen(false)}
                className="text-gray-700 hover:text-emerald-600 font-medium px-2"
              >
                Products
              </Link>
              <Link
                to="/orders"
                onClick={() => setMenuOpen(false)}
                className="text-gray-700 hover:text-emerald-600 font-medium px-2"
              >
                My Orders
              </Link>
              {auth ? (
                <button
                  onClick={() => { logout(); setMenuOpen(false) }}
                  className="text-left text-red-600 hover:text-red-700 font-medium px-2"
                >
                  Sign Out ({auth.user?.name?.split(' ')[0]})
                </button>
              ) : (
                <Link
                  to="/account"
                  onClick={() => setMenuOpen(false)}
                  className="text-gray-700 hover:text-emerald-600 font-medium px-2"
                >
                  Sign In / Create Account
                </Link>
              )}
            </nav>
            <form onSubmit={handleSearch} className="mt-3 px-2">
              <div className="relative">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search products…"
                  className="w-full border border-gray-300 rounded-full px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-400"
                />
                <button
                  type="submit"
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-emerald-600"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-4.35-4.35M17 11A6 6 0 1 1 5 11a6 6 0 0 1 12 0z" />
                  </svg>
                </button>
              </div>
            </form>
          </div>
        )}
      </div>
    </header>
  )
}
