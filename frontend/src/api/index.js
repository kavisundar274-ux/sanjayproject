import axios from 'axios';

const API = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
  headers: { 'Content-Type': 'application/json' }
});

export const getProducts = () => API.get('/products');
export const addProduct = (product) => API.post('/products', product);
export const updateProduct = (id, product) => API.put(`/products/${id}`, product);
export const deleteProduct = (id) => API.delete(`/products/${id}`);
export const addProduct = (data) => API.post('/products', data);
export const updateProduct = (id, data) => API.put(`/products/${id}`, data);
export const deleteProduct = (id) => API.delete(`/products/${id}`);
export const updateStock = (id, stock) => API.patch(`/products/${id}/stock`, { stock });

export const getBills = () => API.get('/bills');
export const getBillById = (id) => API.get(`/bills/${id}`);
export const getDailySales = () => API.get('/bills/daily');
export const getMonthlyReport = (month, year) => API.get('/bills/monthly', { params: { month, year } });
export const saveMonthlyReport = (month, year, finalize = false) => API.post('/bills/monthly/save', { month, year, finalize });
export const listSavedMonthlyReports = () => API.get('/bills/monthly/saved');
export const getSavedMonthlyReport = (id) => API.get(`/bills/monthly/saved/${id}`);
export const finalizeSavedMonthlyReport = (id) => API.post(`/bills/monthly/saved/${id}/finalize`);
export const createBill = (data) => API.post('/bills', data);
export const updateBill = (id, data) => API.put(`/bills/${id}`, data);
export const markBillPaid = (id) => API.patch(`/bills/${id}/paid`);

export const resetData = () => API.post('/reset');

export default API;
