import axios from 'axios';

// Buat instance axios
const api = axios.create({
  // Pastikan URL mengarah ke /api (sesuai setting .env kamu yang baru)
  baseURL: import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000/api',
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json', // Penting agar Laravel merespon dengan JSON jika error
  },
});

// --- REQUEST INTERCEPTOR ---
// Sebelum request dikirim, ambil token dari saku (localStorage)
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      // Tempelkan token ke Header
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// --- RESPONSE INTERCEPTOR ---
// Kalau token kadaluarsa atau tidak valid (401), tendang user keluar
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      // Token tidak valid/kadaluarsa
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      
      // Redirect ke login (opsional, bisa pakai window.location)
      // window.location.href = '/'; 
    }
    return Promise.reject(error);
  }
);

export default api;