import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { getOrder } from '../services/orderService'
import Skeleton from '../components/Skeleton'

const STATUS_STEPS = [
  { key: 'pending', label: 'Order placed' },
  { key: 'processing', label: 'Processing' },
  { key: 'shipped', label: 'Shipped' },
  { key: 'delivered', label: 'Delivered' }
]

const CANCELLED_STATUS = 'cancelled'

function OrderStatus() {
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
    if (orderNumber) fetchOrder()
  }, [orderNumber])

  const isWithinReturnPeriod = (orderDate) => {
    const diffDays = Math.floor((new Date() - new Date(orderDate)) / (1000 * 60 * 60 * 24))
    return diffDays <= 7
  }

  const handleReturnRequest = () => {
    if (!order) return
    if (!isWithinReturnPeriod(order.createdAt)) {
      alert('Return period has expired. Returns are only available within 7 days of purchase.')
      return
    }
    const confirmed = window.confirm(
      `Request return for Order #${order.orderNumber}? Our team will contact you shortly.`
    )
    if (confirmed) {
      alert(`Return request submitted for Order #${order.orderNumber}. We'll be in touch within 24 hours.`)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-surface-subtle py-8 md:py-12">
        <div className="container mx-auto px-4 max-w-3xl">
          <Skeleton className="h-6 w-48 mb-2" />
          <Skeleton className="h-4 w-32 mb-8" />
          <Skeleton className="h-24 w-full rounded-xl mb-6" />
          <Skeleton className="h-64 w-full rounded-xl" />
        </div>
      </div>
    )
  }

  if (!order) {
    return (
      <div className="min-h-screen bg-surface-subtle flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-slate-900 mb-2">Order not found</h2>
          <Link to="/my-orders" className="text-primary-yellow font-medium hover:underline">Back to My Orders</Link>
        </div>
      </div>
    )
  }

  const statusIndex = STATUS_STEPS.findIndex((s) => s.key === order.status)
  const isCancelled = order.status === CANCELLED_STATUS

  return (
    <div className="min-h-screen bg-surface-subtle py-6 sm:py-8 md:py-12 px-4">
      <div className="container mx-auto max-w-3xl">
        <Link
          to="/my-orders"
          className="inline-flex items-center gap-1 text-sm text-slate-600 hover:text-slate-900 mb-6"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Back to My Orders
        </Link>

        <div className="mb-6">
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900">Order #{order.orderNumber}</h1>
          <p className="text-sm text-slate-500 mt-0.5">
            Placed on {new Date(order.createdAt).toLocaleDateString('en-IN', { dateStyle: 'long' })}
          </p>
        </div>

        {/* Status timeline - vertical stepper */}
        {!isCancelled && (
          <div className="bg-white rounded-xl border border-slate-200 p-6 mb-6">
            <h2 className="text-base font-semibold text-slate-900 mb-5">Order status</h2>
            <div className="flex gap-4">
              <div className="flex flex-col items-center pt-0.5">
                {STATUS_STEPS.map((step, index) => {
                  const isDone = statusIndex > index || order.status === step.key
                  const isCurrent = order.status === step.key
                  const isLast = index === STATUS_STEPS.length - 1
                  return (
                    <div key={step.key} className="flex flex-col items-center">
                      <div
                        className={`flex-shrink-0 w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                          isCurrent
                            ? 'bg-slate-900 border-slate-900'
                            : isDone
                              ? 'bg-emerald-500 border-emerald-500'
                              : 'bg-white border-slate-200'
                        }`}
                      >
                        {isDone && !isCurrent && (
                          <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                          </svg>
                        )}
                        {isCurrent && (
                          <span className="w-1.5 h-1.5 rounded-full bg-white" />
                        )}
                      </div>
                      {!isLast && (
                        <div className={`w-0.5 min-h-[32px] ${isDone ? 'bg-emerald-500' : 'bg-slate-200'}`} />
                      )}
                    </div>
                  )
                })}
              </div>
              <div className="flex flex-col pt-0.5">
                {STATUS_STEPS.map((step, index) => {
                  const isDone = statusIndex > index || order.status === step.key
                  const isCurrent = order.status === step.key
                  const isLast = index === STATUS_STEPS.length - 1
                  return (
                    <div key={step.key} className={isLast ? 'min-h-[20px]' : 'min-h-[52px]'}>
                      <p className={`text-sm font-medium ${isCurrent ? 'text-slate-900' : isDone ? 'text-slate-700' : 'text-slate-400'}`}>
                        {step.label}
                      </p>
                      {isCurrent && (
                        <p className="text-xs text-slate-500 mt-0.5">Current step</p>
                      )}
                    </div>
                  )
                })}
              </div>
            </div>
          </div>
        )}

        {isCancelled && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-6">
            <p className="text-sm font-medium text-red-800">This order was cancelled.</p>
          </div>
        )}

        {/* Items */}
        <div className="bg-white rounded-xl border border-slate-200 p-6 mb-6">
          <h2 className="text-sm font-semibold text-slate-900 mb-4">Items ({order.items?.length || 0})</h2>
          <div className="space-y-4">
            {order.items?.map((item, index) => (
              <div key={index} className="flex gap-4 py-3 border-b border-slate-100 last:border-0">
                <img
                  src={item.product?.images?.[0] || 'https://via.placeholder.com/80'}
                  alt={item.product?.name}
                  className="w-20 h-20 object-cover rounded-lg flex-shrink-0"
                  loading="lazy"
                  decoding="async"
                />
                <div className="flex-grow min-w-0">
                  <p className="font-medium text-slate-900">{item.product?.name}</p>
                  <p className="text-sm text-slate-500">Qty: {item.quantity} × ₹{item.price?.toFixed(2)}</p>
                </div>
                <span className="font-semibold text-slate-900">₹{((item.price || 0) * (item.quantity || 0)).toFixed(2)}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Shipping address */}
        {order.customerInfo?.address && (
          <div className="bg-white rounded-xl border border-slate-200 p-6 mb-6">
            <h2 className="text-sm font-semibold text-slate-900 mb-2">Shipping address</h2>
            <p className="text-sm text-slate-700">
              {order.customerInfo.name}<br />
              {order.customerInfo.address.street}<br />
              {order.customerInfo.address.city}, {order.customerInfo.address.state} {order.customerInfo.address.zipCode}<br />
              {order.customerInfo.address.country}
            </p>
          </div>
        )}

        {/* Payment summary + Return */}
        <div className="bg-white rounded-xl border border-slate-200 p-6">
          <div className="flex justify-between text-sm mb-2">
            <span className="text-slate-600">Payment</span>
            <span className="font-medium text-slate-900">
              {order.paymentMethod === 'cod' ? 'Cash on Delivery' : order.paymentMethod === 'razorpay' ? 'Razorpay' : order.paymentMethod}
            </span>
          </div>
          <div className="flex justify-between text-base font-semibold text-slate-900 pt-3 border-t border-slate-200">
            <span>Order total</span>
            <span>₹{order.totalAmount?.toFixed(2)}</span>
          </div>
          {!isCancelled && isWithinReturnPeriod(order.createdAt) && (
            <div className="mt-4 pt-4 border-t border-slate-200">
              <button
                type="button"
                onClick={handleReturnRequest}
                className="inline-flex items-center min-h-[40px] px-4 py-2 rounded-lg text-sm font-medium text-slate-700 bg-white border border-slate-300 hover:bg-slate-50 hover:border-slate-400 transition-colors"
              >
                Request return
              </button>
              <p className="text-xs text-slate-500 mt-1.5">Return window: 7 days from order date</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default OrderStatus
