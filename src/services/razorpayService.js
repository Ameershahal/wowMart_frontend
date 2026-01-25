import api from './api'

/**
 * Create Razorpay order
 */
export const createRazorpayOrder = async (sessionId, customerInfo) => {
  const response = await api.post('/razorpay/create-order', {
    sessionId,
    customerInfo
  })
  return response.data
}

/**
 * Verify Razorpay payment
 */
export const verifyRazorpayPayment = async (paymentData) => {
  const response = await api.post('/razorpay/verify-payment', paymentData)
  return response.data
}
