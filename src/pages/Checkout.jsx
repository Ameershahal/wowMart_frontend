import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { getCart } from '../services/cartService'
import { createOrder } from '../services/orderService'
import { useButtonColor } from '../hooks/useButtonColor'

function Checkout() {
  const navigate = useNavigate()
  const { buttonColor } = useButtonColor()
  const [cart, setCart] = useState(null)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    street: '',
    city: '',
    state: '',
    zipCode: '',
    country: 'United States'
  })
  const [paymentMethod, setPaymentMethod] = useState('card')
  const [cardDetails, setCardDetails] = useState({
    cardNumber: '',
    expiryDate: '',
    cvv: '',
    cardholderName: ''
  })

  // Format card number with spaces
  const formatCardNumber = (value) => {
    const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '')
    const matches = v.match(/\d{4,16}/g)
    const match = matches && matches[0] || ''
    const parts = []
    for (let i = 0, len = match.length; i < len; i += 4) {
      parts.push(match.substring(i, i + 4))
    }
    if (parts.length) {
      return parts.join(' ')
    } else {
      return v
    }
  }

  // Format expiry date (MM/YY)
  const formatExpiryDate = (value) => {
    const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '')
    if (v.length >= 2) {
      return v.substring(0, 2) + '/' + v.substring(2, 4)
    }
    return v
  }

  // Format CVV (numbers only, max 4)
  const formatCVV = (value) => {
    return value.replace(/[^0-9]/gi, '').substring(0, 4)
  }

  const handleCardInputChange = (field, value) => {
    let formattedValue = value
    if (field === 'cardNumber') {
      formattedValue = formatCardNumber(value)
    } else if (field === 'expiryDate') {
      formattedValue = formatExpiryDate(value)
    } else if (field === 'cvv') {
      formattedValue = formatCVV(value)
    }
    
    setCardDetails({
      ...cardDetails,
      [field]: formattedValue
    })
  }

  useEffect(() => {
    const fetchCart = async () => {
      try {
        const data = await getCart()
        // Ensure cart has items array
        if (data && !data.items) {
          data.items = []
        }
        if (!data || !data.items || data.items.length === 0) {
          setCart({ items: [] })
          setLoading(false)
          return
        }
        setCart(data)
      } catch (error) {
        console.error('Error fetching cart:', error)
        // Set empty cart on error to prevent white screen
        setCart({ items: [] })
      } finally {
        setLoading(false)
      }
    }
    fetchCart()
  }, [navigate])

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSubmitting(true)

    try {
      const customerInfo = {
        name: formData.name,
        email: formData.email.trim().toLowerCase(), // Normalize email for consistent matching
        phone: formData.phone,
        address: {
          street: formData.street,
          city: formData.city,
          state: formData.state,
          zipCode: formData.zipCode,
          country: formData.country
        },
        paymentMethod: paymentMethod
      }

      const order = await createOrder(customerInfo)
      // Store email in localStorage for My Orders page (normalized)
      localStorage.setItem('orderEmail', formData.email.trim().toLowerCase())
      navigate(`/order-success/${order.orderNumber}`)
    } catch (error) {
      console.error('Error creating order:', error)
      alert('Failed to place order. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-yellow-400"></div>
      </div>
    )
  }

  if (!cart || !cart.items || cart.items.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="text-center">
          <p className="text-xl font-bold text-black mb-4">Your cart is empty!</p>
          <button
            onClick={() => navigate('/')}
            className="bg-yellow-400 text-black px-6 py-3 rounded-lg font-bold hover:bg-yellow-500 transition-all"
          >
            Continue Shopping
          </button>
        </div>
      </div>
    )
  }

  const subtotal = cart.items.reduce((sum, item) => {
    if (!item || !item.product || !item.product.price) return sum
    return sum + (item.product.price * item.quantity)
  }, 0)
  const tax = subtotal * 0.1
  const total = subtotal + tax

  return (
    <div className="bg-white min-h-screen py-8">
      <div className="container mx-auto px-4">
        <h1 className="text-3xl sm:text-4xl md:text-5xl font-black text-black mb-8">Almost There! 🎉</h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Checkout Form */}
          <div className="lg:col-span-2">
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Customer Information */}
              <div className="bg-gray-50 rounded-xl p-6">
                <h2 className="text-2xl font-black text-black mb-6">Tell Us About You! 👤</h2>
                <div className="space-y-4">
                  <div>
                    <label className="block text-black font-bold mb-2">Full Name *</label>
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      required
                      className="w-full px-4 py-3 rounded-lg border-2 border-gray-300 focus:border-yellow-400 focus:outline-none focus:ring-2 focus:ring-yellow-400 transition-all duration-200"
                    />
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-black font-bold mb-2">Email *</label>
                      <input
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleInputChange}
                        required
                        className="w-full px-4 py-3 rounded-lg border-2 border-gray-300 focus:border-yellow-400 focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:ring-offset-2 transition-all duration-200 hover:border-yellow-300"
                      />
                    </div>
                    <div>
                      <label className="block text-black font-bold mb-2">Phone *</label>
                      <input
                        type="tel"
                        name="phone"
                        value={formData.phone}
                        onChange={handleInputChange}
                        required
                        className="w-full px-4 py-3 rounded-lg border-2 border-gray-300 focus:border-yellow-400 focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:ring-offset-2 transition-all duration-200 hover:border-yellow-300"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Shipping Address */}
              <div className="bg-gray-50 rounded-xl p-6">
                <h2 className="text-lg sm:text-xl md:text-2xl font-black text-black mb-6">Where Should We Send It? 📦</h2>
                <div className="space-y-4">
                  <div>
                    <label className="block text-black font-bold mb-2">Street Address *</label>
                    <input
                      type="text"
                      name="street"
                      value={formData.street}
                      onChange={handleInputChange}
                      required
                      className="w-full px-4 py-3 rounded-lg border-2 border-gray-300 focus:border-yellow-400 focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:ring-offset-2 transition-all duration-200 hover:border-yellow-300"
                    />
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-black font-bold mb-2">City *</label>
                      <input
                        type="text"
                        name="city"
                        value={formData.city}
                        onChange={handleInputChange}
                        required
                        className="w-full px-4 py-3 rounded-lg border-2 border-gray-300 focus:border-yellow-400 focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:ring-offset-2 transition-all duration-200 hover:border-yellow-300"
                      />
                    </div>
                    <div>
                      <label className="block text-black font-bold mb-2">State *</label>
                      <input
                        type="text"
                        name="state"
                        value={formData.state}
                        onChange={handleInputChange}
                        required
                        className="w-full px-4 py-3 rounded-lg border-2 border-gray-300 focus:border-yellow-400 focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:ring-offset-2 transition-all duration-200 hover:border-yellow-300"
                      />
                    </div>
                    <div>
                      <label className="block text-black font-bold mb-2">Zip Code *</label>
                      <input
                        type="text"
                        name="zipCode"
                        value={formData.zipCode}
                        onChange={handleInputChange}
                        required
                        className="w-full px-4 py-3 rounded-lg border-2 border-gray-300 focus:border-yellow-400 focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:ring-offset-2 transition-all duration-200 hover:border-yellow-300"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-black font-bold mb-2">Country *</label>
                    <input
                      type="text"
                      name="country"
                      value={formData.country}
                      onChange={handleInputChange}
                      required
                      className="w-full px-4 py-3 rounded-lg border-2 border-gray-300 focus:border-yellow-400 focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:ring-offset-2 transition-all duration-200 hover:border-yellow-300"
                    />
                  </div>
                </div>
              </div>

              {/* Payment Method Selection */}
              <div className="bg-gray-50 rounded-xl p-6">
                <h2 className="text-lg sm:text-xl md:text-2xl font-black text-black mb-6">Choose Payment Method 💳</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Credit/Debit Card */}
                  <button
                    type="button"
                    onClick={() => setPaymentMethod('card')}
                    className={`p-5 rounded-xl border-2 transition-all duration-200 text-left ${
                      paymentMethod === 'card'
                        ? 'border-yellow-400 bg-yellow-50 shadow-lg scale-105'
                        : 'border-gray-300 bg-white hover:border-yellow-300 hover:shadow-md'
                    }`}
                  >
                    <div className="flex items-center space-x-3 mb-2">
                      <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                        paymentMethod === 'card' ? 'border-yellow-500 bg-yellow-500' : 'border-gray-400'
                      }`}>
                        {paymentMethod === 'card' && (
                          <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                          </svg>
                        )}
                      </div>
                      <svg className="w-8 h-8 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                      </svg>
                    </div>
                    <p className="font-bold text-black text-sm">Credit/Debit Card</p>
                    <p className="text-xs text-gray-600 mt-1">Visa, Mastercard, etc.</p>
                  </button>

                  {/* Razorpay */}
                  <button
                    type="button"
                    onClick={() => setPaymentMethod('razorpay')}
                    className={`p-5 rounded-xl border-2 transition-all duration-200 text-left ${
                      paymentMethod === 'razorpay'
                        ? 'border-yellow-400 bg-yellow-50 shadow-lg scale-105'
                        : 'border-gray-300 bg-white hover:border-yellow-300 hover:shadow-md'
                    }`}
                  >
                    <div className="flex items-center space-x-3 mb-2">
                      <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                        paymentMethod === 'razorpay' ? 'border-yellow-500 bg-yellow-500' : 'border-gray-400'
                      }`}>
                        {paymentMethod === 'razorpay' && (
                          <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                          </svg>
                        )}
                      </div>
                      <svg className="w-8 h-8 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                      </svg>
                    </div>
                    <p className="font-bold text-black text-sm">Razorpay</p>
                    <p className="text-xs text-gray-600 mt-1">Secure payment gateway</p>
                  </button>

                  {/* Cash on Delivery */}
                  <button
                    type="button"
                    onClick={() => setPaymentMethod('cod')}
                    className={`p-5 rounded-xl border-2 transition-all duration-200 text-left ${
                      paymentMethod === 'cod'
                        ? 'border-yellow-400 bg-yellow-50 shadow-lg scale-105'
                        : 'border-gray-300 bg-white hover:border-yellow-300 hover:shadow-md'
                    }`}
                  >
                    <div className="flex items-center space-x-3 mb-2">
                      <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                        paymentMethod === 'cod' ? 'border-yellow-500 bg-yellow-500' : 'border-gray-400'
                      }`}>
                        {paymentMethod === 'cod' && (
                          <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                          </svg>
                        )}
                      </div>
                      <svg className="w-8 h-8 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
                      </svg>
                    </div>
                    <p className="font-bold text-black text-sm">Cash on Delivery</p>
                    <p className="text-xs text-gray-600 mt-1">Pay when you receive</p>
                  </button>

                  {/* Bank Transfer */}
                  <button
                    type="button"
                    onClick={() => setPaymentMethod('bank')}
                    className={`p-5 rounded-xl border-2 transition-all duration-200 text-left ${
                      paymentMethod === 'bank'
                        ? 'border-yellow-400 bg-yellow-50 shadow-lg scale-105'
                        : 'border-gray-300 bg-white hover:border-yellow-300 hover:shadow-md'
                    }`}
                  >
                    <div className="flex items-center space-x-3 mb-2">
                      <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                        paymentMethod === 'bank' ? 'border-yellow-500 bg-yellow-500' : 'border-gray-400'
                      }`}>
                        {paymentMethod === 'bank' && (
                          <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                          </svg>
                        )}
                      </div>
                      <svg className="w-8 h-8 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M8 14v3m4-3v3m4-3v3M3 21h18M3 10h18M3 7l9-4 9 4M4 10h16v11H4V10z" />
                      </svg>
                    </div>
                    <p className="font-bold text-black text-sm">Bank Transfer</p>
                    <p className="text-xs text-gray-600 mt-1">Direct bank transfer</p>
                  </button>
                </div>

                {/* Payment Method Details (if card selected) */}
                {paymentMethod === 'card' && (
                  <div className="mt-6 p-5 bg-white rounded-lg border-2 border-gray-200 space-y-4">
                    <div>
                      <label className="block text-black font-bold mb-2 text-sm">Card Number *</label>
                      <input
                        type="text"
                        value={cardDetails.cardNumber}
                        onChange={(e) => handleCardInputChange('cardNumber', e.target.value)}
                        placeholder="1234 5678 9012 3456"
                        maxLength="19"
                        className="w-full px-4 py-3 rounded-lg border-2 border-gray-300 focus:border-yellow-400 focus:outline-none focus:ring-2 focus:ring-yellow-400 transition-all duration-200"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-black font-bold mb-2 text-sm">Expiry Date *</label>
                        <input
                          type="text"
                          value={cardDetails.expiryDate}
                          onChange={(e) => handleCardInputChange('expiryDate', e.target.value)}
                          placeholder="MM/YY"
                          maxLength="5"
                          className="w-full px-4 py-3 rounded-lg border-2 border-gray-300 focus:border-yellow-400 focus:outline-none focus:ring-2 focus:ring-yellow-400 transition-all duration-200"
                        />
                      </div>
                      <div>
                        <label className="block text-black font-bold mb-2 text-sm">CVV *</label>
                        <input
                          type="text"
                          value={cardDetails.cvv}
                          onChange={(e) => handleCardInputChange('cvv', e.target.value)}
                          placeholder="123"
                          maxLength="4"
                          className="w-full px-4 py-3 rounded-lg border-2 border-gray-300 focus:border-yellow-400 focus:outline-none focus:ring-2 focus:ring-yellow-400 transition-all duration-200"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-black font-bold mb-2 text-sm">Cardholder Name *</label>
                      <input
                        type="text"
                        value={cardDetails.cardholderName}
                        onChange={(e) => handleCardInputChange('cardholderName', e.target.value)}
                        placeholder="John Doe"
                        className="w-full px-4 py-3 rounded-lg border-2 border-gray-300 focus:border-yellow-400 focus:outline-none focus:ring-2 focus:ring-yellow-400 transition-all duration-200"
                      />
                    </div>
                  </div>
                )}

                {paymentMethod === 'razorpay' && (
                  <div className="mt-6 p-5 bg-indigo-50 rounded-lg border-2 border-indigo-200">
                    <p className="text-sm text-gray-700">
                      You will be redirected to Razorpay to complete your payment securely. Supports UPI, Cards, Wallets, and Net Banking.
                    </p>
                  </div>
                )}

                {paymentMethod === 'cod' && (
                  <div className="mt-6 p-5 bg-green-50 rounded-lg border-2 border-green-200">
                    <p className="text-sm text-gray-700">
                      Pay with cash when your order is delivered. An extra fee may apply.
                    </p>
                  </div>
                )}

                {paymentMethod === 'bank' && (
                  <div className="mt-6 p-5 bg-white rounded-lg border-2 border-gray-200">
                    <p className="text-sm font-semibold text-black mb-2">Bank Details:</p>
                    <div className="space-y-1 text-xs text-gray-700">
                      <p><span className="font-semibold">Account Name:</span> WowMart Inc.</p>
                      <p><span className="font-semibold">Account Number:</span> 1234567890</p>
                      <p><span className="font-semibold">Bank:</span> Example Bank</p>
                      <p><span className="font-semibold">SWIFT:</span> EXMPUS33</p>
                    </div>
                    <p className="text-xs text-gray-600 mt-3">Please include your order number in the transfer reference.</p>
                  </div>
                )}
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="w-full text-white font-semibold text-base sm:text-lg py-4 sm:py-5 rounded-md transition-all duration-200 active:scale-[0.98] shadow-md hover:shadow-lg flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                style={{
                  backgroundColor: buttonColor,
                  border: 'none',
                  outline: 'none'
                }}
                onMouseEnter={(e) => {
                  if (!submitting) {
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
                {submitting ? (
                  <>
                    <svg className="animate-spin h-4 w-4 sm:h-5 sm:w-5" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    <span>Placing Order...</span>
                  </>
                ) : (
                  <>
                    <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                    </svg>
                    <span>Buy Now</span>
                  </>
                )}
              </button>
            </form>
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <div className="bg-yellow-400 rounded-xl p-6 sticky top-24">
              <h2 className="text-xl sm:text-2xl font-black text-black mb-6">Order Summary 📋</h2>
              
              <div className="space-y-3 mb-6">
                {cart.items.map((item) => {
                  if (!item || !item.product) return null
                  return (
                    <div key={item._id || Math.random()} className="flex items-center gap-3 pb-3 border-b border-black">
                      <img
                        src={item.product.images?.[0] || 'https://via.placeholder.com/64'}
                        alt={item.product.name || 'Product'}
                        className="w-16 h-16 object-cover rounded-lg"
                        onError={(e) => {
                          e.target.src = 'https://via.placeholder.com/64'
                        }}
                      />
                      <div className="flex-grow">
                        <p className="font-semibold text-sm text-black line-clamp-1">{item.product.name || 'Product'}</p>
                        <p className="text-xs text-gray-800">Qty: {item.quantity || 0}</p>
                      </div>
                      <span className="font-bold text-black">₹{((item.product.price || 0) * (item.quantity || 0)).toFixed(2)}</span>
                    </div>
                  )
                })}
              </div>

              <div className="space-y-3 mb-6 pt-3 border-t-2 border-black">
                <div className="flex justify-between text-gray-800">
                  <span>Subtotal</span>
                  <span className="font-bold">₹{subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-gray-800">
                  <span>Tax (10%)</span>
                  <span className="font-bold">₹{tax.toFixed(2)}</span>
                </div>
                <div className="flex justify-between pt-3 border-t-2 border-black">
                  <span className="text-xl font-black text-black">Total</span>
                  <span className="text-xl font-black text-black">₹{total.toFixed(2)}</span>
                </div>
              </div>

              <div className="bg-black text-white rounded-lg p-4 text-sm">
                <p className="font-bold mb-2">Secure Checkout 🔒</p>
                <p className="text-gray-300">Your info is super safe! ✅</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Checkout
