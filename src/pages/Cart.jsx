import { useEffect, useState, useCallback } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { getCart, updateCartItem, removeFromCart } from '../services/cartService'
import { useButtonColor } from '../hooks/useButtonColor'
import Skeleton from '../components/Skeleton'
import api from '../services/api'
import { computeWeightShippingRupeesForZone, shippingZoneLabel } from '../utils/shipping'

// Row with local quantity so +/- feel instant
function CartItemRow({ item, index, updatingId, onQuantityChange, onRemove }) {
  const [localQty, setLocalQty] = useState(item.quantity)
  const isUpdating = updatingId === item._id
  const maxQty = item.product?.stockQuantity

  useEffect(() => {
    if (updatingId !== item._id) setLocalQty(item.quantity)
  }, [item.quantity, item._id, updatingId])

  const handleMinus = useCallback(() => {
    if (localQty <= 1) return
    const next = localQty - 1
    setLocalQty(next)
    onQuantityChange(item._id, next)
  }, [localQty, item._id, onQuantityChange])

  const handlePlus = useCallback(() => {
    if (maxQty != null && localQty >= maxQty) return
    const next = localQty + 1
    setLocalQty(next)
    onQuantityChange(item._id, next)
  }, [localQty, maxQty, item._id, onQuantityChange])

  const price = item.product?.price || 0
  const lineTotal = (price * localQty).toFixed(2)

  return (
    <div className="bg-white border border-slate-200 rounded-xl p-6">
      <div className="flex flex-col sm:flex-row gap-4">
        <Link to={`/products/${item.product?._id || item.product}`} className="flex-shrink-0 group">
          <img
            src={item.product?.images?.[0] || 'https://via.placeholder.com/128'}
            alt={item.product?.name || 'Product'}
            className="w-32 h-32 object-cover rounded-lg group-hover:opacity-95"
            loading="lazy"
            decoding="async"
            onError={(e) => { e.target.src = 'https://via.placeholder.com/128' }}
          />
        </Link>
        <div className="flex-grow min-w-0">
          <Link to={`/products/${item.product?._id || item.product}`}>
            <h3 className="text-xl font-bold text-slate-900 mb-2 hover:text-slate-700">{item.product?.name || 'Product'}</h3>
          </Link>
          <p className="text-slate-600 text-sm mb-4 line-clamp-2">{item.product?.description || ''}</p>
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div className="flex items-center gap-4">
              <span className="text-lg font-bold text-slate-900">₹{price}</span>
              {item.product?.originalPrice && (
                <span className="text-slate-400 line-through text-sm">₹{item.product.originalPrice}</span>
              )}
            </div>
            <div className="flex items-center gap-3">
              <div className="flex items-center border border-slate-200 rounded-lg overflow-hidden bg-white">
                <button
                  type="button"
                  onClick={handleMinus}
                  disabled={isUpdating || localQty <= 1}
                  className="min-w-[44px] min-h-[44px] flex items-center justify-center text-slate-700 hover:bg-slate-100 active:bg-slate-200 disabled:opacity-40 disabled:pointer-events-none select-none"
                  aria-label="Decrease quantity"
                >
                  −
                </button>
                <span className="min-w-[2.5rem] text-center font-semibold text-slate-900 tabular-nums" aria-live="polite">
                  {localQty}
                </span>
                <button
                  type="button"
                  onClick={handlePlus}
                  disabled={isUpdating || (maxQty != null && localQty >= maxQty)}
                  className="min-w-[44px] min-h-[44px] flex items-center justify-center text-slate-700 hover:bg-slate-100 active:bg-slate-200 disabled:opacity-40 disabled:pointer-events-none select-none"
                  aria-label="Increase quantity"
                >
                  +
                </button>
              </div>
              <button
                type="button"
                onClick={() => onRemove(item._id)}
                className="p-2 text-red-600 hover:bg-red-50 rounded-lg min-w-[44px] min-h-[44px] flex items-center justify-center"
                aria-label="Remove item"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </button>
            </div>
          </div>
          <div className="mt-3 text-right">
            <span className="text-base font-semibold text-slate-900">Total: ₹{lineTotal}</span>
          </div>
        </div>
      </div>
    </div>
  )
}

