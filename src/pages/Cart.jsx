import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { getCart, updateCartItem, removeFromCart } from '../services/cartService'
import { useButtonColor } from '../hooks/useButtonColor'

function Cart() {
  const [cart, setCart] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
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

  const handleQuantityChange = async (itemId, newQuantity) => {
    if (newQuantity < 1) {
      // If quantity becomes 0, remove the item
      await handleRemoveItem(itemId)
      return
    }
    try {
      await updateCartItem(itemId, newQuantity)
      await fetchCart()
      // Wait a bit then notify navbar to update cart count
      await new Promise(resolve => setTimeout(resolve, 300))
      window.dispatchEvent(new Event('cartUpdated'))
    } catch (error) {
      console.error('Error updating cart:', error)
    }
  }

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
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-yellow-400"></div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen py-20 bg-white">
        <div className="container mx-auto px-4 text-center">
          <div className="max-w-md mx-auto">
            <div className="bg-red-100 border-2 border-red-400 rounded-lg p-6 mb-6">
              <p className="text-red-800 font-bold">{error}</p>
            </div>
            <button
              onClick={fetchCart}
              className="btn-primary text-lg px-8 py-4"
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    )
  }

  if (!cart || !cart.items || cart.items.length === 0) {
    return (
      <div className="min-h-screen py-20">
        <div className="container mx-auto px-4 text-center">
          <div className="max-w-md mx-auto">
            <div className="bg-yellow-400 w-32 h-32 rounded-full flex items-center justify-center mx-auto mb-6">
              <svg className="w-16 h-16 text-black" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-black mb-4">Your Cart is Empty 🛒</h2>
            <p className="text-xl text-gray-600 mb-8">Time to fill it up with awesome stuff! 🎁</p>
            <Link to="/products" className="btn-primary text-lg px-8 py-4 inline-block">
              Let's Go Shopping! 🚀
            </Link>
          </div>
        </div>
      </div>
    )
  }

  const subtotal = cart.items.reduce((sum, item) => {
    if (!item.product || !item.product.price) return sum
    return sum + (item.product.price * item.quantity)
  }, 0)

  const tax = subtotal * 0.1
  const total = subtotal + tax

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
              <div key={item._id || index} className="bg-white border-2 border-gray-200 rounded-xl p-6 hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1 fade-in" style={{ animationDelay: `${index * 0.1}s` }}>
                <div className="flex flex-col sm:flex-row gap-4">
                  <Link to={`/products/${item.product._id || item.product}`} className="flex-shrink-0 group">
                    <img
                      src={item.product.images?.[0] || 'https://via.placeholder.com/128'}
                      alt={item.product.name || 'Product'}
                      className="w-32 h-32 object-cover rounded-lg transition-transform duration-300 group-hover:scale-110"
                      onError={(e) => {
                        e.target.src = 'https://via.placeholder.com/128'
                      }}
                    />
                  </Link>
                  
                  <div className="flex-grow">
                    <Link to={`/products/${item.product._id || item.product}`}>
                      <h3 className="text-xl font-bold text-black mb-2 hover:text-yellow-400 transition-all duration-200 transform hover:scale-105">
                        {item.product.name || 'Product'}
                      </h3>
                    </Link>
                    <p className="text-gray-600 mb-4 line-clamp-2">{item.product.description || ''}</p>
                    
                    <div className="flex items-center justify-between flex-wrap gap-4">
                      <div className="flex items-center gap-4">
                        <span className="text-2xl font-black text-black">₹{item.product.price || 0}</span>
                        {item.product.originalPrice && (
                          <span className="text-gray-400 line-through">₹{item.product.originalPrice}</span>
                        )}
                      </div>
                      
                      <div className="flex items-center gap-4">
                        <div className="flex items-center border-2 border-gray-300 rounded-lg overflow-hidden">
                          <button
                            onClick={() => handleQuantityChange(item._id, item.quantity - 1)}
                            className="px-3 py-1 hover:bg-gray-100 active:bg-gray-200 transition-all duration-200 touch-target"
                          >
                            -
                          </button>
                          <span className="px-4 py-1 font-bold">{item.quantity}</span>
                          <button
                            onClick={() => handleQuantityChange(item._id, item.quantity + 1)}
                            className="px-3 py-1 hover:bg-gray-100 active:bg-gray-200 transition-all duration-200 touch-target"
                          >
                            +
                          </button>
                        </div>
                        
                        <button
                          onClick={() => handleRemoveItem(item._id)}
                          className="p-2 text-red-600 hover:text-red-800 active:text-red-900 hover:bg-red-50 rounded-lg transition-all duration-200 transform hover:scale-110 active:scale-95 touch-target"
                          aria-label="Remove item"
                        >
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      </div>
                    </div>
                    
                    <div className="mt-4 text-right">
                      <span className="text-lg font-bold text-black">
                        Total: ₹{((item.product.price || 0) * item.quantity).toFixed(2)}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
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
                  <span>Tax (10%)</span>
                  <span className="font-bold">₹{tax.toFixed(2)}</span>
                </div>
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
                <div className="flex items-center gap-2 text-sm text-gray-800 mb-2">
                  <svg className="w-5 h-5 text-black" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                  </svg>
                  <span>Secure Checkout</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-800">
                  <svg className="w-5 h-5 text-black" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <span>30-Day Returns</span>
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
