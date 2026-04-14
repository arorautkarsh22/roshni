import API from './axios';

export const addToWishlist = (userId, productId) => API.post(`/wishlist/${userId}/${productId}`);
export const removeFromWishlist = (userId, productId) => API.delete(`/wishlist/${userId}/${productId}`);
export const getWishlist = (userId) => API.get(`/wishlist/${userId}`);
