import API from './axios';

export const addAddress = (userId, address) => API.post(`/addresses/${userId}`, address);
export const getUserAddresses = (userId) => API.get(`/addresses/user/${userId}`);
export const updateAddress = (id, address) => API.put(`/addresses/${id}`, address);
export const deleteAddress = (id) => API.delete(`/addresses/${id}`);
