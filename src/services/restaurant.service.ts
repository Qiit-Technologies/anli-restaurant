import api from '@/lib/axios';
import { customerAuthService } from '@/services/customerAuth.service';
import { analytics } from '@/lib/mixpanel';

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
    isScraped?: boolean;
    headline?: string;
    description?: string;
    amenities?: string[];
    promoTitle?: string;
    promoDescription?: string;
    twitterUrl?: string;
    linkedinUrl?: string;
    instagramUrl?: string;
    facebookUrl?: string;
    tiktokUrl?: string;
    snapchatUrl?: string;
    youtubeUrl?: string;
    website?: string;
    bookingUrl?: string;
    contactEmail?: string;
    contactPhone?: string;
    weekdayHours?: string;
    weekendHours?: string;
    restaurantName?: string;
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
     * Fetches details for a scraped restaurant
     */
    getScrapedDetails: async (id: number): Promise<Restaurant> => {
        try {
            const scrapedResponse = await api.get(
                `/hotels/scraped-restaurants/${id}`,
            );
            const scrapedData = scrapedResponse.data;
            if (!scrapedData || !scrapedData.id) {
                throw new Error('Restaurant not found');
            }
            return {
                id: scrapedData.id,
                name: scrapedData.name || 'Unnamed Restaurant',
                address: scrapedData.address || '',
                coverImage: scrapedData.coverImage || '',
                images: scrapedData.images?.length
                    ? scrapedData.images
                    : scrapedData.coverImage
                      ? [scrapedData.coverImage]
                      : [],
                rating: Number(scrapedData.rating ?? 4),
                ratingCount: Number(scrapedData.ratingCount ?? 0),
                tags: scrapedData.tags || 'Restaurant',
                displayHours:
                    scrapedData.displayHours || 'Hours not available',
                isBookable: scrapedData.isBookable ?? false,
                isScraped: true,
                headline: scrapedData.headline,
                description: scrapedData.description,
                amenities: scrapedData.amenities,
                website: scrapedData.website,
                bookingUrl: scrapedData.bookingUrl,
                contactEmail: scrapedData.contactEmail,
                contactPhone: scrapedData.contactPhone,
                twitterUrl: scrapedData.twitterUrl,
                linkedinUrl: scrapedData.linkedinUrl,
                instagramUrl: scrapedData.instagramUrl,
                facebookUrl: scrapedData.facebookUrl,
                tiktokUrl: scrapedData.tiktokUrl,
                snapchatUrl: scrapedData.snapchatUrl,
                youtubeUrl: scrapedData.youtubeUrl,
                city: scrapedData.city,
                neighborhood: scrapedData.neighborhood,
                weekdayHours: scrapedData.weekdayHours,
                weekendHours: scrapedData.weekendHours,
                closeTime: scrapedData.closeTime,
                priceLevel: scrapedData.priceLevel,
                averageCostForTwo: scrapedData.averageCostForTwo,
                promoTitle: scrapedData.promoTitle,
                promoDescription: scrapedData.promoDescription,
                whyDinersLoveUs: scrapedData.whyDinersLoveUs,
                serviceTypes: scrapedData.serviceTypes,
                dietaryPreferences: scrapedData.dietaryPreferences,
            };
        } catch (error: any) {
            throw error?.response?.data || error?.message || 'Restaurant not found';
        }
    },

    /**
     * Fetches details for a specific restaurant
     */
    getDetails: async (id: number, isScraped?: boolean): Promise<Restaurant> => {
        if (isScraped) {
            try {
                return await restaurantService.getScrapedDetails(id);
            } catch {
                // fall through to main hotel
            }
        }

        try {
            const response = await api.get(`/hotels/hotel/${id}`);
            const data = response.data;
            if (!data || !data.id) {
                throw new Error('Restaurant not found');
            }
            return data;
        } catch (error: any) {
            return await restaurantService.getScrapedDetails(id);
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
            return {
                restaurants: data.hotels ?? data,
                total: data.total ?? data.hotels?.length ?? 0,
            };
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

    /**
     * Resolves a restaurant by slug, searching both featured and scraped restaurants
     */
    resolveBySlug: async (slug: string): Promise<Restaurant | null> => {
        try {
            const featured = await restaurantService.getFeatured();
            const match = featured.find(
                (r) =>
                    r.name
                        .toLowerCase()
                        .trim()
                        .replace(/\s+/g, '-')
                        .replace(/[^\w-]+/g, '')
                        .replace(/--+/g, '-') === slug,
            );
            if (match) {
                return restaurantService.getDetails(match.id);
            }
        } catch {
            // fall through to scraped search
        }

        try {
            const scraped = await api.get('/hotels/scraped-restaurants');
            const scrapedList = scraped.data as any[];
            const scrapedMatch = scrapedList.find(
                (r: any) =>
                    r.name
                        .toLowerCase()
                        .trim()
                        .replace(/\s+/g, '-')
                        .replace(/[^\w-]+/g, '')
                        .replace(/--+/g, '-') === slug,
            );
            if (scrapedMatch) {
                return restaurantService.getDetails(scrapedMatch.id);
            }
        } catch {
            // fall through
        }

        return null;
    },

    /**
     * Sends an SMS & Email alert to a scraped restaurant when a diner clicks their booking platform URL
     */
    notifyScrapedRedirect: async (
        id: number,
        data: { customerName?: string; customerEmail?: string; customerPhone?: string },
    ): Promise<{ success: boolean; message: string }> => {
        try {
            const response = await api.post(
                `/hotels/scraped-restaurants/${id}/notify-redirect`,
                data,
            );
            return response.data;
        } catch (error: any) {
            return {
                success: false,
                message: error?.response?.data?.message || 'Failed to notify restaurant',
            };
        }
    },

    /**
     * Collects reservation details for a scraped restaurant without a booking platform
     * and sends an instant SMS & Email alert to the restaurant contact.
     */
    submitScrapedReservation: async (
        id: number,
        data: {
            customerName: string;
            customerEmail: string;
            customerPhone: string;
            date: string;
            time: string;
            guestCount: number;
            specialRequests?: string;
            tableType?: string;
            reservationType?: string;
        },
    ): Promise<{ success: boolean; message: string; data?: any }> => {
        try {
            const response = await api.post(
                `/hotels/scraped-restaurants/${id}/reservation`,
                data,
            );
            return response.data;
        } catch (error: any) {
            return {
                success: false,
                message:
                    error?.response?.data?.message ||
                    'Failed to submit reservation request',
            };
        }
    },
};

/**
  * Directly redirects to a scraped restaurant's booking URL if available,
  * triggering underground SMS & Email notifications without showing any modal.
  * If no booking URL is present, calls onOpenModal to collect reservation details.
  */
export const handleScrapedBooking = (
    restaurant: Restaurant,
    onOpenModal?: () => void
): boolean => {
    const rawBookingLink = restaurant.bookingUrl || restaurant.website;
    const hasBookingPlatform = Boolean(
        rawBookingLink &&
        rawBookingLink.trim().length > 0 &&
        !rawBookingLink.includes('example.com')
    );

    if (hasBookingPlatform && rawBookingLink) {
        const user = customerAuthService.getUser();
        const fullName = user ? `${user.firstName || ''} ${user.lastName || ''}`.trim() : '';
        const email = user?.email || '';
        const phone = user?.phoneNumber || '';

        try {
            analytics.track('scraped_restaurant_redirect', {
                restaurant_id: restaurant.id,
                restaurant_name: restaurant.name,
            });
        } catch (err) {
            console.error('Analytics error:', err);
        }

        // Send underground notification to restaurant via API
        restaurantService.notifyScrapedRedirect(restaurant.id, {
            customerName: fullName,
            customerEmail: email,
            customerPhone: phone,
        }).catch((err) => {
            console.error('Error sending redirect notification:', err);
        });

        const formattedBookingUrl = rawBookingLink.startsWith('http://') || rawBookingLink.startsWith('https://')
            ? rawBookingLink
            : `https://${rawBookingLink}`;

        window.open(formattedBookingUrl, '_blank', 'noopener,noreferrer');
        return true;
    }

    if (onOpenModal) {
        onOpenModal();
    }
    return false;
};
