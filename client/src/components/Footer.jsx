import React from 'react'
import { Link } from 'react-router-dom'

export default function Footer() {
  return (
    <footer className="bg-gray-900 text-gray-300 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="md:col-span-2">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-8 h-8 bg-emerald-500 rounded-full flex items-center justify-center">
                <span className="text-white font-bold text-sm">VE</span>
              </div>
              <span className="text-xl font-bold text-white">Vital Essentials</span>
            </div>
            <p className="text-sm text-gray-400 max-w-xs">
              Your trusted source for premium everyday essentials — delivered fast, priced right.
            </p>
            {/* Social icons */}
            <div className="flex gap-4 mt-5">
              {['Facebook', 'Twitter', 'Instagram'].map((network) => (
                <a
                  key={network}
                  href="#"
                  aria-label={network}
                  className="w-9 h-9 bg-gray-700 hover:bg-emerald-600 rounded-full flex items-center justify-center transition-colors"
                >
                  <span className="text-xs font-bold text-white">
                    {network[0]}
                  </span>
                </a>
              ))}
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-white font-semibold mb-4">Quick Links</h3>
            <ul className="space-y-2 text-sm">
              <li><Link to="/" className="hover:text-emerald-400 transition-colors">Home</Link></li>
              <li><Link to="/products" className="hover:text-emerald-400 transition-colors">Products</Link></li>
              <li><a href="#" className="hover:text-emerald-400 transition-colors">About Us</a></li>
              <li><a href="#" className="hover:text-emerald-400 transition-colors">Contact</a></li>
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h3 className="text-white font-semibold mb-4">Legal</h3>
            <ul className="space-y-2 text-sm">
              <li><a href="#" className="hover:text-emerald-400 transition-colors">Privacy Policy</a></li>
              <li><a href="#" className="hover:text-emerald-400 transition-colors">Terms of Service</a></li>
              <li><a href="#" className="hover:text-emerald-400 transition-colors">Refund Policy</a></li>
              <li><a href="#" className="hover:text-emerald-400 transition-colors">Shipping Info</a></li>
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-700 mt-10 pt-6 text-sm text-gray-500 text-center">
          © {new Date().getFullYear()} Vital Essentials. All rights reserved.
        </div>
      </div>
    </footer>
  )
}
