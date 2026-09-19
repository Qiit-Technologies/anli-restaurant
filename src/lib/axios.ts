import axios from 'axios';

const api = axios.create({
    baseURL: process.env.NEXT_PUBLIC_BE_URL || 'http://localhost:3001',
    withCredentials: true,
    timeout: 60000,
});

api.interceptors.request.use(
    (config) => {
        if (typeof window !== 'undefined') {
            const token = localStorage.getItem('customerToken');
            if (token) {
                config.headers.Authorization = `Bearer ${token}`;
            }
        }
        return config;
    },
    (error) => Promise.reject(error),
);
api.interceptors.response.use(
    (response) => {
        return response;
    },
    (error) => {
        const status = error?.response?.status;

        if (typeof window !== 'undefined' && status === 401) {
            const path = window.location.pathname;
            const isAuthPage =
                path.startsWith('/signin') ||
                path.startsWith('/signup') ||
                path.startsWith('/verify-email') ||
                path.startsWith('/staff-login');

            if (!isAuthPage) {
                localStorage.removeItem('customerToken');
                localStorage.removeItem('customerUser');
            }
        }

        return Promise.reject(error);
    },
);
export default api;
