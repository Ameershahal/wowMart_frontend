import api from './api'

const getSessionId = () => {
  let sessionId = localStorage.getItem('sessionId')
  if (!sessionId) {
    sessionId = 'session_' + Math.random().toString(36).substr(2, 9) + Date.now()
    localStorage.setItem('sessionId', sessionId)
  }
  return sessionId
}

export const getCart = async () => {
  const sessionId = getSessionId()
  const response = await api.get(`/cart/${sessionId}`)
  return response.data
}

export const addToCart = async (productId, quantity = 1) => {
  const sessionId = getSessionId()
  const response = await api.post(`/cart/${sessionId}/items`, {
    productId,
    quantity
  })
  return response.data
}

export const updateCartItem = async (itemId, quantity) => {
  const sessionId = getSessionId()
  const response = await api.put(`/cart/${sessionId}/items/${itemId}`, {
    quantity
  })
  return response.data
}

export const removeFromCart = async (itemId) => {
  const sessionId = getSessionId()
  const response = await api.delete(`/cart/${sessionId}/items/${itemId}`)
  return response.data
}

export const clearCart = async () => {
  const sessionId = getSessionId()
  const response = await api.delete(`/cart/${sessionId}`)
  return response.data
}
