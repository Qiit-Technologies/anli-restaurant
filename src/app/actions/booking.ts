import api from '@/lib/axios';

export type PublicBookingCancellationRoom = {
    guestId: number;
    guestName: string | null;
    bookingCode: string;
    roomNumber: string | null;
    roomTypeName: string | null;
    isVoid: boolean;
    canCancel: boolean;
    cancelBlockedReason: string | null;
    amount: number;
};

export type PublicBookingCancellationPreview = {
    bookingCode: string;
    bookingCodes: string[];
    fullName: string;
    email: string;
    phoneNumber: string | null;
    specialRequests: string | null;
    hotelName: string | null;
    hotelId: number | null;
    roomTypeName: string | null;
    roomNumber: string | null;
    roomCount: number;
    activeRoomCount: number;
    rooms: PublicBookingCancellationRoom[];
    startDate: string;
    endDate: string;
    numberOfGuests: number;
    totalAmount: number;
    reservationSource: string | null;
    isVoid: boolean;
    isCheckedIn: boolean;
    canCancel: boolean;
    cancelBlockedReason: string | null;
};

export async function getPublicBookingForCancellation(token: string) {
    try {
        const response = await api.get(
            `/guests/public/cancel/${encodeURIComponent(token)}`,
        );
        return { success: true, data: response.data as PublicBookingCancellationPreview };
    } catch (error: any) {
        return {
            success: false,
            message:
                error.response?.data?.message ||
                'Unable to load this reservation.',
        };
    }
}

export async function cancelPublicBooking(
    token: string,
    reason?: string,
    bookingCodes?: string[],
) {
    try {
        const response = await api.post('/guests/public/cancel', {
            token,
            reason,
            bookingCodes,
        });
        return {
            success: true,
            data: response.data as {
                message: string;
                bookingCode: string;
                bookingCodes?: string[];
                roomCount?: number;
                remainingRoomCount?: number;
                allCancelled?: boolean;
            },
        };
    } catch (error: any) {
        return {
            success: false,
            message:
                error.response?.data?.message ||
                'Failed to cancel reservation. Please try again.',
        };
    }
}

export type PublicBookingBankAccount = {
    id: number;
    bankName: string;
    accountName: string;
    accountNumber: string;
};

export type PublicBookingCreateResult = {
    bookingCode?: string;
    bookingCodes?: string[];
    bookingGroupId?: string;
    totalBookingAmount?: number;
    paymentOption?: string;
    paystack?: {
        authorization_url: string;
        access_code: string;
        reference: string;
    } | null;
    bankAccount?: PublicBookingBankAccount | null;
    cancellationToken?: string;
};

export async function verifyPublicBookingPaystack(
    reference: string,
    bookingGroupId: string,
) {
    try {
        const response = await api.get('/guests/public/paystack/verify', {
            params: { reference, bookingGroupId },
        });
        return {
            success: true,
            data: response.data as {
                success?: boolean;
                message?: string;
                bookingCodes?: string[];
                bookingGroupId?: string;
                amountPaid?: number;
            },
            message: response.data?.message as string | undefined,
        };
    } catch (error: any) {
        return {
            success: false,
            message:
                error.response?.data?.message ||
                'Payment verification failed. Please contact the hotel.',
        };
    }
}

export async function initializePublicBookingPaystack(
    data: Record<string, unknown>,
    hotelId: string | number,
) {
    try {
        const response = await api.post(
            `/guests/public/${hotelId}/paystack/initialize`,
            data,
            {
                headers: {
                    'Content-Type': 'application/json',
                },
            },
        );

        if (response.status >= 400) {
            return {
                success: false,
                message:
                    response.data?.message ||
                    'Failed to start payment',
            };
        }

        return {
            success: true,
            data: response.data as {
                bookingGroupId: string;
                totalBookingAmount: number;
                paystack: {
                    authorization_url: string;
                    access_code: string;
                    reference: string;
                };
            },
        };
    } catch (error: any) {
        return {
            success: false,
            message:
                error.response?.data?.message ||
                'An unexpected error occurred. Please try again.',
        };
    }
}

export async function createPublicBooking(data: any, hotelId: string | number) {
    try {
        const response = await api.post(`/guests/public/${hotelId}`, data, {
            headers: {
                'Content-Type': 'application/json',
            },
        });

        if (response.status >= 400) {
            return {
                success: false,
                message: response.data?.message || 'Failed to create booking',
            };
        }

        return {
            success: true,
            data: response.data as PublicBookingCreateResult,
        };
    } catch (error: any) {
        return {
            success: false,
            message: error.response?.data?.message || 'An unexpected error occurred. Please try again.',
        };
    }
}

export async function uploadPublicReceipt(token: string, proofOfPayment: string) {
    try {
        const response = await api.patch(`/guests/public/receipt`, {
            token,
            proofOfPayment,
        }, {
            headers: {
                'Content-Type': 'application/json',
            },
        });

        if (response.status >= 400) {
            return {
                success: false,
                message: response.data?.message || 'Failed to upload receipt',
            };
        }

        return { success: true };
    } catch (error: any) {
        return {
            success: false,
            message: error.response?.data?.message || 'An unexpected error occurred. Please try again.',
        };
    }
}
