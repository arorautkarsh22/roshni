import API from './axios';

export const validateDiscountCode = (code) => API.get(`/discount-codes/validate?code=${code}`);
export const applyDiscountCode = (code) => API.post(`/discount-codes/apply?code=${code}`);
