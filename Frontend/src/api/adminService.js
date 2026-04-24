import API from './axios';

export const getDashboardStats = () => API.get('/admin/dashboard');
export const getInventoryStats = () => API.get('/admin/inventory');
export const getSalesAnalytics = () => API.get('/admin/sales');
export const getCustomerAnalytics = () => API.get('/admin/customers');
export const updateOrderStatus = (orderId, status) => API.put(`/orders/${orderId}/status?status=${status}`);
export const shipOrder = (orderId, trackingNumber) => API.patch(`/orders/${orderId}/ship`, { trackingNumber });
export const getAllOrders = () => API.get('/orders');
export const updateProductStock = (productId, additionalStock) =>
  API.patch(`/admin/products/${productId}/stock`, { additionalStock });
export const sendDiscountCode = (userId, discountPercent) =>
  API.post('/admin/discount-codes', { userId, discountPercent });
