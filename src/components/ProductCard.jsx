import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { getCart, addToCart, updateCartItem, removeFromCart } from '../services/cartService'
import { getWishlist, addToWishlist, removeFromWishlist } from '../services/wishlistService'
import SuccessAnimation from './SuccessAnimation'
import { useButtonColor } from '../hooks/useButtonColor'

function ProductCard({ product }) {
  const [cartItem, setCartItem] = useState(null)
  const [isInWishlist, setIsInWishlist] = useState(false)
  const [wishlistItemId, setWishlistItemId] = useState(null)
  const [loading, setLoading] = useState(false)
  const [wishlistLoading, setWishlistLoading] = useState(false)
  const [currentImageIndex, setCurrentImageIndex] = useState(0)
  const [isHovered, setIsHovered] = useState(false)
  const [showSuccess, setShowSuccess] = useState(false)
  const navigate = useNavigate()
  const { buttonColor } = useButtonColor()

  // Helper function to convert hex to RGB
  const hexToRgb = (hex) => {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex)
    return result ? {
      r: parseInt(result[1], 16),
      g: parseInt(result[2], 16),
      b: parseInt(result[3], 16)
    } : null
  }

  useEffect(() => {
    fetchCartItem()
    fetchWishlistStatus()
  }, [product._id])

  useEffect(() => {
    if (isHovered && product.images && product.images.length > 1) {
      const interval = setInterval(() => {
        setCurrentImageIndex((prev) => (prev + 1) % product.images.length)
      }, 2000)
      return () => clearInterval(interval)
    } else {
      setCurrentImageIndex(0)
    }
  }, [isHovered, product.images])

  const fetchCartItem = async () => {
    try {
      const cart = await getCart()
      if (!cart || !cart.items) {
        setCartItem(null)
        return
      }
      // Try multiple ways to match the product ID
      const item = cart.items.find(item => {
        if (!item || !item.product) return false
        const productId = item.product._id || item.product
        const currentProductId = product._id
        // Compare as strings to handle ObjectId vs string mismatches
        return String(productId) === String(currentProductId)
      })
      setCartItem(item || null)
    } catch (error) {
      console.error('Error fetching cart:', error)
      setCartItem(null)
    }
  }

  const fetchWishlistStatus = async () => {
    try {
      const wishlist = await getWishlist()
      const item = wishlist.items.find(item => item.product._id === product._id)
      setIsInWishlist(!!item)
      setWishlistItemId(item?._id || null)
    } catch (error) {
      console.error('Error fetching wishlist:', error)
    }
  }

  const handleWishlistToggle = async (e) => {
    e.preventDefault()
    e.stopPropagation()
    setWishlistLoading(true)
    try {
      if (isInWishlist) {
        await removeFromWishlist(wishlistItemId)
        setIsInWishlist(false)
        setWishlistItemId(null)
      } else {
        const wishlist = await addToWishlist(product._id)
        const item = wishlist.items.find(item => item.product._id === product._id)
        setIsInWishlist(true)
        setWishlistItemId(item?._id || null)
      }
    } catch (error) {
      console.error('Error updating wishlist:', error)
    } finally {
      setWishlistLoading(false)
    }
  }

  const handleAddToCart = async (e) => {
    e.preventDefault()
    e.stopPropagation()
    setLoading(true)
    try {
      await addToCart(product._id, 1)
      // Wait a bit for the backend to process, then fetch
      await new Promise(resolve => setTimeout(resolve, 300))
      // Fetch the updated cart
      await fetchCartItem()
      // Try one more time if not found
      await new Promise(resolve => setTimeout(resolve, 200))
      await fetchCartItem()
      // Notify navbar to update cart count
      window.dispatchEvent(new Event('cartUpdated'))
      setShowSuccess(true)
      setTimeout(() => setShowSuccess(false), 2000)
    } catch (error) {
      console.error('Error adding to cart:', error)
      // alert('Failed to add to cart. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleIncrease = async (e) => {
    e.preventDefault()
    e.stopPropagation()
    if (!cartItem || !cartItem._id) return
    setLoading(true)
    try {
      await updateCartItem(cartItem._id, cartItem.quantity + 1)
      // Wait a bit for the backend to process
      await new Promise(resolve => setTimeout(resolve, 100))
      await fetchCartItem()
      // Notify navbar to update cart count
      window.dispatchEvent(new Event('cartUpdated'))
    } catch (error) {
      console.error('Error updating cart:', error)
      alert('Failed to update quantity. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleDecrease = async (e) => {
    e.preventDefault()
    e.stopPropagation()
    if (!cartItem || !cartItem._id) return
    setLoading(true)
    try {
      if (cartItem.quantity > 1) {
        await updateCartItem(cartItem._id, cartItem.quantity - 1)
      } else {
        await removeFromCart(cartItem._id)
      }
      // Wait a bit for the backend to process
      await new Promise(resolve => setTimeout(resolve, 100))
      await fetchCartItem()
      // Notify navbar to update cart count
      window.dispatchEvent(new Event('cartUpdated'))
    } catch (error) {
      console.error('Error updating cart:', error)
      alert('Failed to update quantity. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div 
      className="card overflow-hidden group relative fade-in"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <SuccessAnimation show={showSuccess} message="Added to Cart!" />
      <Link to={`/products/${product._id}`} className="block">
        <div className="relative h-48 sm:h-56 md:h-64 bg-gray-100 overflow-hidden">
          {product.images && product.images.length > 1 ? (
            <img
              key={currentImageIndex}
              src={`${product.images[currentImageIndex]}`}
              alt={`${product.name} ${currentImageIndex + 1}`}
              className="w-full h-full object-cover transition-opacity duration-500 ease-in-out"
              loading="lazy"
              decoding="async"
            />
          ) : (
            <img
              src={product.images?.[0] || '/placeholder.jpg'}
              alt={product.name}
              className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500 ease-out"
              loading="lazy"
              decoding="async"
            />
          )}
          
          {/* Top Left - Discount Badge */}
          {product.originalPrice && (
            <div 
              className="absolute top-2.5 left-2.5 sm:top-3 sm:left-3 z-10 px-3 py-1.5 rounded-full font-bold text-xs shadow-lg hover:scale-105 transition-all duration-300 cursor-pointer backdrop-blur-md"
              style={{
                background: 'rgba(251, 191, 36, 0.25)',
                backdropFilter: 'blur(10px)',
                WebkitBackdropFilter: 'blur(10px)',
                border: '1px solid rgba(255, 255, 255, 0.3)',
                boxShadow: '0 8px 32px 0 rgba(251, 191, 36, 0.37), inset 0 1px 0 0 rgba(255, 255, 255, 0.5)'
              }}
            >
              <span className="text-black drop-shadow-sm">{Math.round((1 - product.price / product.originalPrice) * 100)}% OFF!</span>
            </div>
          )}
          
          {/* Top Left - Stock/Urgency Badge (stacked below discount badge) */}
          {product.inStock && product.stockQuantity <= 10 && product.stockQuantity > 0 && (
            <div 
              className="absolute top-2.5 left-2.5 sm:top-3 sm:left-3 z-10 px-3 py-1.5 rounded-full font-bold text-xs shadow-lg backdrop-blur-md transition-all duration-300"
              style={{ 
                marginTop: product.originalPrice ? '32px' : '0',
                background: 'rgba(239, 68, 68, 0.25)',
                backdropFilter: 'blur(10px)',
                WebkitBackdropFilter: 'blur(10px)',
                border: '1px solid rgba(255, 255, 255, 0.3)',
                boxShadow: '0 8px 32px 0 rgba(239, 68, 68, 0.37), inset 0 1px 0 0 rgba(255, 255, 255, 0.5)'
              }}
            >
              <span className="text-white drop-shadow-sm">Only {product.stockQuantity} left!</span>
            </div>
          )}
          {product.inStock && product.stockQuantity > 10 && product.stockQuantity <= 20 && (
            <div 
              className="absolute top-2.5 left-2.5 sm:top-3 sm:left-3 z-10 px-3 py-1.5 rounded-full font-bold text-xs shadow-lg backdrop-blur-md transition-all duration-300"
              style={{ 
                marginTop: product.originalPrice ? '32px' : '0',
                background: 'rgba(249, 115, 22, 0.25)',
                backdropFilter: 'blur(10px)',
                WebkitBackdropFilter: 'blur(10px)',
                border: '1px solid rgba(255, 255, 255, 0.3)',
                boxShadow: '0 8px 32px 0 rgba(249, 115, 22, 0.37), inset 0 1px 0 0 rgba(255, 255, 255, 0.5)'
              }}
            >
              <span className="text-white drop-shadow-sm">Going Fast!</span>
            </div>
          )}
          
          {/* Bottom Left - BESTSELLER Badge */}
          {product.rating >= 4.8 && (
            <div 
              className="absolute bottom-2.5 left-2.5 sm:bottom-3 sm:left-3 z-10 px-3 py-1.5 rounded-full font-bold text-xs shadow-lg hover:scale-105 transition-all duration-300 backdrop-blur-md"
              style={{
                background: 'rgba(34, 197, 94, 0.25)',
                backdropFilter: 'blur(10px)',
                WebkitBackdropFilter: 'blur(10px)',
                border: '1px solid rgba(255, 255, 255, 0.3)',
                boxShadow: '0 8px 32px 0 rgba(34, 197, 94, 0.37), inset 0 1px 0 0 rgba(255, 255, 255, 0.5)'
              }}
            >
              <span className="text-white drop-shadow-sm">BESTSELLER!</span>
            </div>
          )}
          
          {/* Out of Stock Overlay */}
          {!product.inStock && (
            <div className="absolute inset-0 bg-black bg-opacity-60 flex items-center justify-center z-30">
              <span className="text-white font-bold text-xl">Out of Stock</span>
            </div>
          )}
          
          {/* Top Right - Wishlist Button (subtle, integrated) */}
          <button
            onClick={handleWishlistToggle}
            disabled={wishlistLoading}
            className={`absolute top-2.5 right-2.5 sm:top-3 sm:right-3 z-20 rounded-full p-2 transition-all duration-300 touch-target ${
              isInWishlist 
                ? 'bg-red-500/90 text-white opacity-100' 
                : 'text-white opacity-0 group-hover:opacity-100'
            } hover:scale-110 active:scale-95`}
            title={isInWishlist ? 'Remove from wishlist' : 'Add to wishlist'}
          >
            <svg className="w-4.5 h-4.5 drop-shadow-lg" fill={isInWishlist ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
            </svg>
          </button>
        </div>
      </Link>

      <div className="p-3 sm:p-4 md:p-5 space-y-2 sm:space-y-2.5">
        <Link to={`/products/${product._id}`}>
          <h3 className="text-base sm:text-lg font-bold text-black mb-2 sm:mb-2.5 line-clamp-2 min-h-[2.5rem] sm:min-h-[3rem] hover:text-yellow-400 transition-colors">
            {product.name}
          </h3>
        </Link>
        
        <div className="flex items-center gap-2 mb-2 sm:mb-2.5">
          <div className="flex items-center gap-1 bg-gray-100 border border-gray-300 rounded px-2 py-0.5">
            <span className="text-sm font-medium text-gray-700">{product.rating.toFixed(1)}</span>
            <svg className="w-3.5 h-3.5 text-yellow-400 fill-yellow-400" viewBox="0 0 20 20" stroke="currentColor" strokeWidth="0.5">
              <path d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z" />
            </svg>
          </div>
          <span className="text-gray-600 text-xs">({product.reviewCount})</span>
        </div>

        <div className="flex items-center justify-between mb-2 sm:mb-2.5">
          <div className="flex items-baseline gap-2">
            <span className="text-xl sm:text-2xl font-black text-black">₹{product.price}</span>
            {product.originalPrice && (
              <span className="text-gray-400 line-through text-sm sm:text-base">₹{product.originalPrice}</span>
            )}
          </div>
        </div>

        {/* Add to Cart / Quantity Controls */}
        {product.inStock && (
          <div className="mt-3" onClick={(e) => e.stopPropagation()}>
            {cartItem ? (
              <div className=" items-center gap-2 hidden md:flex">
                <div className="flex items-center border border-gray-300 rounded-lg overflow-hidden">
                  <button
                    onClick={handleDecrease}
                    disabled={loading}
                    className="w-8 h-8 sm:w-9 sm:h-9 text-gray-700 hover:text-black hover:bg-gray-100 active:bg-gray-200 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center touch-target"
                  >
                    <svg className="w-3 h-3 md:w-4 md:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
                    </svg>
                  </button>
                  <span className="text-black font-semibold text-sm sm:text-base px-3 sm:px-4 min-w-[2rem] sm:min-w-[2.5rem] text-center border-x border-gray-300">{cartItem.quantity}</span>
                  <button
                    onClick={handleIncrease}
                    disabled={loading || cartItem.quantity >= product.stockQuantity}
                    className="w-8 h-8 sm:w-9 sm:h-9 text-gray-700 hover:text-black hover:bg-gray-100 active:bg-gray-200 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center touch-target"
                  >
                    <svg className="w-3 h-3 md:w-4 md:h-4 " fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                  </button>
                </div>
                <button
                  onClick={async (e) => {
                    e.preventDefault()
                    e.stopPropagation()
                    // If item is already in cart, just navigate
                    if (cartItem && cartItem._id) {
                      navigate('/checkout')
                    } else {
                      // Otherwise add to cart first
                      setLoading(true)
                      try {
                        await addToCart(product._id, 1)
                        await new Promise(resolve => setTimeout(resolve, 200))
                        window.dispatchEvent(new Event('cartUpdated'))
                        navigate('/checkout')
                      } catch (error) {
                        console.error('Error adding to cart:', error)
                        // alert('Failed to add to cart. Please try again.')
                        setLoading(false)
                      }
                    }
                  }}
                  className="flex-1 text-white font-semibold text-xs sm:text-sm py-2.5 sm:py-3 rounded-md transition-all duration-200 touch-target shadow-md hover:shadow-lg active:scale-[0.98] flex items-center justify-center gap-1.5"
                  style={{
                    backgroundColor: buttonColor,
                    border: 'none',
                    outline: 'none'
                  }}
                  onMouseEnter={(e) => {
                    // Darken color on hover
                    const rgb = hexToRgb(buttonColor)
                    if (rgb) {
                      e.target.style.backgroundColor = `rgb(${Math.max(0, rgb.r - 20)}, ${Math.max(0, rgb.g - 20)}, ${Math.max(0, rgb.b - 20)})`
                    }
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.backgroundColor = buttonColor
                  }}
                >
                  <svg className="w-3.5 h-3.5 sm:w-4 sm:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                  </svg>
                  <span className='hidden md:block'>Buy Now</span>
                  
                </button>
              </div>
            ) : (
              <div className=" items-center gap-2 hidden md:flex">
                <button
                  onClick={handleAddToCart}
                  disabled={loading}
                  className="flex-1 bg-black text-white py-2 sm:py-2.5 rounded-lg font-semibold text-xs sm:text-sm hover:bg-gray-900 transition-all duration-300 transform hover:scale-105 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-1.5 sm:space-x-2 touch-target shadow-md hover:shadow-lg"
                >
                  {loading ? (
                    <>
                      <svg className="animate-spin h-3.5 w-3.5 sm:h-4 sm:w-4" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      <span className="text-xs sm:text-sm">Adding...</span>
                    </>
                  ) : (
                    <>
                      <svg className="w-3.5 h-3.5 sm:w-4 sm:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                      </svg>
                      <span className="text-xs sm:text-sm hidden md:block">Grab It! 🛒</span>
                    </>
                  )}
                </button>
                <button
                  onClick={async (e) => {
                    e.preventDefault()
                    e.stopPropagation()
                    setLoading(true)
                    try {
                      await addToCart(product._id, 1)
                      // Wait a bit for the backend to process
                      await new Promise(resolve => setTimeout(resolve, 200))
                      // Notify navbar to update cart count
                      window.dispatchEvent(new Event('cartUpdated'))
                      navigate('/checkout')
                    } catch (error) {
                      console.error('Error adding to cart:', error)
                      // alert('Failed to add to cart. Please try again.')
                      setLoading(false)
                    }
                  }}
                  disabled={loading}
                  className="flex-1 text-white font-semibold text-xs sm:text-sm py-2.5 sm:py-3 rounded-md transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed touch-target shadow-md hover:shadow-lg active:scale-[0.98] flex items-center justify-center gap-1.5"
                  style={{
                    backgroundColor: buttonColor,
                    border: 'none',
                    outline: 'none'
                  }}
                  onMouseEnter={(e) => {
                    if (!loading) {
                      const rgb = hexToRgb(buttonColor)
                      if (rgb) {
                        e.target.style.backgroundColor = `rgb(${Math.max(0, rgb.r - 20)}, ${Math.max(0, rgb.g - 20)}, ${Math.max(0, rgb.b - 20)})`
                      }
                    }
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.backgroundColor = buttonColor
                  }}
                >
                  {loading ? (
                    <>
                      <svg className="animate-spin h-3.5 w-3.5 sm:h-4 sm:w-4" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      <span>Processing...</span>
                    </>
                  ) : (
                    <>
                      <svg className="w-3.5 h-3.5 sm:w-4 sm:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                      </svg>
                      <span className='hidden md:block'>Buy Now</span>
                      
                    </>
                  )}
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

export default ProductCard
