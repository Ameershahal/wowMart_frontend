import api from './api';

export const getProductReviews = async (productId) => {
  const response = await api.get(`/reviews/product/${productId}`);
  return response.data;
};

export const createReview = async (productId, reviewData) => {
  const response = await api.post('/reviews', {
    productId,
    ...reviewData
  });
  return response.data;
};
