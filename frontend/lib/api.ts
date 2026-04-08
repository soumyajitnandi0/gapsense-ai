import axios from 'axios';

const API_BASE = 'http://localhost:5000/api';

const api = axios.create({
    baseURL: API_BASE,
});

// Request interceptor to attach JWT token
api.interceptors.request.use(
    (config) => {
        // Only run on the client side
        if (typeof window !== 'undefined') {
            const token = localStorage.getItem('token');
            if (token) {
                config.headers['Authorization'] = `Bearer ${token}`;
            }
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Response interceptor to handle token expiration/auth errors globally
api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401 && typeof window !== 'undefined') {
            // Optional: redirect to login or clear token if 401 unauthorized
            // localStorage.removeItem('token');
            // window.location.href = '/auth/login';
        }
        return Promise.reject(error);
    }
);

export default api;
