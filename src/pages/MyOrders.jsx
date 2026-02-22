import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { getOrdersByEmail } from '../services/orderService'
import Skeleton from '../components/Skeleton'

function MyOrders() {
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [email, setEmail] = useState('')
  const [emailInput, setEmailInput] = useState('')
  const [showEmailForm, setShowEmailForm] = useState(true)

  useEffect(() => {
    // Check if email is stored in localStorage
    const storedEmail = localStorage.getItem('orderEmail')
    if (storedEmail) {
      setEmail(storedEmail)
      setShowEmailForm(false)
      fetchOrders(storedEmail)
    } else {
      setLoading(false)
    }
  }, [])

  const fetchOrders = async (userEmail) => {
    if (!userEmail) {
      setLoading(false)
      return
    }
    
    setLoading(true)
    setError(null)
    try {
      const normalizedEmail = userEmail.trim().toLowerCase()
      console.log('[MyOrders] Fetching orders for email:', normalizedEmail)
      const data = await getOrdersByEmail(normalizedEmail)
      console.log('[MyOrders] Orders received:', data?.length || 0, 'orders')
      setOrders(Array.isArray(data) ? data : [])
    } catch (err) {
      console.error('[MyOrders] Error fetching orders:', err)
      const errorMessage = err.response?.data?.message || err.message || 'Failed to load orders. Please try again.'
      setError(errorMessage)
      setOrders([])
    } finally {
      setLoading(false)
    }
  }

  const handleEmailSubmit = (e) => {
    e.preventDefault()
    if (emailInput.trim()) {
      const userEmail = emailInput.trim().toLowerCase()
      setEmail(userEmail)
      localStorage.setItem('orderEmail', userEmail)
      setShowEmailForm(false)
      fetchOrders(userEmail)
    }
  }

  const handleChangeEmail = () => {
    setShowEmailForm(true)
    setEmailInput('')
    setEmail('')
    localStorage.removeItem('orderEmail')
    setOrders([])
  }

  // Check if order is within 7 days of purchase
  const isWithinReturnPeriod = (orderDate) => {
    const orderDateObj = new Date(orderDate)
    const currentDate = new Date()
    const diffTime = currentDate - orderDateObj
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24))
    return diffDays <= 7
  }

  const handleReturnRequest = async (order) => {
    if (!isWithinReturnPeriod(order.createdAt)) {
      alert('Return period has expired. Returns are only available within 7 days of purchase.')
      return
    }

    const confirmed = window.confirm(
      `Are you sure you want to return Order #${order.orderNumber}?\n\n` +
      `This will initiate a return request. Our team will contact you shortly.`
    )

    if (confirmed) {
      try {
        // TODO: Add API call to backend for return request
        // For now, just show a success message
        alert(`Return request submitted for Order #${order.orderNumber}. Our team will contact you within 24 hours.`)
        // You can add an API call here later:
        // await api.post(`/orders/${order._id}/return`, { email: email })
      } catch (error) {
        console.error('Error submitting return request:', error)
        alert('Failed to submit return request. Please contact customer support.')
      }
    }
  }

  return (
    <div className="min-h-screen bg-white py-6 sm:py-8 md:py-12 px-4">
      <div className="container mx-auto max-w-4xl">
        {/* Header */}
        <div className="mb-6 sm:mb-8">
          <h1 className="text-2xl sm:text-3xl font-black text-black mb-2">
            My Orders
          </h1>
          <p className="text-sm sm:text-base text-gray-600">
            View your order history
          </p>
        </div>

        {loading && showEmailForm === false ? (
          <div className="space-y-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="bg-white rounded-xl border border-slate-200 p-6">
                <div className="flex justify-between items-start mb-4">
                  <Skeleton className="h-5 w-32" />
                  <Skeleton className="h-6 w-20 rounded-full" />
                </div>
                <Skeleton className="h-4 w-full mb-2" />
                <Skeleton className="h-4 w-2/3 mb-4" />
                <div className="flex gap-4">
                  <Skeleton className="w-16 h-16 rounded-lg" />
                  <Skeleton className="w-16 h-16 rounded-lg" />
                  <Skeleton className="w-16 h-16 rounded-lg" />
                </div>
              </div>
            ))}
          </div>
        ) : showEmailForm ? (
          <div className="bg-white rounded-lg border border-gray-200 p-6 sm:p-8">
            <h2 className="text-xl font-black text-black mb-4">Enter Your Email</h2>
            <p className="text-sm text-gray-600 mb-6">
              Enter the email address you used when placing your order to view your order history.
            </p>
            <form onSubmit={handleEmailSubmit} className="space-y-4">
              <div>
                <label className="block text-black font-bold mb-2 text-sm">Email Address *</label>
                <input
                  type="email"
                  value={emailInput}
                  onChange={(e) => setEmailInput(e.target.value)}
                  placeholder="your.email@example.com"
                  required
                  className="w-full px-4 py-3 rounded-lg border-2 border-gray-300 focus:border-yellow-400 focus:outline-none focus:ring-2 focus:ring-yellow-400 transition-all duration-200"
                />
              </div>
              <button
                type="submit"
                className="w-full sm:w-auto bg-yellow-400 text-black px-6 py-3 rounded-lg font-semibold text-sm border border-black hover:bg-yellow-500 transition-all"
              >
                View Orders
              </button>
            </form>
          </div>
        ) : (
          <>
            {/* Email Display and Change Button */}
            <div className="mb-4 flex items-center justify-between bg-gray-50 rounded-lg p-4">
              <div>
                <p className="text-xs text-gray-600 mb-1">Viewing orders for</p>
                <p className="text-sm font-semibold text-black">{email}</p>
              </div>
              <button
                onClick={handleChangeEmail}
                className="text-sm text-yellow-600 hover:text-yellow-700 font-semibold underline"
              >
                Change Email
              </button>
            </div>

            {/* Error Message */}
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
                <p className="text-sm text-red-700">{error}</p>
              </div>
            )}

            {!loading && orders.length === 0 ? (
          <div className="bg-white rounded-lg border border-gray-200 p-8 sm:p-12 text-center">
            <div className="max-w-md mx-auto">
              <div className="bg-yellow-100 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-10 h-10 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
              </div>
              <h2 className="text-xl font-black text-black mb-2">No Orders Yet</h2>
              <p className="text-sm text-gray-600 mb-6">Start shopping to see your orders here</p>
              <Link
                to="/products"
                className="inline-block bg-yellow-400 text-black px-4 py-2 rounded-lg font-semibold text-sm border border-black hover:bg-yellow-500 transition-all"
              >
                Browse Products
              </Link>
            </div>
          </div>
            ) : (
              <div className="space-y-4">
                {orders.map((order) => (
                  <div key={order._id} className="bg-white rounded-lg border border-gray-200 p-4 sm:p-6 hover:shadow-md transition-shadow">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                      <div className="flex-grow">
                        <div className="flex items-center gap-3 mb-2 flex-wrap">
                          <h3 className="font-semibold text-black text-base">Order #{order.orderNumber}</h3>
                          <span className={`px-2 py-1 rounded text-xs font-semibold capitalize ${
                            order.status === 'delivered' ? 'bg-green-100 text-green-700' :
                            order.status === 'processing' ? 'bg-yellow-100 text-yellow-700' :
                            order.status === 'shipped' ? 'bg-blue-100 text-blue-700' :
                            order.status === 'cancelled' ? 'bg-red-100 text-red-700' :
                            'bg-gray-100 text-gray-700'
                          }`}>
                            {order.status}
                          </span>
                        </div>
                        <p className="text-sm text-gray-600 mb-1">
                          Placed on {new Date(order.createdAt).toLocaleDateString('en-US', { 
                            year: 'numeric', 
                            month: 'long', 
                            day: 'numeric' 
                          })}
                        </p>
                        <div className="flex items-center gap-4 mt-2">
                          <p className="text-base font-bold text-black">₹{order.totalAmount.toFixed(2)}</p>
                          <span className="text-xs text-gray-500 capitalize">
                            Payment: {order.paymentMethod === 'cod' ? 'Cash on Delivery' : 
                                     order.paymentMethod === 'razorpay' ? 'Razorpay' :
                                     order.paymentMethod === 'bank' ? 'Bank Transfer' : 'Card'}
                          </span>
                        </div>
                        <p className="text-xs text-gray-500 mt-2">
                          {order.items.length} item{order.items.length !== 1 ? 's' : ''}
                        </p>
                        {isWithinReturnPeriod(order.createdAt) && order.status !== 'cancelled' && (
                          <div className="mt-3">
                            <button
                              onClick={() => handleReturnRequest(order)}
                              className="inline-flex items-center gap-2 bg-red-50 text-red-700 px-3 py-1.5 rounded-lg font-semibold text-xs border border-red-200 hover:bg-red-100 transition-all"
                            >
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 15v-1a4 4 0 00-4-4H8m0 0l3 3m-3-3l3-3m5 13h-3a2 2 0 01-2-2v-4a2 2 0 012-2h3" />
                              </svg>
                              Return Order
                            </button>
                            <p className="text-xs text-gray-500 mt-1">
                              Return available for {7 - Math.floor((new Date() - new Date(order.createdAt)) / (1000 * 60 * 60 * 24))} more day(s)
                            </p>
                          </div>
                        )}
                      </div>
                      <div className="flex flex-col gap-2">
                        <Link
                          to={`/order-success/${order.orderNumber}`}
                          className="inline-block bg-black text-yellow-400 px-4 py-2 rounded-lg font-semibold text-sm border border-black hover:bg-gray-900 transition-all whitespace-nowrap text-center"
                        >
                          View Details
                        </Link>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}

export default MyOrders
