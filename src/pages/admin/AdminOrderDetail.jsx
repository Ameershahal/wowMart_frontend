import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import api from '../../services/api'
import { resolveMediaUrl } from '../../utils/apiOrigin.js'

function AdminOrderDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [order, setOrder] = useState(null)
  const [loading, setLoading] = useState(true)
  const [updating, setUpdating] = useState(false)
  const [newStatus, setNewStatus] = useState('')
  const [returnStatus, setReturnStatus] = useState('requested')
  const [returnAdminNote, setReturnAdminNote] = useState('')

  useEffect(() => {
    fetchOrder()
  }, [id])

  const fetchOrder = async () => {
    if (!id) {
      console.error('[AdminOrderDetail] No order ID provided')
      setLoading(false)
      return
    }
    
    try {
      console.log('[AdminOrderDetail] Fetching order with ID:', id)
      const response = await api.get(`/admin/orders/${id}`)
      console.log('[AdminOrderDetail] Order fetched:', response.data)
      setOrder(response.data)
      setNewStatus(response.data.status)
      setReturnStatus(response.data.returnRequest?.status || 'requested')
      setReturnAdminNote(response.data.returnRequest?.adminNote || '')
    } catch (error) {
      console.error('[AdminOrderDetail] Error fetching order:', error)
      console.error('[AdminOrderDetail] Error details:', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status
      })
    } finally {
      setLoading(false)
    }
  }

  const handleStatusUpdate = async () => {
    if (!id) {
      alert('Order ID is missing')
      return
    }
    
    if (!newStatus) {
      alert('Please select a status')
      return
    }
    
    if (newStatus === order?.status) {
      alert('Order is already in this status')
      return
    }
    
    setUpdating(true)
    try {
      console.log('[AdminOrderDetail] Updating order status:', { id, newStatus, currentStatus: order?.status })
      const response = await api.put(`/admin/orders/${id}/status`, { status: newStatus })
      console.log('[AdminOrderDetail] Status update response:', response.data)
      await fetchOrder()
      alert('Order status updated successfully!')
    } catch (error) {
      console.error('[AdminOrderDetail] Error updating status:', error)
      const errorMessage = error.response?.data?.message || error.message || 'Failed to update order status'
      alert(`Error: ${errorMessage}`)
    } finally {
      setUpdating(false)
    }
  }

  const handleReturnStatusUpdate = async () => {
    if (!id) return
    setUpdating(true)
    try {
      await api.put(`/admin/orders/${id}/return-status`, {
        status: returnStatus,
        adminNote: returnAdminNote,
      })
      await fetchOrder()
      alert('Return status updated successfully!')
    } catch (error) {
      const errorMessage = error.response?.data?.message || error.message || 'Failed to update return status'
      alert(`Error: ${errorMessage}`)
    } finally {
      setUpdating(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-4 border-yellow-400"></div>
      </div>
    )
  }

  if (!order) {
    return (
      <div className="text-center py-12">
        <p className="text-sm text-gray-600">Order not found</p>
      </div>
    )
  }

  // Status progression steps with icons
  const statusSteps = [
    { 
      key: 'pending', 
      label: 'Pending', 
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      )
    },
    { 
      key: 'processing', 
      label: 'Processing', 
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
        </svg>
      )
    },
    { 
      key: 'shipped', 
      label: 'Shipped', 
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
        </svg>
      )
    },
    { 
      key: 'delivered', 
      label: 'Delivered', 
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
        </svg>
      )
    },
  ]
  
  const getStatusIndex = (status) => {
    return statusSteps.findIndex(step => step.key === status)
  }

  const currentStatusIndex = getStatusIndex(order.status)
  const isCancelled = order.status === 'cancelled'

  return (
    <div className="p-6">
      <div className="mb-6">
        <button
          onClick={() => navigate('/admin/orders')}
          className="inline-flex items-center space-x-2 text-sm text-gray-600 hover:text-black mb-4 transition-colors"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          <span>Back to Orders</span>
        </button>
        <h1 className="text-2xl font-semibold text-black">Order Details</h1>
        <p className="text-xs text-gray-500 mt-1">Order #{order.orderNumber}</p>
      </div>

      {/* Status Progress Bar */}
      <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-6 mb-6">
        <h2 className="text-base font-semibold text-black mb-5">Order Status</h2>
        {isCancelled ? (
          <div className="flex items-center space-x-3 p-4 bg-red-50 rounded-lg border border-red-200">
            <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center">
              <svg className="w-5 h-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </div>
            <div>
              <p className="text-sm font-semibold text-red-800">Order Cancelled</p>
              <p className="text-xs text-red-600">This order has been cancelled</p>
            </div>
          </div>
        ) : (
          <div className="relative py-2">
            {/* Progress Line Background */}
            <div className="absolute top-6 left-0 right-0 h-1 bg-gray-200 rounded-full">
              {/* Progress Line Fill - animated yellow line connecting completed steps */}
              <div 
                className="h-full bg-gradient-to-r from-yellow-400 to-yellow-500 rounded-full transition-all duration-700 ease-out shadow-sm"
                style={{ 
                  width: `${((currentStatusIndex + 0.5) / statusSteps.length) * 100}%`
                }}
              />
            </div>

            {/* Status Steps */}
            <div className="relative flex justify-between">
              {statusSteps.map((step, index) => {
                const isCompleted = index < currentStatusIndex
                const isCurrent = index === currentStatusIndex
                const isUpcoming = index > currentStatusIndex
                
                return (
                  <div key={step.key} className="flex flex-col items-center flex-1 relative z-10">
                    {/* Step Circle */}
                    <div className={`relative w-12 h-12 rounded-full flex items-center justify-center transition-all duration-300 ${
                      isCompleted
                        ? 'bg-yellow-400 shadow-lg scale-110 border-3 border-white'
                        : isCurrent
                        ? 'bg-yellow-400 shadow-lg scale-110 border-3 border-white ring-4 ring-yellow-200'
                        : 'bg-white border-2 border-gray-300 shadow-sm'
                    }`}>
                      {isCompleted ? (
                        <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={3}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                        </svg>
                      ) : isCurrent ? (
                        <div className="text-white">
                          {step.icon}
                        </div>
                      ) : (
                        <div className="text-gray-400">
                          {step.icon}
                        </div>
                      )}
                    </div>
                    
                    {/* Step Label */}
                    <div className="mt-4 text-center">
                      <p className={`text-xs font-semibold ${
                        isCompleted || isCurrent ? 'text-black' : 'text-gray-400'
                      }`}>
                        {step.label}
                      </p>
                      {isCurrent && (
                        <p className="text-xs text-yellow-600 font-medium mt-1">Current</p>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Order Info */}
        <div className="lg:col-span-2 space-y-6">
          {/* Customer Info */}
          <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-5">
            <h2 className="text-base font-semibold text-black mb-4">Customer Information</h2>
            <div className="space-y-3 text-sm">
              <div>
                <span className="font-medium text-gray-600">Name:</span>
                <span className="ml-2 text-black">{order.customerInfo?.name || 'N/A'}</span>
              </div>
              <div>
                <span className="font-medium text-gray-600">Email:</span>
                <span className="ml-2 text-black">{order.customerInfo?.email || 'N/A'}</span>
              </div>
              {order.customerInfo?.phone && (
                <div>
                  <span className="font-medium text-gray-600">Phone:</span>
                  <span className="ml-2 text-black">{order.customerInfo.phone}</span>
                </div>
              )}
              {order.customerInfo?.address && (
                <div>
                  <p className="font-medium text-gray-600 mb-1">Address:</p>
                  <p className="text-black">
                    {order.customerInfo.address.street}<br />
                    {order.customerInfo.address.city}, {order.customerInfo.address.state} {order.customerInfo.address.zipCode}<br />
                    {order.customerInfo.address.country}
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Order Items */}
          <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-5">
            <h2 className="text-base font-semibold text-black mb-4">Order Items</h2>
            <div className="space-y-4">
              {order.items?.map((item, index) => (
                <div key={index} className="flex items-center space-x-4 pb-4 border-b border-gray-100 last:border-0">
                  {item.product?.images && item.product.images[0] && (
                    <img
                      src={resolveMediaUrl(item.product.images[0])}
                      alt={item.product.name}
                      className="w-16 h-16 object-cover rounded border border-gray-200"
                    />
                  )}
                  <div className="flex-1">
                    <p className="font-medium text-black">{item.product?.name || 'N/A'}</p>
                    <p className="text-sm text-gray-600">Quantity: {item.quantity}</p>
                  </div>
                  <p className="font-semibold text-black">₹{(item.price * item.quantity).toFixed(2)}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Order Summary */}
        <div className="space-y-6">
          <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-5">
            <h2 className="text-base font-semibold text-black mb-4">Order Summary</h2>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Payment</span>
                <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${
                  order.paymentMethod === 'cod' ? 'bg-orange-100 text-orange-800' : 'bg-emerald-100 text-emerald-800'
                }`}>
                  {order.paymentMethod === 'cod'
                    ? 'COD'
                    : order.paymentStatus === 'paid'
                      ? 'Paid Online'
                      : 'Online Pending'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Subtotal</span>
                <span className="font-medium text-black">₹{order.totalAmount.toFixed(2)}</span>
              </div>
              <div className="flex justify-between pt-3 border-t border-gray-200">
                <span className="font-semibold text-black">Total</span>
                <span className="font-semibold text-lg text-black">₹{order.totalAmount.toFixed(2)}</span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-5">
            <h2 className="text-base font-semibold text-black mb-4">Update Status</h2>
            <div className="space-y-3">
              <select
                value={newStatus}
                onChange={(e) => setNewStatus(e.target.value)}
                className="w-full px-3 py-2 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-yellow-400 bg-white text-sm text-black"
              >
                <option value="pending">Pending</option>
                <option value="processing">Processing</option>
                <option value="shipped">Shipped</option>
                <option value="delivered">Delivered</option>
                <option value="cancelled">Cancelled</option>
              </select>
              <button
                onClick={handleStatusUpdate}
                disabled={updating || !newStatus || newStatus === order?.status}
                className="w-full bg-black text-white px-4 py-2 rounded-md font-medium text-sm hover:bg-gray-800 transition-colors border border-gray-300 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {updating ? 'Updating...' : 'Update Status'}
              </button>
            </div>
            <div className="mt-4 pt-4 border-t border-gray-200">
              <p className="text-xs text-gray-600 mb-1">Order Date</p>
              <p className="text-sm font-medium text-black">{new Date(order.createdAt).toLocaleString()}</p>
            </div>
          </div>

          <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-5">
            <h2 className="text-base font-semibold text-black mb-4">Return Request</h2>
            {order.returnRequest?.isRequested ? (
              <div className="space-y-3">
                <p className="text-sm text-gray-700">
                  Current: <span className="font-semibold capitalize">{order.returnRequest?.status || 'requested'}</span>
                </p>
                {order.returnRequest?.reason && (
                  <p className="text-sm text-gray-700">
                    Reason: <span className="font-medium">{order.returnRequest.reason}</span>
                  </p>
                )}
                <select
                  value={returnStatus}
                  onChange={(e) => setReturnStatus(e.target.value)}
                  className="w-full px-3 py-2 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-yellow-400 bg-white text-sm text-black"
                >
                  <option value="requested">Requested</option>
                  <option value="approved">Approved</option>
                  <option value="rejected">Rejected</option>
                  <option value="received">Received</option>
                  <option value="refunded">Refunded</option>
                </select>
                <textarea
                  value={returnAdminNote}
                  onChange={(e) => setReturnAdminNote(e.target.value)}
                  placeholder="Admin note (optional)"
                  rows={3}
                  className="w-full px-3 py-2 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-yellow-400 bg-white text-sm text-black"
                />
                <button
                  onClick={handleReturnStatusUpdate}
                  disabled={updating}
                  className="w-full bg-black text-white px-4 py-2 rounded-md font-medium text-sm hover:bg-gray-800 transition-colors border border-gray-300 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {updating ? 'Updating...' : 'Update Return Status'}
                </button>
              </div>
            ) : (
              <p className="text-sm text-gray-600">No return request for this order.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default AdminOrderDetail
