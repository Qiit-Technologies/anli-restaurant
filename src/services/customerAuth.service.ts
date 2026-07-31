import api from '@/lib/axios';

export interface RegisterData {
    firstName: string;
    lastName: string;
    email: string;
    phoneNumber: string;
    password: string;
}

export interface CustomerUser {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    phoneNumber?: string;
}

export const customerAuthService = {
    /**
     * Registers a new customer
     */
    register: async (data: RegisterData) => {
        try {
            const response = await api.post('/customers/register', data);
            return response.data;
        } catch (error: any) {
            throw error.response?.data || error.message;
        }
    },

    /**
     * Verifies OTP code
     */
    verifyOtp: async (email: string, code: string) => {
        try {
            const response = await api.post('/customers/verify-otp', {
                email,
                otp: code,
            });
            const { access_token, customer } = response.data;

            if (access_token) {
                localStorage.setItem('customerToken', access_token);
            }
            if (customer) {
                localStorage.setItem('customerUser', JSON.stringify(customer));
            }

            return response.data;
        } catch (error: any) {
            throw error.response?.data || error.message;
        }
    },

    /**
     * Resends OTP code
     */
    resendOtp: async (email: string) => {
        try {
            const response = await api.post('/customers/resend-otp', { email });
            return response.data;
        } catch (error: any) {
            throw error.response?.data || error.message;
        }
    },

    /**
     * Logs in an existing customer
     */
    login: async (email: string, password: string) => {
        try {
            const response = await api.post('/customers/login', { email, password });
            const { access_token, data: customer } = response.data;

            if (access_token) {
                localStorage.setItem('customerToken', access_token);
            }
            if (customer) {
                localStorage.setItem('customerUser', JSON.stringify(customer));
            }

            return response.data;
        } catch (error: any) {
            throw error.response?.data || error.message;
        }
    },

    /**
     * Clears stored session
     */
    logout: () => {
        localStorage.removeItem('customerToken');
        localStorage.removeItem('customerUser');
    },

    /**
     * Retrieves stored user profile
     */
    getUser: (): CustomerUser | null => {
        if (typeof window === 'undefined') return null;
        const raw = localStorage.getItem('customerUser');
        return raw ? JSON.parse(raw) : null;
    },

    /**
     * Toggles a hotel as favorite
     */
    toggleFavorite: async (hotelId: number) => {
        try {
            const response = await api.post(`/customers/favorites/${hotelId}`);
            return response.data;
        } catch (error: any) {
            throw error.response?.data || error.message;
        }
    },

    /**
     * Gets list of favorite hotels
     */
    getFavorites: async () => {
        try {
            const response = await api.get('/customers/favorites');
            return response.data;
        } catch (error: any) {
            throw error.response?.data || error.message;
        }
    },
};
