import API from './axios';

export const createReview = (review) => API.post('/reviews', review);
export const getProductReviews = (productId) => API.get(`/reviews/product/${productId}`);
export const deleteReview = (id) => API.delete(`/reviews/${id}`);
