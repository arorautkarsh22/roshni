import API from './axios';

export const createOrder = (userId, orderData) => API.post(`/orders/${userId}`, orderData);
export const getOrderById = (orderId) => API.get(`/orders/${orderId}`);
export const getUserOrders = (userId) => API.get(`/orders/user/${userId}`);
export const updateOrderStatus = (orderId, status) => API.put(`/orders/${orderId}/status?status=${status}`);
export const getAllOrders = () => API.get('/orders');
