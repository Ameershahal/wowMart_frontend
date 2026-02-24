import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useState, useEffect } from 'react'
import { getCart } from '../services/cartService'
import { getWishlist } from '../services/wishlistService'
import AnnouncementBanner from './AnnouncementBanner'
import logo from '../images/LOGO PNG B.png'

function Navbar() {
  const [cartCount, setCartCount] = useState(0)
  const [isCartLoading, setIsCartLoading] = useState(true)
  const [wishlistCount, setWishlistCount] = useState(0)
  const [isScrolled, setIsScrolled] = useState(false)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [isSearchOpen, setIsSearchOpen] = useState(false)
  const location = useLocation()
  const navigate = useNavigate()

  const [isLoggedIn, setIsLoggedIn] = useState(false);

    useEffect(() => {
      const token = localStorage.getItem("token"); // or sessionStorage
      setIsLoggedIn(!!token); // true if token exists
    }, []);

  useEffect(() => {
    const fetchCartCount = async () => {
      try {
        setIsCartLoading(true)
        const cart = await getCart()
        
        // Safely calculate count, handle empty or missing items
        if (!cart || !cart.items || cart.items.length === 0) {
          setCartCount(0)
          setIsCartLoading(false)
          return
        }
        
        // Filter out any invalid items before counting
        const validItems = cart.items.filter(item => 
          item && 
          item.product && 
          (item.product._id || item.product) && 
          item.quantity > 0
        )
        
        if (validItems.length === 0) {
          setCartCount(0)
          setIsCartLoading(false)
          return
        }
        
        const count = validItems.reduce((sum, item) => {
          const qty = item.quantity || 0
          return sum + qty
        }, 0)
        
        setCartCount(count)
      } catch (error) {
        console.error('Error fetching cart:', error)
        // Set count to 0 on error to prevent showing stale count
        setCartCount(0)
      } finally {
        setIsCartLoading(false)
      }
    }
    const fetchWishlistCount = async () => {
      try {
        const wishlist = await getWishlist()
        setWishlistCount(wishlist.items?.length || 0)
      } catch (error) {
        console.error('Error fetching wishlist:', error)
      }
    }
    
    // Listen for cart updates from other components
    const handleCartUpdate = () => {
      fetchCartCount()
    }
    
    // Listen for custom event when cart changes
    window.addEventListener('cartUpdated', handleCartUpdate)
    
    // Fetch immediately on mount
    fetchCartCount()
    fetchWishlistCount()
    
    // Poll only when tab is visible; cart/wishlist also update via cartUpdated event
    const interval = setInterval(() => {
      if (document.visibilityState === 'visible') {
        fetchCartCount()
        fetchWishlistCount()
      }
    }, 20000)
    return () => {
      clearInterval(interval)
      window.removeEventListener('cartUpdated', handleCartUpdate)
    }
  }, [])

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10)
    }
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  useEffect(() => {
    setIsMobileMenuOpen(false)
    setIsProfileMenuOpen(false)
    setIsSearchOpen(false)
    
    // Immediately refresh cart count when location changes
    const refreshCartCount = async () => {
      try {
        const cart = await getCart()
        if (!cart || !cart.items || cart.items.length === 0) {
          setCartCount(0)
          return
        }
        
        // Filter out invalid items
        const validItems = cart.items.filter(item => 
          item && 
          item.product && 
          (item.product._id || item.product) && 
          item.quantity > 0
        )
        
        if (validItems.length === 0) {
          setCartCount(0)
          return
        }
        
        const count = validItems.reduce((sum, item) => {
          return sum + (item.quantity || 0)
        }, 0)
        setCartCount(count)
      } catch (error) {
        console.error('Error fetching cart:', error)
        setCartCount(0)
      }
    }
    
    // Small delay to ensure cart operations are complete
    const timeoutId = setTimeout(() => {
      refreshCartCount()
    }, 100)
    
    return () => clearTimeout(timeoutId)
  }, [location])

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (isProfileMenuOpen && !event.target.closest('.profile-menu')) {
        setIsProfileMenuOpen(false)
      }
      if (isSearchOpen && !event.target.closest('.search-container')) {
        setIsSearchOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [isProfileMenuOpen, isSearchOpen])

  const generateSessionId = () => {
    return 'session_' + Math.random().toString(36).substr(2, 9) + Date.now()
  }

  const isActive = (path) => {
    if (path === '/') {
      return location.pathname === '/'
    }
    return location.pathname.startsWith(path)
  }

  const handleSearch = (e) => {
    e.preventDefault()
    if (searchQuery.trim()) {
      navigate(`/products?search=${encodeURIComponent(searchQuery.trim())}`)
      setSearchQuery('')
      setIsSearchOpen(false)
    }
  }

  const handleSearchIconClick = () => {
    setIsSearchOpen(!isSearchOpen)
  }

  return (
    <>
      <AnnouncementBanner />
      <nav 
        className={`fixed left-0 right-0 z-40 transition-all duration-200 ${
          isScrolled ? 'bg-white/95 backdrop-blur-md border-b border-slate-200/80 shadow-sm' : 'bg-white border-b border-slate-200/60'
        }`}
        style={{ top: 'var(--announcement-height, 0px)' }}
      >
        <div className="container mx-auto px-4 sm:px-6 max-w-7xl">
          <div className="flex items-center justify-between h-16 gap-6">
            <div className="flex items-center gap-10">
              <Link to="/" className="flex items-center flex-shrink-0">
                <img src={logo} alt="WowMart" className="h-8 w-auto object-contain" loading="eager" decoding="async" width="120" height="32" />
              </Link>
              
              <div className="hidden lg:flex items-center gap-1">
                <Link 
                  to="/" 
                  className={`px-4 py-2 rounded-lg text-sm font-medium font-display transition-colors ${
                    isActive('/') ? 'text-slate-900 bg-slate-100' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                  }`}
                >
                  Home
                </Link>
                <Link 
                  to="/products" 
                  className={`px-4 py-2 rounded-lg text-sm font-medium font-display transition-colors ${
                    isActive('/products') ? 'text-slate-900 bg-slate-100' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                  }`}
                >
                  Products
                </Link>
                <Link 
                  to="/blog" 
                  className={`px-4 py-2 rounded-lg text-sm font-medium font-display transition-colors ${
                    isActive('/blog') ? 'text-slate-900 bg-slate-100' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                  }`}
                >
                  Blog
                </Link>
              </div>
            </div>

            <div className="hidden lg:flex items-center gap-1 flex-shrink-0">
              <div className="relative search-container">
                <button
                  onClick={handleSearchIconClick}
                  className="p-2.5 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors"
                  title="Search"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </button>

                {isSearchOpen && (
                  <div className="absolute right-0 mt-2 w-96 bg-white rounded-xl shadow-lg border border-slate-200 z-50 p-4">
                    <form onSubmit={handleSearch} className="w-full">
                      <div className="relative">
                        <input
                          type="text"
                          value={searchQuery}
                          onChange={(e) => setSearchQuery(e.target.value)}
                          placeholder="Search products..."
                          autoFocus
                          className="w-full px-4 py-2.5 pr-10 text-sm rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-primary-yellow/30 focus:border-primary-yellow bg-white"
                        />
                        <button
                          type="submit"
                          className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 text-gray-600 hover:text-black transition-colors"
                          title="Search"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                          </svg>
                        </button>
                      </div>
                    </form>
                  </div>
                )}
              </div>
              <Link 
                to="/cart" 
                className="relative p-2.5 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors"
                title="Shopping Cart"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
                {!isCartLoading && cartCount > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 bg-slate-900 text-white rounded-full min-w-[18px] h-[18px] px-1 flex items-center justify-center text-[10px] font-semibold">
                    {cartCount > 99 ? '99+' : cartCount}
                  </span>
                )}
              </Link>

              <div className="relative profile-menu">
                  <button
                    onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)}
                    className="p-2.5 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors"
                    title="Account"
                  >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                </button>

