import API from './axios';

export const getDashboardStats = () => API.get('/admin/dashboard');
export const getInventoryStats = () => API.get('/admin/inventory');
export const getSalesAnalytics = () => API.get('/admin/sales');
export const getCustomerAnalytics = () => API.get('/admin/customers');
export const getAllEmails = () => API.get('/admin/emails');
