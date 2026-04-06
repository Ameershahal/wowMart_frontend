import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { getCart } from '../services/cartService'
import { createOrder } from '../services/orderService'
import { createRazorpayOrder, verifyRazorpayPayment } from '../services/razorpayService'
import { saveAddressService, getAddressService } from '../services/userService'
import { useButtonColor } from '../hooks/useButtonColor'
import api from '../services/api'
import { computeWeightShippingRupeesForZone, shippingZoneLabel } from '../utils/shipping'
import Skeleton from '../components/Skeleton'

const INDIAN_STATES = [
  'Andhra Pradesh', 'Arunachal Pradesh', 'Assam', 'Bihar', 'Chhattisgarh',
  'Goa', 'Gujarat', 'Haryana', 'Himachal Pradesh', 'Jharkhand', 'Karnataka',
  'Kerala', 'Madhya Pradesh', 'Maharashtra', 'Manipur', 'Meghalaya', 'Mizoram',
  'Nagaland', 'Odisha', 'Punjab', 'Rajasthan', 'Sikkim', 'Tamil Nadu',
  'Telangana', 'Tripura', 'Uttar Pradesh', 'Uttarakhand', 'West Bengal',
  'Andaman and Nicobar Islands', 'Chandigarh', 'Dadra and Nagar Haveli and Daman and Diu',
  'Delhi', 'Jammu and Kashmir', 'Ladakh', 'Lakshadweep', 'Puducherry'
]

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
    country: 'India'
  })
  const [paymentMethod, setPaymentMethod] = useState('razorpay')
  const [addressLoaded, setAddressLoaded] = useState(false)
  const [showAddressForm, setShowAddressForm] = useState(false)
  const [cardDetails, setCardDetails] = useState({
    cardNumber: '',
    expiryDate: '',
    cvv: '',
    cardholderName: ''
  })
  const [couponInfo, setCouponInfo] = useState(null) // { code, discountAmount }
  const [couponError, setCouponError] = useState('')
  const [codGloballyEnabled, setCodGloballyEnabled] = useState(true)
  const [weightShipConfig, setWeightShipConfig] = useState({
    enabled: false,
    keralaPerKg: 0,
    restOfIndiaPerKg: 0,
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

  // Helper: address has all required fields
  const hasCompleteSavedAddress = (data) => {
    return !!(
      data?.name?.trim() &&
      data?.email?.trim() &&
      data?.phone?.trim() &&
      data?.street?.trim() &&
      data?.city?.trim() &&
      data?.state?.trim() &&
      data?.zipCode?.trim()
    )
  }

  useEffect(() => {
    const loadCodSetting = async () => {
      try {
        const res = await api.get('/settings/cod-enabled')
        if (typeof res.data?.codEnabled === 'boolean') {
          setCodGloballyEnabled(res.data.codEnabled)
        }
      } catch {
        setCodGloballyEnabled(true)
      }
    }
    loadCodSetting()
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

  // Load saved address and logged-in user info on component mount
  useEffect(() => {
    const loadSavedAddress = async () => {
      try {
        // If logged in, pre-fill name, email, phone from account so we don't ask again
        const userJson = localStorage.getItem('user')
        if (userJson) {
          try {
            const user = JSON.parse(userJson)
            setFormData(prev => ({
              ...prev,
              name: user.name || user.fullName || prev.name,
              email: (user.email || prev.email).trim().toLowerCase(),
              phone: user.phone || prev.phone
            }))
          } catch {
            // ignore parse error
          }
        }

        // Then apply saved shipping address (localStorage or API)
        const savedAddressLocal = localStorage.getItem('savedShippingAddress')
        if (savedAddressLocal) {
          const address = JSON.parse(savedAddressLocal)
          setFormData(prev => ({ ...prev, ...address }))
        }

        const token = localStorage.getItem('token')
        if (token) {
          try {
            const response = await getAddressService()
            if (response.data && response.data.savedAddress) {
              const address = response.data.savedAddress
              setFormData(prev => ({
                ...prev,
                name: address.name || prev.name,
                email: (response.data.user?.email || prev.email || '').trim().toLowerCase(),
                phone: address.phone || prev.phone,
                street: address.street || prev.street,
                city: address.city || prev.city,
                state: address.state || prev.state,
                zipCode: address.zipCode || prev.zipCode,
                country: address.country || prev.country
              }))
            }
          } catch {
            // If API call fails, keep existing data
          }
        }
      } catch (error) {
        console.error('Error loading saved address:', error)
      } finally {
        setAddressLoaded(true)
      }
    }

    loadSavedAddress()
  }, [])

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

  // Re-validate any coupon applied on the product page using current cart subtotal
  useEffect(() => {
    if (!cart || !cart.items || cart.items.length === 0) {
      setCouponInfo(null)
      setCouponError('')
      return
    }
    let cancelled = false
    const stored = (() => {
      try {
        return localStorage.getItem('appliedCoupon')
      } catch {
        return null
      }
    })()
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

  useEffect(() => {
    if (!cart?.items?.length) return
    const cartAllowsCod = cart.items.every((item) => item?.product?.codAvailable === true)
    const showCod = codGloballyEnabled && cartAllowsCod
    if (!showCod && paymentMethod === 'cod') {
      setPaymentMethod('razorpay')
    }
  }, [cart, codGloballyEnabled, paymentMethod])

  // Helper function to convert hex to RGB
  const hexToRgb = (hex) => {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex)
    return result ? {
      r: parseInt(result[1], 16),
      g: parseInt(result[2], 16),
      b: parseInt(result[3], 16)
    } : null
  }

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
  }

  const getSessionId = () => {
    return localStorage.getItem('sessionId')
  }

  const handleRazorpayPayment = async (customerInfo) => {
    try {
      // Always save address for next time (localStorage + API if logged in)
      const addressToSave = {
        name: formData.name,
        email: formData.email.trim().toLowerCase(),
        phone: formData.phone,
        street: formData.street,
        city: formData.city,
        state: formData.state,
        zipCode: formData.zipCode,
        country: formData.country
      }
      localStorage.setItem('savedShippingAddress', JSON.stringify(addressToSave))
      const token = localStorage.getItem('token')
      if (token) {
        try {
          await saveAddressService({
            name: formData.name,
            phone: formData.phone,
            street: formData.street,
            city: formData.city,
            state: formData.state,
            zipCode: formData.zipCode,
            country: formData.country
          })
        } catch {
          // localStorage already saved
        }
      }

      const sessionId = getSessionId()
      
      // Create Razorpay order
      const razorpayOrderData = await createRazorpayOrder(sessionId, customerInfo, couponInfo?.code)
      
      // Initialize Razorpay checkout
      const options = {
        key: razorpayOrderData.key,
        amount: razorpayOrderData.amount,
        currency: razorpayOrderData.currency,
        name: 'wowmart',
        description: 'Order Payment',
        order_id: razorpayOrderData.orderId,
        handler: async function (response) {
          try {
            // Verify payment on backend
            const order = await verifyRazorpayPayment({
              razorpayOrderId: response.razorpay_order_id,
              razorpayPaymentId: response.razorpay_payment_id,
              razorpaySignature: response.razorpay_signature,
              sessionId,
              customerInfo,
              ...(couponInfo?.code ? { couponCode: couponInfo.code } : {}),
            })
            
            // Store email in localStorage for My Orders page
            localStorage.setItem('orderEmail', formData.email.trim().toLowerCase())
            navigate(`/order-success/${order.orderNumber}`)
          } catch (error) {
            console.error('Payment verification error:', error)
            alert('Payment verification failed. Please contact support with your payment ID.')
            setSubmitting(false)
          }
        },
        prefill: {
          name: customerInfo.name,
          email: customerInfo.email,
          contact: customerInfo.phone
        },
        theme: {
          color: '#FACC15' // Yellow color matching your brand
        },
        modal: {
          ondismiss: function() {
            setSubmitting(false)
          }
        }
      }

      const razorpay = new window.Razorpay(options)
      razorpay.open()
    } catch (error) {
      console.error('Razorpay error:', error)
      alert(error.response?.data?.message || 'Failed to initialize payment. Please try again.')
      setSubmitting(false)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSubmitting(true)

    try {
      const customerInfo = {
        name: formData.name,
        email: formData.email.trim().toLowerCase(),
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

      // Always save address for next time
      const addressToSave = {
        name: formData.name,
        email: formData.email.trim().toLowerCase(),
        phone: formData.phone,
        street: formData.street,
        city: formData.city,
        state: formData.state,
        zipCode: formData.zipCode,
        country: formData.country
      }
      localStorage.setItem('savedShippingAddress', JSON.stringify(addressToSave))
      const token = localStorage.getItem('token')
      if (token) {
        try {
          await saveAddressService({
            name: formData.name,
            phone: formData.phone,
            street: formData.street,
            city: formData.city,
            state: formData.state,
            zipCode: formData.zipCode,
            country: formData.country
          })
        } catch {
          // localStorage already saved
        }
      }

      // Handle Razorpay payment
      if (paymentMethod === 'razorpay') {
        await handleRazorpayPayment(customerInfo)
        return // Don't set submitting to false here, it will be handled in the Razorpay handler
      }

      // Handle other payment methods (card, cod, bank)
      const order = await createOrder(customerInfo, couponInfo?.code)
      // Store email in localStorage for My Orders page
      localStorage.setItem('orderEmail', formData.email.trim().toLowerCase())
      navigate(`/order-success/${order.orderNumber}`)
    } catch (error) {
      console.error('Error creating order:', error)
      alert(error.response?.data?.message || 'Failed to place order. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen py-8 md:py-12 bg-surface-subtle">
        <div className="container mx-auto px-4 sm:px-6 max-w-6xl">
          <Skeleton className="h-9 w-40 mb-8" />
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-6">
              <div className="bg-white rounded-2xl border border-slate-200 p-6 space-y-4">
                <Skeleton className="h-5 w-24" />
                <Skeleton className="h-12 w-full rounded-lg" />
                <div className="grid grid-cols-2 gap-4">
                  <Skeleton className="h-12 rounded-lg" />
                  <Skeleton className="h-12 rounded-lg" />
                </div>
              </div>
              <div className="bg-white rounded-2xl border border-slate-200 p-6 space-y-4">
                <Skeleton className="h-5 w-32" />
                <Skeleton className="h-12 w-full rounded-lg" />
                <div className="grid grid-cols-3 gap-4">
                  <Skeleton className="h-12 rounded-lg" />
                  <Skeleton className="h-12 rounded-lg" />
                  <Skeleton className="h-12 rounded-lg" />
                </div>
              </div>
            </div>
            <div className="bg-white rounded-2xl border border-slate-200 p-6">
              <Skeleton className="h-5 w-28 mb-4" />
              <div className="space-y-3">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="flex gap-3">
                    <Skeleton className="w-14 h-14 rounded-lg flex-shrink-0" />
                    <Skeleton className="h-4 flex-1" />
                  </div>
                ))}
              </div>
              <Skeleton className="h-10 w-full rounded-lg mt-6" />
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (!cart || !cart.items || cart.items.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-surface-subtle">
        <div className="text-center">
          <p className="font-display font-semibold text-slate-900 mb-4">Your cart is empty</p>
          <button onClick={() => navigate('/')} className="btn-primary">
            Continue shopping
          </button>
        </div>
      </div>
    )
  }

  const cartAllowsCod = cart.items.every((item) => item?.product?.codAvailable === true)
  const showCodOption = codGloballyEnabled && cartAllowsCod

  const subtotal = cart.items.reduce((sum, item) => {
    if (!item || !item.product || !item.product.price) return sum
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
  // 18% tax included in prices
  const taxIncluded = subtotal * (0.18 / 1.18)
  const zoneRates = {
    keralaPerKg: weightShipConfig.keralaPerKg,
    restOfIndiaPerKg: weightShipConfig.restOfIndiaPerKg,
  }
  const shippingCost = cart?.items?.length
    ? computeWeightShippingRupeesForZone(
        cart.items,
        weightShipConfig.enabled,
        zoneRates,
        formData.state
      )
    : 0
  const total = Math.max(0, subtotal - couponDiscount + shippingCost)

  const inputClass = "w-full px-4 py-3 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-primary-yellow/30 focus:border-primary-yellow bg-white"

  return (
    <div className="min-h-screen bg-surface-subtle py-8 md:py-12">
      <div className="container mx-auto px-4 sm:px-6 max-w-6xl">
        <h1 className="font-display text-display-md font-semibold text-slate-900 mb-8">Checkout</h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 lg:gap-10">
          <div className="lg:col-span-2">
            <form onSubmit={handleSubmit} className="space-y-6">
              {addressLoaded && !showAddressForm && hasCompleteSavedAddress(formData) ? (
                <div className="bg-white rounded-2xl border border-slate-200 p-6 md:p-8">
                  <h2 className="font-display font-semibold text-slate-900 text-lg mb-4">Shipping to</h2>
                  <div className="text-slate-700 space-y-1">
                    <p className="font-medium text-slate-900">{formData.name}</p>
                    <p className="text-sm">{formData.email}</p>
                    <p className="text-sm">{formData.phone}</p>
                    <p className="text-sm pt-2">
                      {formData.street}, {formData.city}, {formData.state} {formData.zipCode}, {formData.country}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setShowAddressForm(true)}
                    className="mt-4 text-sm font-medium text-primary-yellow hover:underline"
                  >
                    Change address
                  </button>
                </div>
              ) : (
                <>
                  <div className="bg-white rounded-2xl border border-slate-200 p-6 md:p-8">
                    <h2 className="font-display font-semibold text-slate-900 text-lg mb-5">Contact</h2>
                    <div className="space-y-4">
                      <div>
                        <label className="block text-slate-700 font-medium mb-1.5 text-sm">Full name *</label>
                        <input type="text" name="name" value={formData.name} onChange={handleInputChange} required className={inputClass} />
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-slate-700 font-medium mb-1.5 text-sm">Email *</label>
                          <input type="email" name="email" value={formData.email} onChange={handleInputChange} required className={inputClass} />
                        </div>
                        <div>
                          <label className="block text-slate-700 font-medium mb-1.5 text-sm">Phone *</label>
                          <input type="tel" name="phone" value={formData.phone} onChange={handleInputChange} required className={inputClass} />
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="bg-white rounded-2xl border border-slate-200 p-6 md:p-8">
                    <h2 className="font-display font-semibold text-slate-900 text-lg mb-5">Shipping address</h2>
                    <div className="space-y-4">
                      <div>
                        <label className="block text-slate-700 font-medium mb-1.5 text-sm">Street address *</label>
                        <input type="text" name="street" value={formData.street} onChange={handleInputChange} required className={inputClass} />
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                          <label className="block text-slate-700 font-medium mb-1.5 text-sm">City *</label>
                          <input type="text" name="city" value={formData.city} onChange={handleInputChange} required className={inputClass} />
                        </div>
                        <div>
                          <label className="block text-slate-700 font-medium mb-1.5 text-sm">State *</label>
                          <select name="state" value={formData.state} onChange={handleInputChange} required className={inputClass}>
                            <option value="">Select state</option>
                            {INDIAN_STATES.map((state) => (
                              <option key={state} value={state}>{state}</option>
                            ))}
                          </select>
                        </div>
                        <div>
                          <label className="block text-slate-700 font-medium mb-1.5 text-sm">Zip code *</label>
                          <input type="text" name="zipCode" value={formData.zipCode} onChange={handleInputChange} required className={inputClass} />
                        </div>
                      </div>
                      <div>
                        <label className="block text-slate-700 font-medium mb-1.5 text-sm">Country *</label>
                        <input type="text" name="country" value={formData.country} onChange={handleInputChange} required className={inputClass} />
                      </div>
                      <p className="text-sm text-slate-500 pt-1">Address is saved automatically for your next order.</p>
                    </div>
                  </div>
                </>
              )}

              <div className="bg-white rounded-2xl border border-slate-200 p-6 md:p-8">
                <h2 className="font-display font-semibold text-slate-900 text-lg mb-5">Payment</h2>
                {!showCodOption && (
                  <p className="text-sm text-slate-600 mb-4 p-3 bg-slate-50 rounded-lg border border-slate-200">
                    {!codGloballyEnabled
                      ? 'Cash on Delivery is turned off for the store. Pay with Razorpay below.'
                      : 'Cash on Delivery is not available because one or more items in your cart do not allow COD. Use Razorpay or remove those items.'}
                  </p>
                )}
                <div className={`grid grid-cols-1 gap-4 ${showCodOption ? 'sm:grid-cols-2' : ''}`}>
                  <button
                    type="button"
                    onClick={() => setPaymentMethod('razorpay')}
                    className={`p-5 rounded-xl border text-left transition-all duration-200 ${
                      paymentMethod === 'razorpay' ? 'border-primary-yellow bg-amber-50/50 ring-2 ring-primary-yellow/30' : 'border-slate-200 bg-white hover:border-slate-300'
                    }`}
                  >
                    <div className="flex items-center gap-3 mb-2">
                      <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${paymentMethod === 'razorpay' ? 'border-primary-yellow bg-primary-yellow' : 'border-slate-300'}`}>
                        {paymentMethod === 'razorpay' && <svg className="w-3 h-3 text-slate-900" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" /></svg>}
                      </div>
                      <svg className="w-8 h-8 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" /></svg>
                    </div>
                    <p className="font-medium text-slate-900 text-sm">Razorpay</p>
                    <p className="text-xs text-slate-500 mt-0.5">Card, UPI, netbanking</p>
                  </button>
                  {showCodOption && (
                  <button
                    type="button"
                    onClick={() => setPaymentMethod('cod')}
                    className={`p-5 rounded-xl border text-left transition-all duration-200 ${
                      paymentMethod === 'cod' ? 'border-primary-yellow bg-amber-50/50 ring-2 ring-primary-yellow/30' : 'border-slate-200 bg-white hover:border-slate-300'
                    }`}
                  >
                    <div className="flex items-center gap-3 mb-2">
                      <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${paymentMethod === 'cod' ? 'border-primary-yellow bg-primary-yellow' : 'border-slate-300'}`}>
                        {paymentMethod === 'cod' && <svg className="w-3 h-3 text-slate-900" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" /></svg>}
                      </div>
                      <svg className="w-8 h-8 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" /></svg>
                    </div>
                    <p className="font-medium text-slate-900 text-sm">Cash on delivery</p>
                    <p className="text-xs text-slate-500 mt-0.5">Pay when you receive</p>
                  </button>
                  )}
                </div>

                {paymentMethod === 'razorpay' && (
                  <div className="mt-6 p-4 bg-slate-50 rounded-xl border border-slate-200">
                    <p className="text-sm text-slate-700">
                      <strong>Secure payment</strong> via Razorpay. You’ll complete payment in the next step. Supports UPI, cards, wallets, and net banking.
                    </p>
                  </div>
                )}

                {paymentMethod === 'cod' && (
                  <div className="mt-6 p-4 bg-slate-50 rounded-xl border border-slate-200">
                    <p className="text-sm text-slate-700">Pay with cash when your order is delivered.</p>
                  </div>
                )}

              </div>

              <button
                type="submit"
                disabled={submitting}
                className="w-full py-4 rounded-xl font-semibold text-base text-white flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all active:scale-[0.98]"
                style={{ backgroundColor: buttonColor }}
                onMouseEnter={(e) => { if (!submitting) { const rgb = hexToRgb(buttonColor); if (rgb) e.target.style.backgroundColor = `rgb(${Math.max(0, rgb.r - 15)}, ${Math.max(0, rgb.g - 15)}, ${Math.max(0, rgb.b - 15)})` } }}
                onMouseLeave={(e) => { e.target.style.backgroundColor = buttonColor }}
              >
                {submitting ? <><span className="animate-spin w-5 h-5 border-2 border-white/30 border-t-white rounded-full" /><span>Placing order…</span></> : <span>Place order</span>}
              </button>
            </form>
          </div>

          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl border border-slate-200 p-6 sticky top-24">
              <h2 className="font-display font-semibold text-slate-900 text-lg mb-5">Order summary</h2>
              <div className="space-y-3 mb-5">
                {cart.items.map((item) => {
                  if (!item || !item.product) return null
                  return (
                    <div key={item._id || Math.random()} className="flex items-center gap-3 pb-3 border-b border-slate-200">
                      <img src={item.product.images?.[0] || 'https://via.placeholder.com/64'} alt={item.product.name || 'Product'} className="w-14 h-14 object-cover rounded-lg" loading="lazy" decoding="async" onError={(e) => { e.target.src = 'https://via.placeholder.com/64' }} />
                      <div className="flex-grow min-w-0">
                        <p className="font-medium text-sm text-slate-900 line-clamp-1">{item.product.name || 'Product'}</p>
                        <p className="text-xs text-slate-500">Qty: {item.quantity || 0}</p>
                      </div>
                      <span className="font-medium text-slate-900 text-sm">₹{((item.product.price || 0) * (item.quantity || 0)).toFixed(2)}</span>
                    </div>
                  )
                })}
              </div>
              <div className="space-y-2 pt-3 border-t border-slate-200">
                <div className="flex justify-between text-slate-600 text-sm">
                  <span>Subtotal</span>
                  <span>₹{subtotal.toFixed(2)}</span>
                </div>
                {totalSavings > 0 && (
                  <div className="flex justify-between text-green-700 text-sm">
                    <span className="font-medium">You save on offers</span>
                    <span className="font-semibold">₹{totalSavings.toFixed(2)}</span>
                  </div>
                )}
                {couponDiscount > 0 && (
                  <div className="flex justify-between text-green-700 text-sm">
                    <span className="font-medium">Coupon discount</span>
                    <span className="font-semibold">₹{couponDiscount.toFixed(2)}</span>
                  </div>
                )}
                {weightShipConfig.enabled &&
                  (weightShipConfig.keralaPerKg > 0 || weightShipConfig.restOfIndiaPerKg > 0) && (
                  <div className="flex justify-between text-slate-600 text-sm gap-3">
                    <span>
                      <span className="block font-medium">
                        Shipping ({shippingZoneLabel(formData.state)})
                      </span>
                      <span className="block text-[11px] font-normal text-slate-400 mt-0.5">
                        By weight · free-shipping items excluded
                      </span>
                    </span>
                    <span className="font-semibold tabular-nums flex-shrink-0">₹{shippingCost.toFixed(2)}</span>
                  </div>
                )}
                <div className="flex justify-between text-slate-600 text-sm gap-3">
                  <span>
                    <span className="block">GST (18%)</span>
                    <span className="block text-[11px] font-normal text-slate-400 mt-0.5">Included in subtotal — not added again</span>
                  </span>
                  <span className="tabular-nums flex-shrink-0">₹{taxIncluded.toFixed(2)}</span>
                </div>
                <div className="flex justify-between pt-3 border-t border-slate-200">
                  <span className="font-display font-semibold text-slate-900">Total</span>
                  <span className="font-display font-semibold text-slate-900">₹{total.toFixed(2)}</span>
                </div>
              </div>
              <p className="mt-4 text-xs text-slate-500">Secure checkout. Your payment info is encrypted.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Checkout