{isProfileMenuOpen && (
  <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-lg border border-slate-200 overflow-hidden z-50">
    <div className="py-1">
      {!isLoggedIn ? (
        <>
          <Link to="/login" onClick={() => setIsProfileMenuOpen(false)} className="block px-4 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50 hover:text-slate-900">
            Log in
          </Link>
          <Link to="/signup" onClick={() => setIsProfileMenuOpen(false)} className="block px-4 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50 hover:text-slate-900">
            Sign up
          </Link>
        </>
      ) : (
        <>
          <Link to="/my-orders" onClick={() => setIsProfileMenuOpen(false)} className="block px-4 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50 hover:text-slate-900">My Orders</Link>
          <Link to="/profile" onClick={() => setIsProfileMenuOpen(false)} className="block px-4 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50 hover:text-slate-900">Profile</Link>
          <button
            onClick={() => {
              localStorage.removeItem("token");
              sessionStorage.removeItem("auth-storage");
              setIsLoggedIn(false);
              setIsProfileMenuOpen(false);
              navigate("/login");
            }}
            className="w-full text-left px-4 py-2.5 text-sm font-medium text-red-600 hover:bg-slate-50"
          >
            Log out
          </button>
        </>
      )}
    </div>
  </div>
)}

              </div>
            </div>

            <div className="flex items-center gap-1 lg:hidden">
              <div className="relative search-container">
                <button onClick={handleSearchIconClick} className="p-2.5 rounded-lg text-slate-600 hover:bg-slate-100" title="Search">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </button>
                {isSearchOpen && (
                  <div className="fixed top-16 left-0 right-0 w-full bg-white shadow-lg border-b border-slate-200 z-50 p-4">
                    <form onSubmit={handleSearch} className="w-full max-w-2xl mx-auto">
                      <div className="relative">
                        <input
                          type="text"
                          value={searchQuery}
                          onChange={(e) => setSearchQuery(e.target.value)}
                          placeholder="Search products..."
                          autoFocus
                          className="w-full px-4 py-2.5 pr-10 text-sm rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-primary-yellow/30 focus:border-primary-yellow bg-white"
                        />
                        <button
                          type="submit"
                          className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 text-gray-600 hover:text-black transition-colors"
                          title="Search"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                          </svg>
                        </button>
                      </div>
                    </form>
                  </div>
                )}
              </div>

              <Link to="/cart" className="relative p-2.5 rounded-lg text-slate-600 hover:bg-slate-100">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
                {!isCartLoading && cartCount > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 bg-slate-900 text-white rounded-full min-w-[18px] h-[18px] px-1 flex items-center justify-center text-[10px] font-semibold">
                    {cartCount > 99 ? '99+' : cartCount}
                  </span>
                )}
              </Link>
              <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} className="p-2.5 rounded-lg text-slate-600 hover:bg-slate-100">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  {isMobileMenuOpen ? (
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
                  ) : (
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M4 6h16M4 12h16M4 18h16" />
                  )}
                </svg>
              </button>
            </div>
          </div>

          <div className={`lg:hidden overflow-hidden transition-all duration-200 ${isMobileMenuOpen ? 'max-h-96 opacity-100 pb-4' : 'max-h-0 opacity-0'}`}>
            <div className="py-3 space-y-0.5 border-t border-slate-200">
              <Link to="/" onClick={() => setIsMobileMenuOpen(false)} className={`block px-4 py-3 rounded-lg text-sm font-medium ${isActive('/') ? 'bg-slate-100 text-slate-900' : 'text-slate-700 hover:bg-slate-50'}`}>Home</Link>
              <Link to="/products" onClick={() => setIsMobileMenuOpen(false)} className={`block px-4 py-3 rounded-lg text-sm font-medium ${isActive('/products') ? 'bg-slate-100 text-slate-900' : 'text-slate-700 hover:bg-slate-50'}`}>Products</Link>
              <Link to="/blog" onClick={() => setIsMobileMenuOpen(false)} className={`block px-4 py-3 rounded-lg text-sm font-medium ${isActive('/blog') ? 'bg-slate-100 text-slate-900' : 'text-slate-700 hover:bg-slate-50'}`}>Blog</Link>
              <div className="border-t border-slate-200 mt-2 pt-2">
                <Link to="/login" onClick={() => setIsMobileMenuOpen(false)} className="block px-4 py-3 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-50">Log in</Link>
                <Link to="/signup" onClick={() => setIsMobileMenuOpen(false)} className="block px-4 py-3 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-50">Sign up</Link>
                <Link to="/my-orders" onClick={() => setIsMobileMenuOpen(false)} className="block px-4 py-3 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-50">My Orders</Link>
                <Link to="/profile" onClick={() => setIsMobileMenuOpen(false)} className="block px-4 py-3 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-50">Profile</Link>
              </div>
            </div>
          </div>

        </div>
      </nav>
      
      <div style={{ height: `calc(4rem + var(--announcement-height, 0px))`, minHeight: '4rem' }} aria-hidden="true" />
    </>
  )
}

export default Navbar
