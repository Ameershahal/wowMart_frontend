import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { getCart, addToCart, updateCartItem, removeFromCart } from '../services/cartService'
import { getWishlist, addToWishlist, removeFromWishlist } from '../services/wishlistService'
import SuccessAnimation from './SuccessAnimation'
import { useButtonColor } from '../hooks/useButtonColor'

let sharedCart = null
let sharedCartPromise = null
let sharedWishlist = null
let sharedWishlistPromise = null

const normalizeProductId = (item) => String(item?.product?._id || item?.product || '')

const getSharedCart = async () => {
  if (sharedCart) return sharedCart
  if (!sharedCartPromise) {
    sharedCartPromise = getCart()
      .then((data) => {
        sharedCart = data || { items: [] }
        return sharedCart
      })
      .finally(() => {
        sharedCartPromise = null
      })
  }
  return sharedCartPromise
}

const getSharedWishlist = async () => {
  if (sharedWishlist) return sharedWishlist
  if (!sharedWishlistPromise) {
    sharedWishlistPromise = getWishlist()
      .then((data) => {
        sharedWishlist = data || { items: [] }
        return sharedWishlist
      })
      .finally(() => {
        sharedWishlistPromise = null
      })
  }
  return sharedWishlistPromise
}

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
      const cart = await getSharedCart()
      if (!cart || !cart.items) {
        setCartItem(null)
        return
      }
      const item = cart.items.find((item) => normalizeProductId(item) === String(product._id))
      setCartItem(item || null)
    } catch (error) {
      console.error('Error fetching cart:', error)
      setCartItem(null)
    }
  }

  const fetchWishlistStatus = async () => {
    try {
      const wishlist = await getSharedWishlist()
      const item = wishlist.items.find((item) => normalizeProductId(item) === String(product._id))
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
        if (sharedWishlist?.items) {
          sharedWishlist.items = sharedWishlist.items.filter((item) => String(item?._id) !== String(wishlistItemId))
        }
        setIsInWishlist(false)
        setWishlistItemId(null)
      } else {
        const wishlist = await addToWishlist(product._id)
        sharedWishlist = wishlist
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
      // Invalidate shared cart once and refresh after write.
      sharedCart = null
      await fetchCartItem()
      // Notify navbar to update cart count
      window.dispatchEvent(new Event('cartUpdated'))
      setShowSuccess(true)
      setTimeout(() => setShowSuccess(false), 1200)
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
      sharedCart = null
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
      sharedCart = null
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
      <SuccessAnimation show={showSuccess} message="Added to cart" />
      <Link to={`/products/${product._id}`} className="block">
        <div className="relative aspect-[4/3] bg-slate-100 overflow-hidden">
          {product.images && product.images.length > 1 ? (
            <img
              key={currentImageIndex}
              src={`${product.images[currentImageIndex]}`}
              alt={`${product.name} ${currentImageIndex + 1}`}
              className="w-full h-full object-cover transition-opacity duration-300"
              loading="lazy"
              decoding="async"
            />
          ) : (
            <img
              src={product.images?.[0] || '/placeholder.jpg'}
              alt={product.name}
              className="w-full h-full object-cover group-hover:scale-[1.02] transition-transform duration-300"
              loading="lazy"
              decoding="async"
            />
          )}
          
          {product.originalPrice && (
            <span className="absolute top-2 left-2 z-10 px-2 py-0.5 rounded-md bg-slate-900 text-white text-[10px] font-medium uppercase tracking-wide">
              {Math.round((1 - product.price / product.originalPrice) * 100)}% off
            </span>
          )}
          {product.inStock && product.stockQuantity <= 10 && product.stockQuantity > 0 && (
            <span className="absolute top-2 left-2 z-10 px-2 py-0.5 rounded-md bg-rose-600 text-white text-[10px] font-medium" style={{ marginTop: product.originalPrice ? '24px' : 0 }}>
              {product.stockQuantity} left
            </span>
          )}
          {product.rating >= 4.8 && (
            <span className="absolute bottom-2 left-2 z-10 px-2 py-0.5 rounded-md bg-emerald-700 text-white text-[10px] font-medium">Bestseller</span>
          )}
          {!product.inStock && (
            <div className="absolute inset-0 bg-slate-900/50 flex items-center justify-center z-20">
              <span className="text-white text-sm font-medium">Out of stock</span>
            </div>
          )}
          <button
            onClick={handleWishlistToggle}
            disabled={wishlistLoading}
            className={`absolute top-2 right-2 z-20 w-8 h-8 rounded-full flex items-center justify-center transition-colors ${
              isInWishlist ? 'bg-rose-500 text-white' : 'bg-white/90 text-slate-600 opacity-0 group-hover:opacity-100 hover:bg-white'
            }`}
            title={isInWishlist ? 'Remove from wishlist' : 'Add to wishlist'}
          >
            <svg className="w-4 h-4" fill={isInWishlist ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
            </svg>
          </button>
        </div>
      </Link>

      <div className="p-4">
        <Link to={`/products/${product._id}`}>
          <h3 className="font-display font-semibold text-slate-900 text-sm leading-snug line-clamp-2 mb-2 hover:text-slate-700 transition-colors">
            {product.name}
          </h3>
        </Link>
        <div className="flex items-center gap-1.5 mb-2">
          <span className="text-amber-500 text-xs font-medium">{product.rating?.toFixed(1) || '0'}</span>
          <svg className="w-3.5 h-3.5 text-amber-500 fill-amber-500" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" /></svg>
          <span className="text-slate-400 text-xs">({product.reviewCount || 0})</span>
        </div>
        <div className="flex items-baseline gap-2 mb-3">
          <span className="font-display font-semibold text-slate-900">₹{product.price}</span>
          {product.originalPrice && <span className="text-slate-400 line-through text-sm">₹{product.originalPrice}</span>}
        </div>

        {product.inStock && (
          <div className="hidden md:flex items-stretch gap-2" onClick={(e) => e.stopPropagation()}>
            {cartItem ? (
              <>
                <div className="flex items-center border border-slate-200 rounded-lg bg-white flex-shrink-0 min-w-[7.5rem]">
                  <button type="button" onClick={handleDecrease} disabled={loading} className="w-9 h-9 flex-shrink-0 flex items-center justify-center text-slate-600 hover:bg-slate-100 disabled:opacity-50 rounded-l-md">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" /></svg>
                  </button>
                  <span className="w-8 text-center text-sm font-medium text-slate-900 flex-shrink-0">{cartItem.quantity}</span>
                  <button type="button" onClick={handleIncrease} disabled={loading || cartItem.quantity >= product.stockQuantity} className="w-9 h-9 flex-shrink-0 flex items-center justify-center text-slate-600 hover:bg-slate-100 disabled:opacity-50 rounded-r-md">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
                  </button>
                </div>
                <button
                  type="button"
                  onClick={() => navigate('/checkout')}
                  className="flex-1 min-w-0 py-2.5 rounded-lg text-sm font-medium text-white flex items-center justify-center"
                  style={{ backgroundColor: buttonColor }}
                  onMouseEnter={(e) => { const rgb = hexToRgb(buttonColor); if (rgb) e.target.style.backgroundColor = `rgb(${Math.max(0, rgb.r - 15)}, ${Math.max(0, rgb.g - 15)}, ${Math.max(0, rgb.b - 15)})` }}
                  onMouseLeave={(e) => { e.target.style.backgroundColor = buttonColor }}
                >
                  Buy now
                </button>
              </>
            ) : (
              <>
                <button
                  onClick={handleAddToCart}
                  disabled={loading}
                  className="flex-1 py-2.5 rounded-lg border border-slate-300 text-slate-700 text-sm font-medium hover:bg-slate-50 disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {loading ? <span className="animate-spin w-4 h-4 border-2 border-slate-300 border-t-slate-600 rounded-full" /> : 'Add to cart'}
                </button>
                <button
                  onClick={async (e) => {
                    e.preventDefault(); e.stopPropagation(); setLoading(true)
                    try {
                      await addToCart(product._id, 1)
                      await new Promise(r => setTimeout(r, 200))
                      window.dispatchEvent(new Event('cartUpdated'))
                      navigate('/checkout')
                    } catch (err) { console.error(err); setLoading(false) }
                  }}
                  disabled={loading}
                  className="flex-1 py-2.5 rounded-lg text-sm font-medium text-white flex items-center justify-center gap-1.5"
                  style={{ backgroundColor: buttonColor }}
                  onMouseEnter={(e) => { const rgb = hexToRgb(buttonColor); if (rgb) e.target.style.backgroundColor = `rgb(${Math.max(0, rgb.r - 15)}, ${Math.max(0, rgb.g - 15)}, ${Math.max(0, rgb.b - 15)})` }}
                  onMouseLeave={(e) => { e.target.style.backgroundColor = buttonColor }}
                >
                  Buy now
                </button>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

export default ProductCard
