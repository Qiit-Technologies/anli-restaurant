'use client';

import React, { useState, useEffect } from 'react';
import { UseFormReturn } from 'react-hook-form';
import {
    BookingFormInput,
    BookingFormSelect,
    BookingFormTimePicker,
} from '../components';
import BookingDatePicker from '../components/BookingDatePicker';
import dayjs from 'dayjs';
import { BookingFormData } from '../schemas';
import { getRoomAvailabilityByDateRange } from '@/app/actions/room';

interface BookingDetailsFormProps {
    form: UseFormReturn<BookingFormData>;
    hotelId?: string;
}

interface RoomTypeAvailability {
    roomTypeId: number;
    roomTypeName: string;
    roomTypeDescription: string;
    availableCount: number;
    averagePrice: number;
    sampleRoom: {
        coverImage?: string;
    } | null;
}

const GUEST_OPTIONS = [
    { value: '1', label: '1 Guest' },
    { value: '2', label: '2 Guests' },
    { value: '3', label: '3 Guests' },
    { value: '4', label: '4 Guests' },
    { value: '5', label: '5 Guests' },
];

export default function BookingDetailsForm({
    form,
    hotelId,
}: BookingDetailsFormProps) {
    const {
        register,
        control,
        watch,
        setValue,
        formState: { errors },
    } = form;

    const [availableRoomTypes, setAvailableRoomTypes] = useState<
        RoomTypeAvailability[]
    >([]);
    const [loadingAvailability, setLoadingAvailability] = useState(false);
    const [selectedRoomType, setSelectedRoomType] = useState<string>('');
    const [roomQuantity, setRoomQuantity] = useState<number>(1);

    // Watch dates for night calculation and availability
    const startDate = watch('bookingDetails.startDate');
    const endDate = watch('bookingDetails.endDate');

    useEffect(() => {
        if (startDate && endDate) {
            const start = dayjs(startDate);
            const end = dayjs(endDate);
            // Calculate difference in days
            const diff = end.diff(start, 'day');

            if (diff >= 0) {
                setValue('bookingDetails.numNights', diff.toString(), {
                    shouldValidate: true,
                });
            } else {
                setValue('bookingDetails.numNights', '0', {
                    shouldValidate: true,
                });
            }
        }
    }, [startDate, endDate, setValue]);

    useEffect(() => {
        async function fetchAvailability() {
            if (!hotelId || !startDate || !endDate) {
                setAvailableRoomTypes([]);
                return;
            }

            setLoadingAvailability(true);
            try {
                const result = await getRoomAvailabilityByDateRange(
                    hotelId,
                    startDate,
                    endDate,
                );

                if (result && 'data' in result && Array.isArray(result.data)) {
                    setAvailableRoomTypes(result.data);
                    // Reset room type selection if previously selected type is no longer available
                    const availableIds = result.data.map(
                        (r: RoomTypeAvailability) => r.roomTypeId.toString(),
                    );
                    if (
                        selectedRoomType &&
                        !availableIds.includes(selectedRoomType)
                    ) {
                        setValue('bookingDetails.roomType', '', {
                            shouldValidate: true,
                        });
                        setSelectedRoomType('');
                    }
                } else {
                    setAvailableRoomTypes([]);
                }
            } catch (error) {
                console.error('Error fetching availability:', error);
                setAvailableRoomTypes([]);
            } finally {
                setLoadingAvailability(false);
            }
        }

        fetchAvailability();
    }, [hotelId, startDate, endDate, setValue]);

    const handleRoomTypeSelect = (roomTypeId: string) => {
        setSelectedRoomType(roomTypeId);
        setRoomQuantity(1); // Reset quantity when room type changes
        setValue('bookingDetails.roomType', roomTypeId, {
            shouldValidate: true,
        });
    };

    const handleQuantityChange = (quantity: number) => {
        setRoomQuantity(quantity);
    };

    // Calculate total price
    const numNights = watch('bookingDetails.numNights');

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('en-NG', {
            style: 'currency',
            currency: 'NGN',
            minimumFractionDigits: 0,
            maximumFractionDigits: 0,
        })
            .format(amount)
            .replace('NGN', '₦');
    };

    return (
        <div className="space-y-6">
            {/* Green Note */}
            <div className="bg-[#F6FFF9] border border-[#E8F5EE] rounded-md p-2 text-center">
                <p className="text-[#066812] text-[10px] font-medium">
                    Note: A down payment of 10% of the selected room will be
                    made to book your reservation
                </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
                {/* Left Column - Form Inputs */}
                <div className="lg:col-span-2 space-y-6">
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                        <h2 className="text-lg font-semibold text-gray-900 mb-6">
                            Reservation Details
                        </h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {/* Custom dual date picker — check-in + check-out in one */}
                            <div className="md:col-span-2">
                                <label className="block text-sm text-[#667085] mb-1 font-medium">
                                    Check-in &amp; Check-out Dates
                                </label>
                                <BookingDatePicker
                                    value={{
                                        startDate: startDate ?? '',
                                        endDate: endDate ?? '',
                                    }}
                                    onChange={(range) => {
                                        setValue(
                                            'bookingDetails.startDate',
                                            range.startDate,
                                            { shouldValidate: true },
                                        );
                                        setValue(
                                            'bookingDetails.endDate',
                                            range.endDate,
                                            { shouldValidate: true },
                                        );
                                    }}
                                    placeholder="Select check-in and check-out dates"
                                />
                                {(errors.bookingDetails?.startDate?.message ||
                                    errors.bookingDetails?.endDate?.message) && (
                                    <p className="mt-1 text-[11px] text-red-500">
                                        {errors.bookingDetails?.startDate
                                            ?.message ||
                                            errors.bookingDetails?.endDate
                                                ?.message}
                                    </p>
                                )}
                            </div>
                            <BookingFormTimePicker
                                label="Reservation time"
                                name="bookingDetails.reservationTime"
                                control={control}
                                placeholder="Enter time"
                                error={
                                    errors.bookingDetails?.reservationTime
                                        ?.message
                                }
                                noBorder={true}
                            />
                            <BookingFormSelect
                                label="Guests"
                                placeholder="No of Guests"
                                options={GUEST_OPTIONS}
                                error={
                                    errors.bookingDetails?.numGuests?.message
                                }
                                registration={register(
                                    'bookingDetails.numGuests',
                                )}
                                noBorder={true}
                            />
                            <BookingFormInput
                                label="Nights"
                                placeholder="0"
                                registration={register(
                                    'bookingDetails.numNights',
                                )}
                                noBorder={true}
                                disabled={true}
                                className="bg-gray-50 text-gray-400 cursor-not-allowed"
                            />
                        </div>
                    </div>
                </div>

                {/* Right Column - Room Types */}
                <div className="lg:col-span-3">
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 sticky top-4">
                        <h2 className="text-lg font-semibold text-gray-900 mb-6">
                            Select Room Type
                        </h2>

                        {!startDate || !endDate ? (
                            <div className="bg-gray-50 border border-gray-200 rounded-lg p-6 text-center">
                                <p className="text-gray-500 text-sm">
                                    Please select start and end dates to view
                                    available room types
                                </p>
                            </div>
                        ) : loadingAvailability ? (
                            <div className="bg-gray-50 border border-gray-200 rounded-lg p-6 text-center">
                                <p className="text-gray-500 text-sm">
                                    Loading availability...
                                </p>
                            </div>
                        ) : availableRoomTypes.length === 0 ? (
                            <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
                                <p className="text-red-600 text-sm">
                                    No rooms available for the selected dates
                                </p>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                {availableRoomTypes.map((roomType) => {
                                    const isSelected =
                                        selectedRoomType ===
                                        roomType.roomTypeId.toString();
                                    const currentTotalPrice =
                                        isSelected && numNights
                                            ? roomType.averagePrice *
                                              roomQuantity *
                                              parseInt(numNights)
                                            : 0;

                                    return (
                                        <div
                                            key={roomType.roomTypeId}
                                            onClick={() =>
                                                handleRoomTypeSelect(
                                                    roomType.roomTypeId.toString(),
                                                )
                                            }
                                            className={`border-2 rounded-xl p-4 cursor-pointer transition-all ${
                                                isSelected
                                                    ? 'border-blue-500 bg-blue-50'
                                                    : 'border-gray-200 hover:border-gray-300'
                                            }`}
                                        >
                                            <div className="aspect-video bg-gray-100 rounded-lg mb-3 overflow-hidden">
                                                {roomType.sampleRoom
                                                    ?.coverImage ? (
                                                    <img
                                                        src={
                                                            roomType.sampleRoom
                                                                .coverImage
                                                        }
                                                        alt={
                                                            roomType.roomTypeName
                                                        }
                                                        className="w-full h-full object-cover"
                                                    />
                                                ) : (
                                                    <div className="w-full h-full flex items-center justify-center text-gray-400 text-sm">
                                                        No image
                                                    </div>
                                                )}
                                            </div>
                                            <h3 className="font-semibold text-gray-900 mb-2">
                                                {roomType.roomTypeName}
                                            </h3>
                                            <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                                                {roomType.roomTypeDescription ||
                                                    'No description available'}
                                            </p>
                                            <div className="flex items-center justify-between mb-3">
                                                <p className="text-lg font-bold text-gray-900">
                                                    {formatCurrency(
                                                        roomType.averagePrice,
                                                    )}
                                                    <span className="text-xs font-normal text-gray-500">
                                                        {' '}
                                                        /night
                                                    </span>
                                                </p>
                                                <div className="text-sm font-medium text-gray-700">
                                                    {roomType.availableCount}{' '}
                                                    available
                                                </div>
                                            </div>

                                            {isSelected && (
                                                <div className="mt-4 pt-4 border-t border-blue-200 space-y-3">
                                                    <div className="flex items-center justify-between">
                                                        <label className="text-sm font-medium text-gray-700">
                                                            Rooms
                                                        </label>
                                                        <div className="flex items-center gap-2">
                                                            <button
                                                                type="button"
                                                                onClick={(
                                                                    e,
                                                                ) => {
                                                                    e.stopPropagation();
                                                                    handleQuantityChange(
                                                                        Math.max(
                                                                            1,
                                                                            roomQuantity -
                                                                                1,
                                                                        ),
                                                                    );
                                                                }}
                                                                disabled={
                                                                    roomQuantity <=
                                                                    1
                                                                }
                                                                className="w-8 h-8 rounded bg-white border border-gray-300 text-gray-700 font-medium hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center text-sm"
                                                            >
                                                                -
                                                            </button>
                                                            <span className="text-sm font-semibold text-gray-900 w-8 text-center">
                                                                {roomQuantity}
                                                            </span>
                                                            <button
                                                                type="button"
                                                                onClick={(
                                                                    e,
                                                                ) => {
                                                                    e.stopPropagation();
                                                                    handleQuantityChange(
                                                                        Math.min(
                                                                            roomType.availableCount,
                                                                            roomQuantity +
                                                                                1,
                                                                        ),
                                                                    );
                                                                }}
                                                                disabled={
                                                                    roomQuantity >=
                                                                    roomType.availableCount
                                                                }
                                                                className="w-8 h-8 rounded bg-white border border-gray-300 text-gray-700 font-medium hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center text-sm"
                                                            >
                                                                +
                                                            </button>
                                                        </div>
                                                    </div>
                                                    <div className="flex items-center justify-between">
                                                        <label className="text-sm font-medium text-gray-700">
                                                            Total
                                                        </label>
                                                        <p className="text-xl font-bold text-gray-900">
                                                            {formatCurrency(
                                                                currentTotalPrice,
                                                            )}
                                                        </p>
                                                    </div>
                                                </div>
                                            )}

                                            {!isSelected && (
                                                <button
                                                    type="button"
                                                    className="w-full mt-3 py-2.5 px-4 rounded-lg text-sm font-medium transition-colors bg-blue-500 text-white hover:bg-blue-600"
                                                >
                                                    Select Room
                                                </button>
                                            )}
                                        </div>
                                    );
                                })}
                            </div>
                        )}

                        {errors.bookingDetails?.roomType?.message && (
                            <p className="text-red-500 text-sm mt-4">
                                {errors.bookingDetails.roomType.message}
                            </p>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
