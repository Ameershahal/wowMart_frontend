import { useEffect, useState, useCallback, lazy, Suspense } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { getProduct } from '../services/productService'
import { addToCart } from '../services/cartService'
import { getWishlist, addToWishlist, removeFromWishlist } from '../services/wishlistService'
import { getProductReviews, createReview } from '../services/reviewService'
import CountdownTimer from '../components/CountdownTimer'
import ImageZoom from '../components/ImageZoom'
import SuccessAnimation from '../components/SuccessAnimation'
const Confetti = lazy(() => import('../components/Confetti'))
import SEO from '../components/SEO'
import Skeleton from '../components/Skeleton'
import { useButtonColor } from '../hooks/useButtonColor'

// Parse stored color: "Name|#hex" or "#hex" -> { name, hex }
function parseColorOption(entry) {
  if (!entry || typeof entry !== 'string') return { name: '', hex: '' }
  const pipe = entry.indexOf('|')
  if (pipe !== -1) {
    const name = entry.slice(0, pipe).trim()
    const hex = entry.slice(pipe + 1).trim()
    return { name, hex: /^#[A-Fa-f0-9]{3,6}$/.test(hex) ? hex : '' }
  }
  if (/^#[A-Fa-f0-9]{3,6}$/.test(entry)) return { name: '', hex: entry }
  return { name: entry, hex: '' }
}

function ProductDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [product, setProduct] = useState(null)
  const [loading, setLoading] = useState(true)
  const [quantity, setQuantity] = useState(1)
  const [selectedImage, setSelectedImage] = useState(0)
  const [selectedColor, setSelectedColor] = useState(null)
  const [addingToCart, setAddingToCart] = useState(false)
  const [isInWishlist, setIsInWishlist] = useState(false)
  const [couponCode, setCouponCode] = useState('')
  const [couponApplied, setCouponApplied] = useState(false)
  const [couponError, setCouponError] = useState('')
  const [couponLoading, setCouponLoading] = useState(false)
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
  const [wishlistItemId, setWishlistItemId] = useState(null)
  const [wishlistLoading, setWishlistLoading] = useState(false)
  const [reviews, setReviews] = useState([])
  const [showReviewForm, setShowReviewForm] = useState(false)
  const [reviewForm, setReviewForm] = useState({
    name: '',
    rating: 5,
    comment: '',
    age: ''
  })
  const [showConfetti, setShowConfetti] = useState(false)
  const [showSuccess, setShowSuccess] = useState(false)
  const [currentReviewIndex, setCurrentReviewIndex] = useState(0)

  const fetchWishlistStatus = useCallback(async () => {
    try {
      const wishlist = await getWishlist()
      const item = wishlist.items.find(item => item.product._id === id)
      setIsInWishlist(!!item)
      setWishlistItemId(item?._id || null)
    } catch (error) {
      console.error('Error fetching wishlist:', error)
    }
  }, [id])

  const fetchReviews = useCallback(async () => {
    try {
      const data = await getProductReviews(id)
      setReviews(data)
      setCurrentReviewIndex(0)
    } catch (error) {
      console.error('Error fetching reviews:', error)
    }
  }, [id])

  // Derive colour options from product (variants or colors array from API)
  const colorOptions = product
    ? (product.variants?.find((v) => /color|colour/i.test(v.name))?.options ||
       product.colors ||
       product.availableColors ||
       product.colorOptions ||
       [])
    : []

  useEffect(() => {
    setSelectedColor(null)
    setCouponApplied(false)
    setCouponCode('')
    setCouponError('')
    const fetchProduct = async () => {
      try {
        const data = await getProduct(id)
        setProduct(data)
        const options = data.variants?.find((v) => /color|colour/i.test(v.name))?.options || data.colors || data.availableColors || data.colorOptions || []
        if (options.length > 0) setSelectedColor(options[0])
      } catch (error) {
        console.error('Error fetching product:', error)
      } finally {
        setLoading(false)
      }
    }
    fetchProduct()
    fetchWishlistStatus()
    fetchReviews()
  }, [id, fetchWishlistStatus, fetchReviews])

  // Carousel navigation functions
  const goToNextReview = () => {
    if (reviews.length === 0) return
    setCurrentReviewIndex((prev) => (prev + 1) % reviews.length)
  }

  const goToPrevReview = () => {
    if (reviews.length === 0) return
    setCurrentReviewIndex((prev) => (prev - 1 + reviews.length) % reviews.length)
  }

  const goToReview = (index) => {
    if (reviews.length === 0 || index < 0 || index >= reviews.length) return
    setCurrentReviewIndex(index)
  }

  // Auto-slide reviews carousel
  useEffect(() => {
    if (reviews.length <= 1) return
    const interval = setInterval(() => {
      setCurrentReviewIndex((prev) => (prev + 1) % reviews.length)
    }, 5000)
    return () => clearInterval(interval)
  }, [reviews.length])

  const handleWishlistToggle = async () => {
    setWishlistLoading(true)
    try {
      if (isInWishlist) {
        await removeFromWishlist(wishlistItemId)
        setIsInWishlist(false)
        setWishlistItemId(null)
      } else {
        const wishlist = await addToWishlist(id)
        const item = wishlist.items.find(item => item.product._id === id)
        setIsInWishlist(true)
        setWishlistItemId(item?._id || null)
      }
    } catch (error) {
      console.error('Error updating wishlist:', error)
    } finally {
      setWishlistLoading(false)
    }
  }

  const handleReviewSubmit = async (e) => {
    e.preventDefault()
    try {
      await createReview(id, reviewForm)
      setReviewForm({ name: '', rating: 5, comment: '', age: '' })
      setShowReviewForm(false)
      fetchReviews()
      const data = await getProduct(id)
      setProduct(data)
    } catch (error) {
      console.error('Error submitting review:', error)
      alert('Failed to submit review. Please try again.')
    }
  }

  const handleAddToCart = async () => {
    if (!product.inStock) return
    
    setAddingToCart(true)
    try {
      await addToCart(product._id, quantity)
      setShowSuccess(true)
      setTimeout(() => setShowSuccess(false), 1200)
    } catch (error) {
      console.error('Error adding to cart:', error)
    } finally {
      setAddingToCart(false)
    }
  }

  const handleBuyNow = async () => {
    if (!product.inStock) return
    
    setAddingToCart(true)
    try {
      await addToCart(product._id, quantity)
      setShowConfetti(true)
      setTimeout(() => navigate('/checkout'), 1500)
    } catch (error) {
      console.error('Error adding to cart:', error)
    } finally {
      setAddingToCart(false)
    }
  }

  const handleApplyCoupon = async () => {
    const code = couponCode.trim().toUpperCase()
    if (!code) {
      setCouponError('Please enter a coupon code')
      return
    }
    setCouponError('')
    setCouponLoading(true)
    try {
      // Demo: accept common codes; replace with API call when backend supports coupons
      const demoCodes = { SAVE10: '10% off', SAVE5: '5% off', WOW5: '₹50 off', EXTRA5: 'Extra 5% off' }
      if (demoCodes[code]) {
        setCouponApplied(true)
      } else {
        setCouponError('Invalid or expired coupon code')
      }
    } catch (err) {
      setCouponError('Could not apply coupon. Try again.')
    } finally {
      setCouponLoading(false)
    }
  }

  const handleRemoveCoupon = () => {
    setCouponApplied(false)
    setCouponCode('')
    setCouponError('')
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-surface-subtle">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 lg:py-12 max-w-7xl">
          <div className="flex items-center gap-2 mb-8">
            <Skeleton className="h-4 w-12" />
            <Skeleton className="h-4 w-4" />
            <Skeleton className="h-4 w-16" />
            <Skeleton className="h-4 w-4" />
            <Skeleton className="h-4 w-24" />
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-16">
            <div className="space-y-4">
              <Skeleton className="aspect-square w-full rounded-xl" />
              <div className="grid grid-cols-4 gap-3">
                {[1, 2, 3, 4].map((i) => (
                  <Skeleton key={i} className="aspect-square rounded-lg" />
                ))}
              </div>
            </div>
            <div className="space-y-4">
              <Skeleton className="h-8 w-3/4" />
              <div className="flex gap-2">
                <Skeleton className="h-5 w-16" />
                <Skeleton className="h-5 w-12" />
              </div>
              <Skeleton className="h-6 w-20" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-2/3" />
              <div className="flex gap-3 pt-4">
                <Skeleton className="h-12 w-32 rounded-lg" />
                <Skeleton className="h-12 flex-1 rounded-lg" />
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (!product) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="text-center">
          <h2 className="text-3xl font-bold text-black mb-4">Product not found</h2>
          <Link to="/products" className="btn-primary">Back to Products</Link>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white min-h-screen">
      <SEO
        title={`${product?.name || 'Product'} - wowmart`}
        description={product?.description || 'Discover amazing toys and gadgets for kids and teenagers.'}
        image={product?.images?.[0] || '/images/LOGO PNG B.png'}
        type="product"
        product={product}
      />
      <Suspense fallback={null}>
        <Confetti trigger={showConfetti} />
      </Suspense>
      <SuccessAnimation show={showSuccess} message="Added to Cart!" />
      
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 lg:py-12 max-w-7xl">
        {/* Breadcrumb */}
        <nav className="mb-6 sm:mb-8 text-sm text-gray-500">
          <div className="flex items-center space-x-2">
            <Link to="/" className="hover:text-black transition-colors">Home</Link>
            <span>/</span>
            <Link to="/products" className="hover:text-black transition-colors">Products</Link>
            <span>/</span>
            <span className="text-black font-medium truncate">{product.name}</span>
          </div>
        </nav>

        {/* Main Product Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-16 mb-16">
          {/* Product Images */}
          <div className="space-y-4">
            {/* Main Image */}
            <div className="relative bg-gray-50 rounded-lg overflow-hidden aspect-square group">
              <ImageZoom
                src={product.images[selectedImage]}
                alt={product.name}
                className="w-full h-full object-contain"
                loading={selectedImage === 0 ? 'eager' : 'lazy'}
                decoding="async"
              />
              <button
                onClick={handleWishlistToggle}
                disabled={wishlistLoading}
                className="absolute top-4 right-4 bg-white rounded-full p-2.5 shadow-md hover:shadow-lg transition-all duration-200 z-10"
                title={isInWishlist ? 'Remove from wishlist' : 'Add to wishlist'}
              >
                <svg className={`w-5 h-5 transition-colors ${isInWishlist ? 'text-red-500 fill-current' : 'text-gray-600'}`} fill={isInWishlist ? 'currentColor' : 'none'} stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                </svg>
              </button>
            </div>
            
            {/* Thumbnail Gallery */}
            {product.images.length > 1 && (
              <div className="grid grid-cols-4 sm:grid-cols-5 gap-3">
                {product.images.map((img, index) => (
                  <button
                    key={index}
                    onClick={() => setSelectedImage(index)}
                    className={`relative aspect-square rounded-md overflow-hidden border-2 transition-all duration-200 ${
                      selectedImage === index 
                        ? 'border-black ring-2 ring-black ring-offset-2' 
                        : 'border-gray-200 hover:border-gray-400'
                    }`}
                  >
                    <img
                      src={img}
                      alt={`${product.name} ${index + 1}`}
                      className="w-full h-full object-cover"
                      loading="lazy"
                      decoding="async"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Product Info */}
          <div className="space-y-6">
            {/* Category Badge */}
            <div>
              <span className="inline-block bg-gray-100 text-gray-700 px-3 py-1 rounded-md text-xs font-medium uppercase tracking-wide">
                {product.category}
              </span>
            </div>

            {/* Product Title */}
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-black leading-tight">
              {product.name}
            </h1>
            
            {/* Rating */}
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1">
                {[...Array(5)].map((_, i) => (
                  <svg key={i} className={`w-5 h-5 ${i < Math.floor(product.rating) ? 'text-yellow-400 fill-current' : 'text-gray-300'}`} viewBox="0 0 20 20">
                    <path d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z" />
                  </svg>
                ))}
              </div>
              <span className="text-sm text-gray-600">({product.reviewCount} reviews)</span>
            </div>

            {/* Price */}
            <div className="flex items-baseline gap-4">
              <span className="text-3xl sm:text-4xl font-bold text-black">₹{product.price}</span>
              {product.originalPrice && (
                <>
                  <span className="text-xl text-gray-400 line-through">₹{product.originalPrice}</span>
                  <span className="bg-yellow-100 text-yellow-800 px-3 py-1 rounded-md text-sm font-semibold">
                    {Math.round((1 - product.price / product.originalPrice) * 100)}% OFF
                  </span>
                </>
              )}
            </div>

            {/* Stock Status */}
            <div className="flex items-center gap-2">
              <div className={`w-2 h-2 rounded-full ${product.inStock ? 'bg-green-500' : 'bg-red-500'}`}></div>
              <span className={`text-sm font-medium ${product.inStock ? 'text-green-700' : 'text-red-700'}`}>
                {product.inStock ? `In Stock (${product.stockQuantity} available)` : 'Out of Stock'}
              </span>
            </div>

            {/* Colour / Variant selector */}
            {colorOptions.length > 0 && (
              <div>
                <p className="text-sm text-gray-600 mb-2">
                  {product.variants?.find((v) => /color|colour/i.test(v.name))?.name || 'Colour'}
                  {selectedColor && (() => {
                    const { name, hex } = parseColorOption(selectedColor)
                    const label = name || hex || selectedColor
                    return <span className="text-gray-900 font-medium">: {label}</span>
                  })()}
                </p>
                <div className="flex flex-wrap gap-2">
                  {colorOptions.map((opt) => {
                    const { name, hex } = parseColorOption(opt)
                    const label = name || hex || opt
                    const selected = selectedColor === opt
                    return (
                      <button
                        key={opt}
                        type="button"
                        onClick={() => setSelectedColor(opt)}
                        title={label}
                        className="rounded-md transition-opacity outline-none focus-visible:ring-2 focus-visible:ring-slate-400 focus-visible:ring-inset hover:opacity-90"
                      >
                        {hex ? (
                          <span
                            className="block w-8 h-8 rounded-[5px]"
                            style={{ backgroundColor: hex }}
                          />
                        ) : (
                          <span className="block w-8 h-8 rounded-[5px] bg-slate-200 flex items-center justify-center text-xs font-medium text-slate-600">
                            {label.slice(0, 1)}
                          </span>
                        )}
                      </button>
                    )
                  })}
                </div>
              </div>
            )}

            {/* Trust Badges */}
            {product.inStock && (
              <div>
                <div className="flex flex-wrap items-center justify-center gap-4 text-xs text-gray-600">
                  {product.freeShipping !== false && (
                    <div className="flex items-center gap-1.5">
                      <svg className="w-4 h-4 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                      <span>Free Shipping</span>
                    </div>
                  )}
                  <div className="flex items-center gap-1.5">
                    <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                    </svg>
                    <span>{product.returnDays || 30}-Day Returns</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span>Deliver in 7 days</span>
                  </div>
                </div>
              </div>
            )}

            {/* Coupon / Promo section */}
            <div className="rounded-xl border border-slate-200 overflow-hidden">
              <div className="bg-red-600 text-white px-4 py-2 text-sm font-semibold uppercase tracking-wide">
                More saving
              </div>
              <div className="p-4 bg-slate-50">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Have a coupon?</label>
                  {couponApplied ? (
                    <div className="flex items-center justify-between gap-2 p-3 bg-green-50 border border-green-200 rounded-lg">
                      <span className="text-sm font-medium text-green-800">Coupon applied</span>
                      <button
                        type="button"
                        onClick={handleRemoveCoupon}
                        className="text-sm font-medium text-green-700 underline hover:no-underline"
                      >
                        Remove
                      </button>
                    </div>
                  ) : (
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={couponCode}
                        onChange={(e) => {
                          setCouponCode(e.target.value)
                          setCouponError('')
                        }}
                        placeholder="Enter coupon code"
                        className="flex-1 min-w-0 px-4 py-2.5 rounded-lg border border-slate-300 focus:border-slate-600 focus:ring-1 focus:ring-slate-600 focus:outline-none text-sm"
                        disabled={couponLoading}
                      />
                      <button
                        type="button"
                        onClick={handleApplyCoupon}
                        disabled={couponLoading}
                        className="px-4 py-2.5 rounded-lg bg-slate-900 text-white text-sm font-medium hover:bg-slate-800 disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap"
                      >
                        {couponLoading ? 'Checking…' : 'Apply'}
                      </button>
                    </div>
                  )}
                  {couponError && (
                    <p className="mt-2 text-sm text-red-600">{couponError}</p>
                  )}
                </div>
              </div>
            </div>

            {/* Quantity Selector */}
            {product.inStock && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Quantity</label>
                <div className="flex items-center border border-gray-300 rounded-lg w-fit overflow-hidden">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="w-10 h-10 flex items-center justify-center text-gray-600 hover:text-black hover:bg-gray-50 transition-colors"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
                    </svg>
                  </button>
                  <span className="text-base font-medium text-black px-4 min-w-[3rem] text-center border-x border-gray-300">{quantity}</span>
                  <button
                    onClick={() => setQuantity(Math.min(product.stockQuantity, quantity + 1))}
                    className="w-10 h-10 flex items-center justify-center text-gray-600 hover:text-black hover:bg-gray-50 transition-colors"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                  </button>
                </div>
              </div>
            )}

            {/* CTA Buttons */}
            <div className="space-y-3 pt-4">
              {product.inStock ? (
                <>
                  <button
                    onClick={handleBuyNow}
                    disabled={addingToCart}
                    className="w-full bg-black text-white font-semibold text-base py-3.5 rounded-lg hover:bg-gray-900 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    style={{
                      backgroundColor: buttonColor,
                    }}
                    onMouseEnter={(e) => {
                      if (!addingToCart) {
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
                    {addingToCart ? (
                      <>
                        <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        <span>Processing...</span>
                      </>
                    ) : (
                      <>
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                        </svg>
                        Buy Now
                      </>
                    )}
                  </button>
                  <button
                    onClick={handleAddToCart}
                    disabled={addingToCart}
                    className="w-full bg-white border-2 border-black text-black font-semibold text-base py-3.5 rounded-lg hover:bg-gray-50 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    {addingToCart ? (
                      <>
                        <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        <span>Adding...</span>
                      </>
                    ) : (
                      <>
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 0a2 2 0 11-4 0 2 2 0 014 0z" />
                        </svg>
                        Add to Cart
                      </>
                    )}
                  </button>
                </>
              ) : (
                <button disabled className="w-full bg-gray-200 text-gray-500 py-3.5 rounded-lg font-semibold cursor-not-allowed">
                  Out of Stock
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Description Section */}
        <div className="mb-12 lg:mb-16">
          <h2 className="text-xl sm:text-2xl font-bold text-black mb-6">Description</h2>
          <div className="prose max-w-none">
            <p className="text-gray-700 leading-relaxed mb-6">{product.detailedDescription || product.description}</p>
            
            {product.features && product.features.length > 0 && (
              <div className="mt-8">
                <h3 className="text-lg font-semibold text-black mb-4">Features</h3>
                <ul className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {product.features.map((feature, index) => (
                    <li key={index} className="flex items-start gap-2">
                      <svg className="w-5 h-5 text-gray-400 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                      <span className="text-gray-700">{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {product.dimensions && (
              <div className="mt-8 pt-8 border-t border-gray-200">
                <h3 className="text-lg font-semibold text-black mb-3">Specifications</h3>
                <div className="space-y-2 text-gray-700">
                  <p>
                    <span className="font-medium">Dimensions: </span>
                    {product.dimensions.length} × {product.dimensions.width} × {product.dimensions.height} cm
                  </p>
                  {product.weight && (
                    <p>
                      <span className="font-medium">Weight: </span>
                      {product.weight} kg
                    </p>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Reviews Section */}
        <div className="mb-12 lg:mb-16">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
            <h2 className="text-xl sm:text-2xl font-bold text-black">Reviews</h2>
            <button
              onClick={() => setShowReviewForm(!showReviewForm)}
              className="text-sm font-medium text-black border border-gray-300 px-4 py-2 rounded-lg hover:bg-gray-50 transition-colors w-fit"
            >
              Write a Review
            </button>
          </div>

          {showReviewForm && (
            <div className="bg-gray-50 rounded-lg p-6 mb-6 border border-gray-200">
              <h3 className="text-lg font-semibold text-black mb-4">Write a Review</h3>
              <form onSubmit={handleReviewSubmit} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Your Name *</label>
                    <input
                      type="text"
                      value={reviewForm.name}
                      onChange={(e) => setReviewForm({ ...reviewForm, name: e.target.value })}
                      required
                      className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:border-black focus:outline-none focus:ring-1 focus:ring-black"
                      placeholder="Enter your name"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Your Age</label>
                    <input
                      type="number"
                      value={reviewForm.age}
                      onChange={(e) => setReviewForm({ ...reviewForm, age: e.target.value })}
                      className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:border-black focus:outline-none focus:ring-1 focus:ring-black"
                      placeholder="Optional"
                      min="0"
                      max="18"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Rating *</label>
                  <div className="flex gap-2">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        type="button"
                        onClick={() => setReviewForm({ ...reviewForm, rating: star })}
                        className="focus:outline-none"
                      >
                        <svg
                          className={`w-6 h-6 ${star <= reviewForm.rating ? 'text-yellow-400 fill-current' : 'text-gray-300'}`}
                          fill="currentColor"
                          viewBox="0 0 20 20"
                        >
                          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                        </svg>
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Your Review *</label>
                  <textarea
                    value={reviewForm.comment}
                    onChange={(e) => setReviewForm({ ...reviewForm, comment: e.target.value })}
                    required
                    rows="4"
                    className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:border-black focus:outline-none focus:ring-1 focus:ring-black"
                    placeholder="Share your thoughts about this product"
                  />
                </div>
                <div className="flex gap-3">
                  <button
                    type="submit"
                    className="bg-black text-white font-medium px-6 py-2 rounded-lg hover:bg-gray-900 transition-colors"
                  >
                    Submit Review
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowReviewForm(false)}
                    className="bg-white border border-gray-300 text-gray-700 font-medium px-6 py-2 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          )}

          {reviews.length === 0 ? (
            <div className="bg-gray-50 rounded-lg p-8 text-center border border-gray-200">
              <p className="text-gray-600">No reviews yet. Be the first to review!</p>
            </div>
          ) : (
            <div className="relative">
              <div className="relative overflow-hidden rounded-lg">
                <div
                  className="flex transition-transform duration-500 ease-in-out"
                  style={{
                    transform: `translateX(-${currentReviewIndex * 100}%)`,
                    width: `${reviews.length * 100}%`
                  }}
                >
                  {reviews.map((review) => (
                    <div
                      key={review._id}
                      className="bg-white border border-gray-200 rounded-lg p-6"
                      style={{
                        width: `${100 / reviews.length}%`,
                        flexShrink: 0
                      }}
                    >
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <h4 className="font-semibold text-black">{review.name}</h4>
                          {review.age && (
                            <p className="text-sm text-gray-500">Age {review.age}</p>
                          )}
                        </div>
                        <div className="flex gap-1">
                          {[...Array(5)].map((_, i) => (
                            <svg
                              key={i}
                              className={`w-4 h-4 ${i < review.rating ? 'text-yellow-400 fill-current' : 'text-gray-300'}`}
                              viewBox="0 0 20 20"
                            >
                              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                            </svg>
                          ))}
                        </div>
                      </div>
                      <p className="text-gray-700 mb-3">{review.comment}</p>
                      <p className="text-xs text-gray-500">
                        {new Date(review.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Navigation */}
              {reviews.length > 1 && (
                <>
                  <button
                    onClick={goToPrevReview}
                    className="absolute left-0 top-1/2 -translate-y-1/2 bg-white border border-gray-300 rounded-full p-2 shadow-md hover:bg-gray-50 transition-colors z-10"
                    aria-label="Previous review"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                  </button>
                  <button
                    onClick={goToNextReview}
                    className="absolute right-0 top-1/2 -translate-y-1/2 bg-white border border-gray-300 rounded-full p-2 shadow-md hover:bg-gray-50 transition-colors z-10"
                    aria-label="Next review"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </button>
                  
                  {/* Dots */}
                  <div className="flex justify-center gap-2 mt-6">
                    {reviews.map((_, index) => (
                      <button
                        key={index}
                        onClick={() => goToReview(index)}
                        className={`transition-all duration-200 rounded-full ${
                          index === currentReviewIndex
                            ? 'w-2 h-2 bg-black'
                            : 'w-2 h-2 bg-gray-300 hover:bg-gray-400'
                        }`}
                        aria-label={`Go to review ${index + 1}`}
                      />
                    ))}
                  </div>
                </>
              )}
            </div>
          )}
        </div>

        {/* Related Products CTA */}
        <div className="text-center bg-gray-50 rounded-lg p-8 lg:p-12 border border-gray-200">
          <h2 className="text-xl sm:text-2xl font-bold text-black mb-3">Explore More Products</h2>
          <p className="text-gray-600 mb-6">Discover more amazing toys and gadgets</p>
          <Link to="/products" className="inline-block bg-black text-white font-medium px-6 py-3 rounded-lg hover:bg-gray-900 transition-colors">
            View All Products
          </Link>
        </div>
      </div>
    </div>
  )
}

export default ProductDetail

