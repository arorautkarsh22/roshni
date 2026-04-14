import API from './axios';

export const createPaymentIntent = (orderId) => API.post(`/payments/create/${orderId}`);
export const confirmPayment = (intentId) => API.post(`/payments/confirm/${intentId}`);
export const failPayment = (intentId, reason) => API.post(`/payments/failure?intentId=${intentId}&reason=${reason}`);
export const getPaymentByOrder = (orderId) => API.get(`/payments/order/${orderId}`);