function Cart() {
  const [cart, setCart] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [updatingId, setUpdatingId] = useState(null)
   const [couponInfo, setCouponInfo] = useState(null) // { code, discountAmount }
   const [couponError, setCouponError] = useState('')
  const [weightShipConfig, setWeightShipConfig] = useState({
    enabled: false,
    keralaPerKg: 0,
    restOfIndiaPerKg: 0,
  })
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
    fetchCart()
  }, [])

  useEffect(() => {
    const load = async () => {
      try {
        const res = await api.get('/settings/weight-shipping')
        const rest = Math.max(0, Number(res.data?.restOfIndiaPerKg ?? res.data?.perKgRate) || 0)
        const kerRaw = res.data?.keralaPerKg
        const ker =
          kerRaw !== undefined && kerRaw !== null && kerRaw !== ''
            ? Math.max(0, Number(kerRaw) || 0)
            : rest
        setWeightShipConfig({
          enabled: Boolean(res.data?.enabled),
          keralaPerKg: ker,
          restOfIndiaPerKg: rest,
        })
      } catch {
        setWeightShipConfig({ enabled: false, keralaPerKg: 0, restOfIndiaPerKg: 0 })
      }
    }
    load()
  }, [])

  // Re-validate any coupon applied on the product page using current cart subtotal
  useEffect(() => {
    if (!cart || !cart.items || cart.items.length === 0) {
      setCouponInfo(null)
      setCouponError('')
      return
    }

    let stored = null
    try {
      stored = localStorage.getItem('appliedCoupon')
    } catch {
      stored = null
    }
    if (!stored) {
      setCouponInfo(null)
      setCouponError('')
      return
    }

    let parsed
    try {
      parsed = JSON.parse(stored)
    } catch {
      parsed = null
    }
    const code = parsed?.code
    if (!code) return

    let cancelled = false

    const run = async () => {
      try {
        const subtotalForCoupon = cart.items.reduce((sum, item) => {
          if (!item || !item.product || !item.product.price) return sum
          return sum + (item.product.price * item.quantity)
        }, 0)
        const res = await api.post('/coupons/validate', {
          code,
          subtotal: subtotalForCoupon
        })
        if (cancelled) return
        const discountAmount = res.data?.discountAmount || 0
        if (discountAmount > 0) {
          setCouponInfo({ code, discountAmount })
          setCouponError('')
        } else {
          setCouponInfo(null)
        }
      } catch (err) {
        if (cancelled) return
        setCouponInfo(null)
        const msg = err.response?.data?.message
        if (msg) setCouponError(msg)
      }
    }

    run()

    return () => {
      cancelled = true
    }
  }, [cart])

  const fetchCart = async () => {
    try {
      setError(null)
      const data = await getCart()
      // Ensure cart has items array
      if (data && !data.items) {
        data.items = []
      }
      setCart(data || { items: [] })
    } catch (error) {
      console.error('Error fetching cart:', error)
      setError('Failed to load cart. Please try again.')
      // Set empty cart on error to prevent white screen
      setCart({ items: [] })
    } finally {
      setLoading(false)
    }
  }

  const handleQuantityChange = useCallback(async (itemId, newQuantity) => {
    if (newQuantity < 1) {
      await handleRemoveItem(itemId)
      return
    }
    if (updatingId) return
    const prevCart = cart
    setUpdatingId(itemId)
    setCart((c) => ({
      ...c,
      items: c.items.map((i) =>
        i._id === itemId ? { ...i, quantity: newQuantity } : i
      ),
    }))
    try {
      await updateCartItem(itemId, newQuantity)
      window.dispatchEvent(new Event('cartUpdated'))
    } catch (err) {
      console.error('Error updating cart:', err)
      setCart(prevCart)
    } finally {
      setUpdatingId(null)
    }
  }, [updatingId, cart])

  const handleRemoveItem = async (itemId) => {
    try {
      await removeFromCart(itemId)
      await fetchCart()
      // Wait a bit then notify navbar to update cart count
      await new Promise(resolve => setTimeout(resolve, 300))
      window.dispatchEvent(new Event('cartUpdated'))
    } catch (error) {
      console.error('Error removing item:', error)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen py-8 bg-surface-subtle">
        <div className="container mx-auto px-4 max-w-4xl">
          <Skeleton className="h-9 w-64 mb-8" />
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-white rounded-xl border border-slate-200 p-6 flex gap-4">
                <Skeleton className="w-32 h-32 rounded-lg flex-shrink-0" />
                <div className="flex-1 min-w-0 space-y-2">
                  <Skeleton className="h-5 w-full" />
                  <Skeleton className="h-4 w-2/3" />
                  <div className="flex gap-4 pt-2">
                    <Skeleton className="h-8 w-20" />
                    <Skeleton className="h-8 w-24 rounded-lg" />
                  </div>
                </div>
              </div>
            ))}
          </div>
          <div className="mt-8 bg-white rounded-xl border border-slate-200 p-6">
            <Skeleton className="h-5 w-24 mb-4" />
            <Skeleton className="h-10 w-full rounded-lg" />
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen py-20 bg-surface-subtle">
        <div className="container mx-auto px-4 text-center max-w-md">
          <div className="bg-red-50 border border-red-200 rounded-xl p-6 mb-6">
            <p className="text-red-800 font-medium">{error}</p>
          </div>
          <button onClick={fetchCart} className="btn-primary">Try again</button>
        </div>
      </div>
    )
  }

  if (!cart || !cart.items || cart.items.length === 0) {
    return (
      <div className="min-h-screen py-20 bg-surface-subtle">
        <div className="container mx-auto px-4 text-center max-w-md">
          <div className="bg-slate-200 w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-6">
            <svg className="w-12 h-12 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
          </div>
          <h2 className="font-display text-display-sm font-semibold text-slate-900 mb-2">Your cart is empty</h2>
          <p className="text-slate-600 mb-8">Add items from the store to get started.</p>
          <Link to="/products" className="btn-primary inline-block">Browse products</Link>
        </div>
      </div>
    )
  }

  const subtotal = cart.items.reduce((sum, item) => {
    if (!item.product || !item.product.price) return sum
    return sum + (item.product.price * item.quantity)
  }, 0)

  const totalSavings = cart.items.reduce((sum, item) => {
    if (!item.product?.price) return sum
    const orig = item.product.originalPrice
    if (orig != null && Number(orig) > item.product.price) {
      return sum + (Number(orig) - item.product.price) * item.quantity
    }
    return sum
  }, 0)

  const couponDiscount = couponInfo?.discountAmount || 0
  // 18% tax is included in prices (tax-inclusive)
  const taxIncluded = subtotal * (0.18 / 1.18)
  let cartShipState = ''
  try {
    const raw = localStorage.getItem('savedShippingAddress')
    if (raw) {
      const j = JSON.parse(raw)
      if (typeof j?.state === 'string') cartShipState = j.state.trim()
    }
  } catch {
    cartShipState = ''
  }
  const zoneRates = {
    keralaPerKg: weightShipConfig.keralaPerKg,
    restOfIndiaPerKg: weightShipConfig.restOfIndiaPerKg,
  }
  const shippingCost = computeWeightShippingRupeesForZone(
    cart.items,
    weightShipConfig.enabled,
    zoneRates,
    cartShipState
  )
  const total = Math.max(0, subtotal - couponDiscount + shippingCost)

  return (
    <div className="bg-white min-h-screen py-8">
      <div className="container mx-auto px-4">
        <h1 className="text-3xl sm:text-4xl md:text-5xl font-black text-black mb-8">Your Shopping Cart 🛒</h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Cart Items */}
          <div className="lg:col-span-2 space-y-4">
            {cart.items.map((item, index) => {
              if (!item || !item.product) return null
              return (
                <CartItemRow
                  key={item._id}
                  item={item}
                  index={index}
                  updatingId={updatingId}
                  onQuantityChange={handleQuantityChange}
                  onRemove={handleRemoveItem}
                />
              )
            })}
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <div className="bg-yellow-400 rounded-xl p-6 sticky top-24">
              <h2 className="text-xl sm:text-2xl font-black text-black mb-6">Order Summary 📋</h2>
              
              <div className="space-y-4 mb-6">
                <div className="flex justify-between text-gray-800">
                  <span>Subtotal</span>
                  <span className="font-bold">₹{subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-gray-800">
                  <span>
                    <span className="block">GST (18%)</span>
                    <span className="block text-[11px] font-normal text-slate-500 mt-0.5">Included in subtotal — not added again</span>
                  </span>
                  <span className="font-bold tabular-nums">₹{taxIncluded.toFixed(2)}</span>
                </div>
                {totalSavings > 0 && (
                  <div className="flex justify-between text-green-700">
                    <span className="font-medium">You save on offers</span>
                    <span className="font-bold">₹{totalSavings.toFixed(2)}</span>
                  </div>
                )}
                {couponDiscount > 0 && (
                  <div className="flex justify-between text-green-700">
                    <span className="font-medium">
                      Coupon discount{couponInfo?.code ? ` (${couponInfo.code})` : ''}
                    </span>
                    <span className="font-bold">₹{couponDiscount.toFixed(2)}</span>
                  </div>
                )}
                {weightShipConfig.enabled &&
                  (weightShipConfig.keralaPerKg > 0 || weightShipConfig.restOfIndiaPerKg > 0) && (
                  <div className="flex justify-between text-gray-800">
                    <span>
                      <span className="block font-medium">
                        Shipping ({shippingZoneLabel(cartShipState)})
                      </span>
                      <span className="block text-[11px] font-normal text-slate-500 mt-0.5">
                        By weight · free-shipping items excluded
                        {!cartShipState && ' · final rate at checkout by state'}
                      </span>
                    </span>
                    <span className="font-bold tabular-nums">₹{shippingCost.toFixed(2)}</span>
                  </div>
                )}
                <div className="border-t-2 border-black pt-4 flex justify-between">
                  <span className="text-xl font-black text-black">Total</span>
                  <span className="text-xl font-black text-black">₹{total.toFixed(2)}</span>
                </div>
              </div>

              <button
                onClick={() => navigate('/checkout')}
                className="w-full text-white font-semibold text-base sm:text-lg py-4 sm:py-5 rounded-md transition-all duration-200 active:scale-[0.98] shadow-md hover:shadow-lg flex items-center justify-center gap-2 mb-4"
                style={{
                  backgroundColor: buttonColor,
                  border: 'none',
                  outline: 'none'
                }}
                onMouseEnter={(e) => {
                  const rgb = hexToRgb(buttonColor)
                  if (rgb) {
                    e.target.style.backgroundColor = `rgb(${Math.max(0, rgb.r - 20)}, ${Math.max(0, rgb.g - 20)}, ${Math.max(0, rgb.b - 20)})`
                  }
                }}
                onMouseLeave={(e) => {
                  e.target.style.backgroundColor = buttonColor
                }}
              >
                <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                </svg>
                Buy Now
              </button>
              
              <Link
                to="/products"
                className="block w-full text-center bg-white text-black font-bold py-3 px-6 rounded-lg hover:bg-gray-100 active:bg-gray-200 transition-all duration-200 transform hover:scale-105 active:scale-95"
              >
                Keep Shopping! 🛍️
              </Link>

              <div className="mt-6 pt-6 border-t-2 border-black">
                <div className="flex items-center gap-2 text-sm text-gray-800">
                  <svg className="w-5 h-5 text-black" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                  </svg>
                  <span>Secure Checkout</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Cart
