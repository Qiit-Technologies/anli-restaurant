import { BASE_URL } from '@/constants/api';
import { RoomStatProps } from '@/hooks/fetcher';
import api from '@/lib/axios';
import { getAuthToken } from './auth/auth-token';
import { safeResponseJson, safeResponseJsonOrNull, safeErrorJson } from '@/lib/api';

export async function createRoom(formData: FormData) {
    const roomtype = formData.get('roomType');
    const price = formData.get('roomPrice');
    const floor = formData.get('roomFloors');
    const roomNumber = formData.get('roomNumber');
    const roomCapacity = formData.get('roomCapacity');
    const coverImage = formData.get('coverImage');

    const numericPrice = price ? parseFloat(price.toString()) : NaN;
    const numericFloor = floor ? parseInt(floor.toString(), 10) : NaN;
    const numericRoomCapacity = roomCapacity
        ? parseInt(roomCapacity.toString(), 10)
        : NaN;

    try {
        const authToken = await getAuthToken();
        if (!authToken) {
            return { error: 'Authentication token not found.' };
        }

        const apiUrl = new URL(`/rooms`, BASE_URL).toString();
        const response = await fetch(apiUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${authToken}`,
            },
            body: JSON.stringify({
                roomtype: roomtype,
                price: numericPrice,
                floor: numericFloor,
                roomCapacity: numericRoomCapacity,
                roomNumber: roomNumber,
                status: 'AVAIL',
                coverImage: coverImage,
            }),
            credentials: 'include',
        });

        if (!response.ok) {
            const error = await safeErrorJson(response);
            return {
                message:
                    error.message || 'Room creation failed. Please try again.',
            };
        }
        return { message: 'Room created successfully' };
    } catch (error: any) {
        return { error: 'An unexpected error occurred. Please try again.' };
    }
}

export async function getRoomByHotelId(params?: { isOccupied?: boolean }) {
    try {
        const authToken = await getAuthToken();
        if (!authToken) {
            return { error: 'Authentication token not found.' };
        }

        const query =
            params?.isOccupied !== undefined
                ? `?isOccupied=${params.isOccupied}`
                : '';
        const response = await api.get(`/rooms${query}`, {
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${authToken}`,
            },
        });

        if (response.status >= 500) {
            const error = await response.data;
            return {
                error: error.message || 'Failed to fetch rooms. Try again.',
            };
        }

        const data = await response.data;

        return { data };
    } catch (error: any) {
        return { error: 'An unexpected error occurred. Please try again.' };
    }
}

export type InHouseGuestRoomOption = {
    room: {
        id: number;
        roomNumber: string;
        roomNumberRoman?: string | null;
        roomtype?: { id: number; name: string } | null;
    };
    displayLabel: string;
    primaryGuest: {
        id: number;
        fullName: string;
        email: string;
        phoneNumber: string;
    };
};

/** Rooms with active checked-in guest; labels from API (source of truth). */
export async function getInHouseRoomsForGuestCharges() {
    try {
        const authToken = await getAuthToken();
        if (!authToken) {
            return { error: 'Authentication token not found.' };
        }
        const response = await api.get('/rooms/in-house-for-charges', {
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${authToken}`,
            },
        });
        if (response.status >= 500) {
            const error = await response.data;
            return {
                error: error.message || 'Failed to fetch rooms. Try again.',
            };
        }
        const data = (await response.data) as InHouseGuestRoomOption[];
        return { data: Array.isArray(data) ? data : [] };
    } catch (error: any) {
        return { error: 'An unexpected error occurred. Please try again.' };
    }
}

export async function getRoomByHotelIdForPublic(hotelId: string | number) {
    try {
        if (!hotelId) {
            return { error: 'Hotel ID is required.' };
        }

        const response = await api.get(
            `/rooms/${Number(hotelId)}/public-rooms`,
            {
                headers: {
                    'Content-Type': 'application/json',
                },
            },
        );

        if (response.status >= 500) {
            const error = await response.data;
            return {
                error: error.message || 'Failed to fetch rooms. Try again.',
            };
        }

        const data = await response.data;

        return { data };
    } catch (error: any) {
        // console.error('Error fetching rooms:', error);
        return { error: 'An unexpected error occurred. Please try again.' };
    }
}

export async function toggleRoomStatus(
    id: number,
    currentStatus: string,
) {
    try {
        const authToken = await getAuthToken();
        if (!authToken) {
            return { error: 'Authentication token not found.' };
        }

        const normalizedStatus = String(currentStatus).toUpperCase();
        const isRoomDirty =
            normalizedStatus === 'DIRTY' || normalizedStatus === 'IN_REVIEW';
        const apiUrl = new URL(
            `/rooms/${Number(id)}/status`,
            BASE_URL,
        ).toString();

        const response = await fetch(apiUrl, {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${authToken}`,
            },
            body: JSON.stringify({
                status: currentStatus,
                isDirty: isRoomDirty,
            }),
            credentials: 'include',
        });

        if (!response.ok) {
            const error = await safeErrorJson(response);
            return {
                message:
                    error.message ||
                    'Failed to update room status. Please try again.',
            };
        }

        return { message: 'Room status updated successfully' };
    } catch (error: any) {
        return { error: 'An unexpected error occurred. Please try again.' };
    }
}

