import API from './axios';

export const getAllProducts = () => API.get('/products');
export const getProductsPaginated = (page = 0, size = 12, sortBy = 'name', sortDir = 'asc') =>
  API.get(`/products/page?page=${page}&size=${size}&sortBy=${sortBy}&sortDir=${sortDir}`);
export const getProductById = (id) => API.get(`/products/${id}`);
export const getProductsByCategory = (categoryId) => API.get(`/products/category/${categoryId}`);
export const getFeaturedProducts = () => API.get('/products/featured');
export const searchProducts = (keyword) => API.get(`/products/search?keyword=${keyword}`);
export const createProduct = (product) => API.post('/products', product);
export const updateProduct = (id, product) => API.put(`/products/${id}`, product);
export const deleteProduct = (id) => API.delete(`/products/${id}`);
