import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { getOrder } from '../services/orderService'

function OrderSuccess() {
  const { orderNumber } = useParams()
  const [order, setOrder] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        const data = await getOrder(orderNumber)
        setOrder(data)
      } catch (error) {
        console.error('Error fetching order:', error)
      } finally {
        setLoading(false)
      }
    }
    if (orderNumber) {
      fetchOrder()
    }
  }, [orderNumber])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-yellow-400"></div>
      </div>
    )
  }

  if (!order) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl sm:text-2xl font-bold text-black mb-4">Order not found 😕</h2>
          <Link to="/" className="btn-primary">Back Home 🏠</Link>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white min-h-screen py-20">
      <div className="container mx-auto px-4">
        <div className="max-w-2xl mx-auto text-center">
          <div className="bg-yellow-400 w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-6">
            <svg className="w-12 h-12 text-black" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-black text-black mb-4">Order Placed Successfully! 🎉</h1>
          <p className="text-xl text-gray-600 mb-8">
            Awesome! Thanks for shopping with us, {order.customerInfo.name}! 🎁
          </p>

          <div className="bg-gray-50 rounded-xl p-8 mb-8 text-left">
            <div className="mb-6">
              <h2 className="text-xl sm:text-2xl font-black text-black mb-4">Your Order Details 📋</h2>
              <div className="space-y-2 text-gray-700">
                <p><span className="font-bold">Order Number:</span> {order.orderNumber}</p>
                <p><span className="font-bold">Total Amount:</span> ₹{order.totalAmount.toFixed(2)}</p>
                <p><span className="font-bold">Status:</span> <span className="text-yellow-600 font-bold">{order.status}</span></p>
              </div>
            </div>

            <div className="mb-6">
              <h3 className="text-lg sm:text-xl font-bold text-black mb-3">What You Got! 🎁</h3>
              <div className="space-y-3">
                {order.items.map((item, index) => (
                  <div key={index} className="flex items-center gap-4 pb-3 border-b border-gray-300">
                    <img
                      src={item.product.images?.[0] || 'https://via.placeholder.com/80'}
                      alt={item.product.name}
                      className="w-16 h-16 object-cover rounded-lg"
                    />
                    <div className="flex-grow">
                      <p className="font-semibold text-black">{item.product.name}</p>
                      <p className="text-sm text-gray-600">Quantity: {item.quantity} × ₹{item.price.toFixed(2)}</p>
                    </div>
                    <span className="font-bold text-black">₹{(item.price * item.quantity).toFixed(2)}</span>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <h3 className="text-lg sm:text-xl font-bold text-black mb-3">Where It's Going! 📦</h3>
              <p className="text-gray-700">
                {order.customerInfo.address.street}<br />
                {order.customerInfo.address.city}, {order.customerInfo.address.state} {order.customerInfo.address.zipCode}<br />
                {order.customerInfo.address.country}
              </p>
            </div>
          </div>

          <div className="space-y-4">
            <Link to="/products" className="btn-primary text-lg px-8 py-4 inline-block">
              Shop More! 🛍️
            </Link>
            <div>
              <Link to="/" className="text-black hover:text-yellow-400 font-semibold">
                Back Home 🏠
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default OrderSuccess
