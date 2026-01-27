import { Link } from 'react-router-dom'

function Footer() {
  return (
    <footer className="bg-black text-white mt-auto">
      <div className="container mx-auto px-4 py-8 sm:py-10 md:py-12">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6 sm:gap-8">
          <div>
            <h3 className="text-xl sm:text-2xl font-black text-yellow-400 mb-3 sm:mb-4">WOWMART</h3>
            <p className="text-sm sm:text-base text-gray-400">
              The best toys and gadgets for kids and teenagers. Building curiosity, one product at a time!
            </p>
          </div>
          
          <div>
            <h4 className="font-bold text-yellow-400 mb-3 sm:mb-4 text-sm sm:text-base">Shop</h4>
            <ul className="space-y-1.5 sm:space-y-2 text-gray-400 text-sm sm:text-base">
              <li><a href="/products" className="hover:text-yellow-400 transition-colors">All Products</a></li>
              <li><a href="/products?category=toys" className="hover:text-yellow-400 transition-colors">Toys</a></li>
              <li><a href="/products?category=gadgets" className="hover:text-yellow-400 transition-colors">Gadgets</a></li>
              <li><a href="/products?category=building-sets" className="hover:text-yellow-400 transition-colors">Building Sets</a></li>
            </ul>
          </div>
          
          <div>
            <h4 className="font-bold text-yellow-400 mb-3 sm:mb-4 text-sm sm:text-base">Help</h4>
            <ul className="space-y-1.5 sm:space-y-2 text-gray-400 text-sm sm:text-base">
              <li><a href="#" className="hover:text-yellow-400 transition-colors">Shipping Info</a></li>
              <li><a href="#" className="hover:text-yellow-400 transition-colors">Returns</a></li>
              <li><a href="#" className="hover:text-yellow-400 transition-colors">FAQ</a></li>
              <li><a href="#" className="hover:text-yellow-400 transition-colors">Contact Us</a></li>
              <li><Link to="/policy" className="hover:text-yellow-400 transition-colors">Privacy Policy & Terms</Link></li>
            </ul>
          </div>
          
          <div>
            <h4 className="font-bold text-yellow-400 mb-3 sm:mb-4 text-sm sm:text-base">Connect</h4>
            <ul className="space-y-1.5 sm:space-y-2 text-gray-400 text-sm sm:text-base">
              <li><a href="/blog" className="hover:text-yellow-400 transition-colors">Blog</a></li>
              <li><a href="#" className="hover:text-yellow-400 transition-colors">About Us</a></li>
              <li><a href="#" className="hover:text-yellow-400 transition-colors">Newsletter</a></li>
            </ul>
          </div>
          
          <div>
            <h4 className="font-bold text-yellow-400 mb-3 sm:mb-4 text-sm sm:text-base">Visit Us</h4>
            <ul className="space-y-1.5 sm:space-y-2 text-gray-400 text-sm sm:text-base">
              <li>
                <a 
                  href="https://share.google/KmX6a4DsYGlfS8PNo" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="hover:text-yellow-400 transition-colors flex items-center gap-2"
                >
                  <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  <span>Kondotty Store</span>
                </a>
              </li>
              <li>
                <a 
                  href="https://share.google/bJKAVTVhJpiZr150q" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="hover:text-yellow-400 transition-colors flex items-center gap-2"
                >
                  <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  <span>Tirurangadi Store</span>
                </a>
              </li>
            </ul>
          </div>
        </div>
        
        <div className="border-t border-gray-800 mt-6 sm:mt-8 pt-6 sm:pt-8 text-center text-gray-400 text-sm sm:text-base">
          <p>&copy; 2026 WowMart. All rights reserved.</p>
        </div>
      </div>
    </footer>
  )
}

export default Footer
