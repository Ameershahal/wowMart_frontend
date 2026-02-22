import { Link } from 'react-router-dom'

function Footer() {
  return (
    <footer className="bg-slate-900 text-slate-300 mt-auto">
      <div className="container mx-auto px-4 sm:px-6 max-w-7xl py-12 sm:py-16">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10 lg:gap-12">
          <div className="sm:col-span-2 lg:col-span-1">
            <h3 className="font-display font-semibold text-white text-lg mb-4">WowMart</h3>
            <p className="text-sm text-slate-400 leading-relaxed max-w-xs">
              Toys and gadgets for kids and teenagers. Safe, trusted, and built for curiosity.
            </p>
          </div>
          <div>
            <h4 className="font-display font-semibold text-white text-sm uppercase tracking-wider mb-4">Shop</h4>
            <ul className="space-y-3 text-sm">
              <li><a href="/products" className="hover:text-white transition-colors">All Products</a></li>
              <li><a href="/products?category=toys" className="hover:text-white transition-colors">Toys</a></li>
              <li><a href="/products?category=gadgets" className="hover:text-white transition-colors">Gadgets</a></li>
              <li><a href="/products?category=building-sets" className="hover:text-white transition-colors">Building Sets</a></li>
            </ul>
          </div>
          <div>
            <h4 className="font-display font-semibold text-white text-sm uppercase tracking-wider mb-4">Help</h4>
            <ul className="space-y-3 text-sm">
              <li><a href="#" className="hover:text-white transition-colors">Shipping</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Returns</a></li>
              <li><a href="#" className="hover:text-white transition-colors">FAQ</a></li>
              <li><Link to="/policy" className="hover:text-white transition-colors">Privacy & Terms</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="font-display font-semibold text-white text-sm uppercase tracking-wider mb-4">Stores</h4>
            <ul className="space-y-3 text-sm">
              <li>
                <a href="https://share.google/KmX6a4DsYGlfS8PNo" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors flex items-center gap-2">
                  <svg className="w-4 h-4 flex-shrink-0 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                  Kondotty
                </a>
              </li>
              <li>
                <a href="https://share.google/bJKAVTVhJpiZr150q" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors flex items-center gap-2">
                  <svg className="w-4 h-4 flex-shrink-0 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                  Tirurangadi
                </a>
              </li>
            </ul>
          </div>
        </div>
        <div className="border-t border-slate-800 mt-10 pt-8 text-center text-slate-500 text-sm">
          &copy; {new Date().getFullYear()} WowMart. All rights reserved.
        </div>
      </div>
    </footer>
  )
}

export default Footer
