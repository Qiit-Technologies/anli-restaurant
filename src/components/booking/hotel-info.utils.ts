/** Standard check-out time shown on the public booking page. */
export const PUBLIC_BOOKING_CHECKOUT_TIME = '12:00 PM';

export type PublicBookingHotel = {
    id?: number;
    name?: string;
    address?: string;
    printoutAddress?: string | null;
    businessType?: string;
    country?: string;
    state?: string;
    coverImage?: string | null;
    images?: string[] | null;
    rating?: number | string;
    ratingCount?: number;
    tags?: string | null;
    displayHours?: string | null;
    defaultCheckoutTime?: string | null;
    reservationTermsHtml?: string | null;
    hotelServices?: Array<{ type: string; description?: string | null }>;
    vatRate?: number;
    serviceChargeRate?: number;
    tipRate?: number;
    enableTip?: boolean;
    frontOfficeVatRate?: number;
    frontOfficeServiceChargeRate?: number;
    frontOfficeTipRate?: number;
};

export function parseCommaSeparatedList(value?: string | null): string[] {
    if (!value?.trim()) return [];
    return value
        .split(',')
        .map((item) => item.trim())
        .filter(Boolean);
}

export function formatHotelTime(time?: string | null): string | null {
    if (!time?.trim()) return null;
    const match = time.trim().match(/^(\d{1,2}):(\d{2})/);
    if (!match) return time.trim();

    let hours = Number(match[1]);
    const minutes = match[2];
    if (Number.isNaN(hours)) return time.trim();

    const period = hours >= 12 ? 'PM' : 'AM';
    hours = hours % 12 || 12;
    return `${hours}:${minutes} ${period}`;
}

export function getHotelGalleryImages(hotel?: PublicBookingHotel): string[] {
    if (!hotel) return [];

    const gallery = Array.isArray(hotel.images)
        ? hotel.images.filter((url): url is string => Boolean(url?.trim()))
        : [];

    const unique = [...new Set(gallery)];
    if (unique.length > 0) return unique;
    if (hotel.coverImage?.trim()) return [hotel.coverImage];
    return [];
}

export function getHotelDisplayAddress(hotel?: PublicBookingHotel): string {
    if (!hotel) return '';
    return (
        hotel.printoutAddress?.trim() ||
        hotel.address?.trim() ||
        ''
    );
}

export function getHotelLocationLabel(hotel?: PublicBookingHotel): string {
    if (!hotel) return '';
    const parts = [hotel.state, hotel.country].filter(Boolean);
    return parts.join(', ');
}

export function getHotelFacilities(hotel?: PublicBookingHotel): string[] {
    if (!hotel?.hotelServices?.length) return [];
    return hotel.hotelServices
        .map((service) => service.type?.trim())
        .filter((type): type is string => Boolean(type));
}

export function formatBusinessType(value?: string): string {
    if (!value?.trim()) return '';
    return value.replace(/_/g, ' ').toLowerCase();
}
