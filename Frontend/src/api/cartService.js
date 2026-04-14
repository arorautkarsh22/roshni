import API from './axios';

export const getCart = (userId) => API.get(`/cart/${userId}`);
export const addToCart = (userId, item) => API.post(`/cart/${userId}/items`, item);
export const updateCartItem = (userId, itemId, quantity) => API.put(`/cart/${userId}/items/${itemId}?quantity=${quantity}`);
export const removeCartItem = (userId, itemId) => API.delete(`/cart/${userId}/items/${itemId}`);
export const clearCart = (userId) => API.delete(`/cart/${userId}/clear`);