export async function markRoomStatus(
    roomNumber: number | string,
    status: string,
) {
    try {
        const authToken = await getAuthToken();
        if (!authToken) {
            return { error: 'Authentication token not found.' };
        }
        const apiUrl = new URL(
            `/rooms/${roomNumber}/status`,
            BASE_URL,
        ).toString();

        const response = await fetch(apiUrl, {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${authToken}`,
            },
            body: JSON.stringify({ status }),
            credentials: 'include',
        });

        if (!response.ok) {
            const error = await safeErrorJson(response);
            return {
                message:
                    error.message ||
                    'Room type creation failed. Please try again.',
            };
        }

        return { message: 'Room marked successfully' };
    } catch (error: any) {
        return { error: 'An unexpected error occurred. Please try again.' };
    }
}

export async function getRoomBookings(roomNumber: number | string) {
    try {
        const authToken = await getAuthToken();
        if (!authToken) {
            return { error: 'Authentication token not found.' };
        }

        const response = await api.get(`/rooms/${roomNumber}/history`, {
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${authToken}`,
            },
        });

        if (response.status >= 500) {
            const error = await response.data;
            return {
                error: error.message || 'Failed to fetch bookings. Try again.',
            };
        }

        const data = await response.data;

        return { data };
    } catch (error: any) {
        return { error: 'An unexpected error occurred. Please try again.' };
    }
}

export async function editRoom(roomId: string, formData: any) {
    try {
        const authToken = await getAuthToken();
        if (!authToken) {
            return { error: 'Authentication token not found.' };
        }

        const apiUrl = new URL(
            `/rooms/${Number(formData.roomId)}`,
            BASE_URL,
        ).toString();
        const response = await fetch(apiUrl, {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${authToken}`,
            },
            body: JSON.stringify({
                roomtype: formData.roomTypeId,
                price: Number(formData.roomPrice),
                floor: Number(formData.roomFloor),
                roomCapacity: Number(formData.roomCapacity),
                roomNumber: formData.roomNumber,
            }),
            credentials: 'include',
        });

        if (!response.ok) {
            const error = await safeErrorJson(response);
            return {
                message:
                    error.message || 'Room update failed. Please try again.',
            };
        }
        return { message: 'Room updated successfully' };
    } catch (error: any) {
        return { error: 'An unexpected error occurred. Please try again.' };
    }
}

export async function deleteRoom(roomId: string) {
    try {
        const authToken = await getAuthToken();
        if (!authToken) {
            return { error: 'Authentication token not found.' };
        }

        const apiUrl = new URL(`/rooms/${Number(roomId)}`, BASE_URL).toString();
        const response = await fetch(apiUrl, {
            method: 'DELETE',
            headers: {
                Authorization: `Bearer ${authToken}`,
            },
            credentials: 'include',
        });

        if (!response.ok) {
            const error = await safeErrorJson(response);
            return {
                message:
                    error.message || 'Room deletion failed. Please try again.',
            };
        }
        return { message: 'Room deleted successfully' };
    } catch (error: any) {
        return { error: 'An unexpected error occurred. Please try again.' };
    }
}

export async function getRoomStatsByHotelId(): Promise<
    | { error?: string; data?: RoomStatProps }
    | { data: RoomStatProps }
    | { error: string }
> {
    try {
        const authToken = await getAuthToken();
        if (!authToken) {
            return { error: 'Authentication token not found.' };
        }

        const apiUrl = new URL(`/rooms/stat`, BASE_URL).toString();

        const response = await fetch(apiUrl, {
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${authToken}`,
            },
        });

        if (!response.ok) {
            const error = await safeErrorJson(response);
            return { error: error.message || 'Failed to fetch room.' };
        }

        const data = await safeResponseJson(response);
        return { data };
    } catch (error: any) {
        console.log('Error fetching rooms:', error);
        return { error: 'An unexpected error occurred. Please try again.' };
    }
}

export async function getRoomAvailabilityByDateRange(
    hotelId: string | number,
    startDate: string,
    endDate: string,
) {
    try {
        if (!hotelId || !startDate || !endDate) {
            return {
                error: 'Hotel ID, start date, and end date are required.',
            };
        }

        const response = await api.get(
            `/rooms/${Number(hotelId)}/availability`,
            {
                params: {
                    startDate,
                    endDate,
                },
                headers: {
                    'Content-Type': 'application/json',
                },
            },
        );

        if (response.status >= 500) {
            const error = response.data;
            return {
                error:
                    error.message ||
                    'Failed to fetch room availability. Try again.',
            };
        }

        const data = await response.data;

        return { data };
    } catch (error: any) {
        return { error: 'An unexpected error occurred. Please try again.' };
    }
}
