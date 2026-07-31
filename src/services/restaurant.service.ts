import api from '@/lib/axios';

export interface Restaurant {
    id: number;
    name: string;
    address: string;
    coverImage: string;
    images?: string[];
    rating: number;
    ratingCount: number;
    tags: string;
    displayHours: string;
    isBookable?: boolean;
    headline?: string;
    description?: string;
    amenities?: string[];
    promoTitle?: string;
    promoDescription?: string;
    twitterUrl?: string;
    linkedinUrl?: string;
    instagramUrl?: string;
    facebookUrl?: string;
    website?: string;
    contactEmail?: string;
    contactPhone?: string;
    weekdayHours?: string;
    weekendHours?: string;
    closeTime?: string;
    lat?: number;
    lng?: number;
    city?: string;
    neighborhood?: string;
    priceLevel?: string;
    averageCostForTwo?: number;
    serviceTypes?: string[];
    dietaryPreferences?: string[];
    whyDinersLoveUs?: {
        topRatedText?: string;
        greatLocationText?: string;
        goodFoodText?: string;
    };
    minPartySize?: number;
    maxPartySize?: number;
    advanceBookingNoticeHours?: number;
    cancellationPolicy?: string;
}

export interface Menu {
    id: number;
    name: string;
    description: string;
    categories: MenuCategory[];
}

export interface MenuCategory {
    id: number;
    name: string;
    description: string;
    items: MenuItem[];
}

export interface MenuItem {
    id: number;
    name: string;
    description: string;
    price: number;
    image: string | null;
}

export const restaurantService = {
    /**
     * Fetches featured restaurants for the home screen
     */
    getFeatured: async (): Promise<Restaurant[]> => {
        try {
            const response = await api.get('/hotels/mobile/featured');
            return response.data;
        } catch (error: any) {
            throw error.response?.data || error.message;
        }
    },

    /**
     * Fetches details for a specific restaurant
     */
    getDetails: async (id: number): Promise<Restaurant> => {
        try {
            const response = await api.get(`/hotels/hotel/${id}`);
            return response.data;
        } catch (error: any) {
            throw error.response?.data || error.message;
        }
    },

    /**
     * Fetches restaurants near a specific location
     */
    getNearby: async (lat?: number, lng?: number): Promise<Restaurant[]> => {
        try {
            let url = '/hotels/mobile/featured'; // Defaulting to featured if no coords
            if (lat && lng) {
                url = `/hotels/mobile/search?lat=${lat}&lng=${lng}`;
            }
            const response = await api.get(url);
            return response.data;
        } catch (error: any) {
            throw error.response?.data || error.message;
        }
    },

    /**
     * Reverse geocodes coordinates to get a location name using Google API via backend
     */
    reverseGeocode: async (lat: number, lng: number): Promise<string> => {
        try {
            const response = await api.get(
                `/hotels/mobile/reverse-geocode?lat=${lat}&lng=${lng}`,
            );
            return response.data;
        } catch (error: any) {
            throw error.response?.data || error.message;
        }
    },

    /**
     * Geocodes a text address to coordinates using Geoapify via backend
     */
    geocode: async (
        text: string,
    ): Promise<{ lat: number; lng: number } | null> => {
        try {
            const response = await api.get(
                `/hotels/mobile/geocode?text=${encodeURIComponent(text)}`,
            );
            return response.data;
        } catch (error: any) {
            throw error.response?.data || error.message;
        }
    },

/**
 * Searches restaurants by name, tags, or address with pagination
 */
search: async (
    query: string,
    filters?: { rating?: number; tags?: string },
    page?: number,
    limit?: number,
): Promise<{ restaurants: Restaurant[]; total: number }> => {
    try {
        let url = `/hotels/mobile/search?q=${encodeURIComponent(query)}`;
        if (filters?.rating) url += `&rating=${filters.rating}`;
        if (filters?.tags)
            url += `&tags=${encodeURIComponent(filters.tags)}`;
        if (page) url += `&page=${page}`;
        if (limit) url += `&limit=${limit}`;

        const response = await api.get(url);
        const data = response.data;
        if (Array.isArray(data)) {
            return { restaurants: data, total: data.length };
        }
        return { restaurants: data.hotels ?? data, total: data.total ?? data.hotels?.length ?? 0 };
    } catch (error: any) {
        throw error.response?.data || error.message;
    }
},

    /**
     * Autocomplete suggestions for restaurant search
     */
    autocomplete: async (
        query: string,
        limit?: number,
    ): Promise<
        { name: string; address: string; rating: number; coverImage: string }[]
    > => {
        try {
            let url = `/hotels/mobile/autocomplete?q=${encodeURIComponent(query)}`;
            if (limit) url += `&limit=${limit}`;
            const response = await api.get(url);
            return response.data;
        } catch (error: any) {
            throw error.response?.data || error.message;
        }
    },

    /**
     * Fetches all menus for a specific restaurant with full details
     */
    getMenu: async (hotelId: number): Promise<Menu[]> => {
        try {
            const menusResponse = await api.get(
                `/menu/public/menu?hotelId=${hotelId}`,
            );
            const menus = menusResponse.data;

            if (!menus || menus.length === 0) return [];

            const detailedMenus = await Promise.all(
                menus.map(async (m: any) => {
                    const detail = await api.get(`/menu/public/menu/${m.id}`);
                    return detail.data;
                }),
            );

            return detailedMenus;
        } catch (error: any) {
            throw error.response?.data || error.message;
        }
    },
    /**
     * Fetches all reservations for a specific customer
     */
    getBookingsByCustomerId: async (customerId: string): Promise<any[]> => {
        try {
            const response = await api.get(
                `/table-reservations/public/customer/${customerId}`,
            );
            return response.data;
        } catch (error: any) {
            throw error.response?.data || error.message;
        }
    },
};
