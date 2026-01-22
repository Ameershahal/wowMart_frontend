import api from './api';

const getSessionId = () => {
  let sessionId = localStorage.getItem('sessionId');
  if (!sessionId) {
    sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    localStorage.setItem('sessionId', sessionId);
  }
  return sessionId;
};

export const getWishlist = async (sessionId = null) => {
  const id = sessionId || getSessionId();
  const response = await api.get(`/wishlist/${id}`);
  return response.data;
};

export const addToWishlist = async (productId) => {
  const sessionId = getSessionId();
  const response = await api.post(`/wishlist/${sessionId}/items`, { productId });
  return response.data;
};

export const removeFromWishlist = async (itemId) => {
  const sessionId = getSessionId();
  const response = await api.delete(`/wishlist/${sessionId}/items/${itemId}`);
  return response.data;
};

export const clearWishlist = async () => {
  const sessionId = getSessionId();
  const response = await api.delete(`/wishlist/${sessionId}`);
  return response.data;
};
