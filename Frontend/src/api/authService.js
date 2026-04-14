import API from './axios';

export const login = (credentials) => API.post('/auth/login', credentials);
export const register = (userData) => API.post('/auth/register', userData);
export const registerAdmin = (userData) => API.post('/auth/register-admin', userData);
