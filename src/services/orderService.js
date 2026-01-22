import api from './api'

const getSessionId = () => {
  return localStorage.getItem('sessionId')
}

export const createOrder = async (customerInfo) => {
  const sessionId = getSessionId()
  const response = await api.post('/orders', {
    sessionId,
    customerInfo
  })
  return response.data
}

export const getOrdersByEmail = async (email) => {
  const response = await api.get(`/orders/search/by-email?email=${encodeURIComponent(email)}`)
  return response.data
}

export const getOrder = async (orderNumber) => {
  const response = await api.get(`/orders/${orderNumber}`)
  return response.data
}
