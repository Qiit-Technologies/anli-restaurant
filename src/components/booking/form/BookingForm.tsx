'use client';

import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import BookingSuccessModal from './SuccessModal';
import BookingPaymentMethodModal from '@/components/booking/form/BookingPaymentMethodModal';
import {
    initializePublicBookingPaystack,
    verifyPublicBookingPaystack,
    createPublicBooking,
} from '@/app/actions/booking';
import BookingStepProgress from '@/components/booking/BookingStepProgress';
import { trackEvent } from '@/lib/mixpanel';
import toast from 'react-hot-toast';
import { bookingFormSchema, BookingFormData } from './schemas';
import dayjs from 'dayjs';
import { getRoomAvailabilityByDateRange } from '@/app/actions/room';
import {
    Calendar as CalendarIcon,
    Check,
    ChevronDown,
    Loader2,
    Sparkles,
    Star,
} from 'lucide-react';
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { DateRange } from 'react-day-picker';
import BookingGallery from '@/components/booking/BookingGallery';
import BookingPhoneInput from '@/components/booking/form/BookingPhoneInput';
import { openPublicBookingPaystackCheckout } from '@/components/booking/form/paystack-booking.utils';
import {
    formatBusinessType,
    formatHotelTime,
    getHotelDisplayAddress,
    getHotelFacilities,
    getHotelGalleryImages,
    getHotelLocationLabel,
    parseCommaSeparatedList,
    PUBLIC_BOOKING_CHECKOUT_TIME,
    type PublicBookingHotel,
} from '@/components/booking/hotel-info.utils';

const GUEST_OPTIONS = [
    { value: '1', label: '1' },
    { value: '2', label: '2' },
    { value: '3', label: '3' },
    { value: '4', label: '4' },
    { value: '5', label: '5' },
];

const CHILD_OPTIONS = [
    { value: '0', label: '0' },
    { value: '1', label: '1' },
    { value: '2', label: '2' },
    { value: '3', label: '3' },
];

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

export default function BookingForm({
    hotel,
    hotelId: propHotelId,
    roomCount = 0,
}: {
    hotel?: PublicBookingHotel;
    hotelId?: string;
    roomCount?: number;
}) {
    const hotelId = hotel?.id ? hotel.id.toString() : propHotelId || '';
    const galleryImages = getHotelGalleryImages(hotel);
    const facilities = getHotelFacilities(hotel);
    const tagHighlights = parseCommaSeparatedList(hotel?.tags);
    const locationLabel = getHotelLocationLabel(hotel);
    const businessTypeLabel = formatBusinessType(hotel?.businessType);
    const ratingValue = Number(hotel?.rating ?? 0);
    const ratingCount = Number(hotel?.ratingCount ?? 0);
    const hasRating = ratingCount > 0 && !Number.isNaN(ratingValue);

    const today = dayjs().format('YYYY-MM-DD');
    const tomorrow = dayjs().add(1, 'day').format('YYYY-MM-DD');

    const [submittedData, setSubmittedData] = useState<any>(null);
    const [bookingCode, setBookingCode] = useState<string>('');
    const [bookingCodes, setBookingCodes] = useState<string[]>([]);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [step, setStep] = useState<'booking' | 'details'>('booking');
    const [successMeta, setSuccessMeta] = useState<{
        paymentOption?: string;
        paymentPending?: boolean;
        cancellationToken?: string;
    } | null>(null);
    const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
    const [successBankAccount, setSuccessBankAccount] = useState<any>(null);

    const [availableRoomTypes, setAvailableRoomTypes] = useState<
        RoomTypeAvailability[]
    >([]);
    const [loadingAvailability, setLoadingAvailability] = useState(false);
    const [selectedRoomType, setSelectedRoomType] = useState<string>('');
    const [roomQuantity, setRoomQuantity] = useState<number>(1);

    const [adults, setAdults] = useState<string>('1');
    const [childrenCount, setChildrenCount] = useState<string>('0');

    // Date range picker state
    const [range, setRange] = useState<DateRange | undefined>({
        from: new Date(today),
        to: new Date(tomorrow),
    });

    const form = useForm<BookingFormData>({
        resolver: zodResolver(bookingFormSchema),
        mode: 'onChange',
        defaultValues: {
            customerDetails: {
                title: 'Mr.',
                firstName: '',
                lastName: '',
                email: '',
                phone: '',
                specialRequests: '',
            },
            bookingDetails: {
                startDate: today,
                endDate: tomorrow,
                reservationTime: '14:00', // Default check-in time
                roomType: '',
                numGuests: '1',
                numNights: '1',
            },
            paymentMethod: {
                paymentOption: 'paystack',
                accountToPay: '',
            },
        },
    });

    const {
        register,
        watch,
        setValue,
        trigger,
        control,
        formState: { errors },
    } = form;

    const startDate = watch('bookingDetails.startDate');
    const endDate = watch('bookingDetails.endDate');
    const numNights = watch('bookingDetails.numNights');
    const reservationTime = watch('bookingDetails.reservationTime');
    const checkInTimeLabel = formatHotelTime(reservationTime) ?? '2:00 PM';

    // Sync dates from range state to form
    useEffect(() => {
        if (range?.from) {
            setValue(
                'bookingDetails.startDate',
                dayjs(range.from).format('YYYY-MM-DD'),
                {
                    shouldValidate: true,
                },
            );
        } else {
            setValue('bookingDetails.startDate', '');
        }

        if (range?.to) {
            setValue(
                'bookingDetails.endDate',
                dayjs(range.to).format('YYYY-MM-DD'),
                {
                    shouldValidate: true,
                },
            );
        } else {
            setValue('bookingDetails.endDate', '');
        }
    }, [range, setValue]);

    // Calculate nights when dates change
    useEffect(() => {
        if (startDate && endDate) {
            const start = dayjs(startDate);
            const end = dayjs(endDate);
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

    // Fetch availability when dates change
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
    }, [hotelId, startDate, endDate, selectedRoomType, setValue]);

    // Sync numGuests with adults + childrenCount
    useEffect(() => {
        const totalGuests = parseInt(adults) + parseInt(childrenCount);
        setValue('bookingDetails.numGuests', totalGuests.toString(), {
            shouldValidate: true,
        });
    }, [adults, childrenCount, setValue]);

    const handleRoomTypeSelect = (roomTypeId: string) => {
        setSelectedRoomType(roomTypeId);
        setRoomQuantity(1);
        setValue('bookingDetails.roomType', roomTypeId, {
            shouldValidate: true,
        });
    };

    const handleQuantityChange = (quantity: number) => {
        if (quantity === 0) {
            setValue('bookingDetails.roomType', '', { shouldValidate: true });
            setSelectedRoomType('');
        } else {
            setRoomQuantity(quantity);
        }
    };

    const handleReserveNow = async () => {
        // Validate date and room selection
        const isBookingValid = await trigger([
            'bookingDetails.startDate',
            'bookingDetails.endDate',
            'bookingDetails.roomType',
        ]);

        const isPhoneValid = await trigger('customerDetails.phone');

        if (!isBookingValid || !isPhoneValid) {
            if (!watch('bookingDetails.roomType')) {
                toast.error('Please select a room type before reserving');
            } else if (!watch('customerDetails.phone')) {
                toast.error('Please enter your phone number to start');
            } else {
                toast.error('Please correct the validation errors in the form');
            }
            return;
        }

        // Move to the details step
        setStep('details');
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const buildBookingPayload = (data: BookingFormData) => ({
        ...data.customerDetails,
        ...data.bookingDetails,
        title: data.customerDetails.title,
        roomQuantity,
        totalCost: String(totalPrice),
        paymentOption: data.paymentMethod?.paymentOption || 'paystack',
    });

    const completeBookingSuccess = (
        data: BookingFormData,
        codes: string[],
        meta: {
            paymentOption?: string;
            paymentPending?: boolean;
            cancellationToken?: string;
        },
    ) => {
        setStep('booking');
        setSubmittedData(data);
        setBookingCodes(codes);
        setBookingCode(codes.join(', '));
        setSuccessMeta(meta);
    };

    const launchPaystackPayment = async (
        paystack: {
            authorization_url: string;
            access_code: string;
            reference: string;
        },
        email: string,
        bookingGroupId: string,
        formData: BookingFormData,
    ) => {
        await openPublicBookingPaystackCheckout({
            accessCode: paystack.access_code,
            authorizationUrl: paystack.authorization_url,
            reference: paystack.reference,
            email,
            onClose: () => {
                toast(
                    'Payment was not completed. No reservation was created.',
                    { icon: '⚠️' },
                );
            },
            onSuccess: async (reference) => {
                setIsSubmitting(true);
                const verify = await verifyPublicBookingPaystack(
                    reference,
                    bookingGroupId,
                );
                setIsSubmitting(false);
                if (verify.success) {
                    const codes = verify.data?.bookingCodes ?? [];
                    toast.success(
                        verify.message ||
                            'Payment confirmed! Your reservation is complete.',
                    );
                    completeBookingSuccess(formData, codes, {
                        paymentOption: 'paystack',
                        paymentPending: false,
                    });
                } else {
                    toast.error(
                        verify.message ||
                            'Payment verification failed. No reservation was created.',
                    );
                }
            },
        });
    };

    const handlePayWithPaystack = async () => {
        if (!hotelId) {
            toast.error('Hotel ID is missing');
            return;
        }

        const isValid = await trigger([
            'customerDetails.firstName',
            'customerDetails.lastName',
            'customerDetails.email',
            'customerDetails.phone',
            'bookingDetails.startDate',
            'bookingDetails.endDate',
            'bookingDetails.roomType',
        ]);

        if (!isValid) {
            toast.error('Please complete all required fields');
            return;
        }

        const data = form.getValues();
        setIsSubmitting(true);

        if (typeof window !== 'undefined') {
            sessionStorage.setItem(
                'publicBookingReturnPath',
                window.location.pathname,
            );
        }

        const init = await initializePublicBookingPaystack(
            {
                ...buildBookingPayload(data),
                returnPath: window.location.pathname,
            },
            hotelId,
        );

        if (
            !init.success ||
            !init.data?.paystack ||
            !init.data.bookingGroupId
        ) {
            setIsSubmitting(false);
            toast.error(init.message || 'Could not start payment');
            return;
        }

        setIsSubmitting(false);

        await launchPaystackPayment(
            init.data.paystack,
            data.customerDetails.email,
            init.data.bookingGroupId,
            data,
        );
    };

    const handlePayWithBankTransfer = async () => {
        if (!hotelId) {
            toast.error('Hotel ID is missing');
            return;
        }

        const data = form.getValues();
        setIsSubmitting(true);

        const payload = {
            ...buildBookingPayload(data),
            paymentOption: 'bank-transfer',
            bankAccountId: data.paymentMethod?.accountToPay
                ? Number(data.paymentMethod.accountToPay)
                : undefined,
        };

        const result = await createPublicBooking(payload, hotelId);
        setIsSubmitting(false);

        if (!result.success || !result.data) {
            toast.error(result.message || 'Failed to create booking');
            trackEvent('booking_failed', {
                hotel_id: hotelId,
                error: result.message || 'unknown',
            });
            return;
        }

        toast.success('Reservation created successfully!');
        setIsPaymentModalOpen(false);

        trackEvent('booking_created', {
            hotel_id: hotelId,
            booking_codes: result.data.bookingCodes || (result.data.bookingCode ? [result.data.bookingCode] : []),
            total_amount: result.data.totalBookingAmount,
            payment_option: 'bank-transfer',
            guest_name: `${data.firstName} ${data.lastName}`,
            guest_email: data.email,
            check_in: data.checkIn,
            check_out: data.checkOut,
            guests: data.adults + data.children,
        });

        const codes =
            result.data.bookingCodes ??
            (result.data.bookingCode ? [result.data.bookingCode] : []);
        completeBookingSuccess(data, codes, {
            paymentOption: 'bank-transfer',
            paymentPending: true,
            cancellationToken: result.data.cancellationToken,
        });
        setSuccessBankAccount(result.data.bankAccount ?? null);
    };

    const handleConfirmPayment = async () => {
        const data = form.getValues();
        const paymentOption = data.paymentMethod?.paymentOption;

        if (paymentOption === 'paystack') {
            setIsPaymentModalOpen(false);
            await handlePayWithPaystack();
        } else if (paymentOption === 'bank-transfer') {
            await handlePayWithBankTransfer();
        }
    };

    const handleProceedToPayment = async () => {
        const isValid = await trigger([
            'customerDetails.firstName',
            'customerDetails.lastName',
            'customerDetails.email',
            'customerDetails.phone',
            'bookingDetails.startDate',
            'bookingDetails.endDate',
            'bookingDetails.roomType',
        ]);

        if (!isValid) {
            toast.error('Please complete all required fields');
            return;
        }

        setIsPaymentModalOpen(true);
    };

    const handleReset = () => {
        setSelectedRoomType('');
        setRoomQuantity(1);
        setSubmittedData(null);
        setSuccessMeta(null);
        setSuccessBankAccount(null);
        setBookingCode('');
        setBookingCodes([]);
        setStep('booking');
        setRange({
            from: new Date(today),
            to: new Date(tomorrow),
        });
        form.reset();
    };

    const formatCurrency = (amount: number) => {
        return `₦${amount.toLocaleString()}`;
    };

    const formatDateRange = () => {
        if (!range?.from || !range?.to) return 'Select Dates';
        const startStr = dayjs(range.from).format('ddd, D MMM');
        const endStr = dayjs(range.to).format('ddd, D MMM');
        return `${startStr} - ${endStr}`;
    };

    // Calculate dynamic totals for selected room type
    const selectedRoomData = availableRoomTypes.find(
        (r) => r.roomTypeId.toString() === selectedRoomType,
    );
    const nightsCount = parseInt(numNights) || 0;
    const basePrice = selectedRoomData
        ? selectedRoomData.averagePrice * roomQuantity * nightsCount
        : 0;

    // Get applicable rates (use front office specific if available)
    const vatRate = hotel?.frontOfficeVatRate ?? hotel?.vatRate ?? 0;
    const serviceChargeRate =
        hotel?.frontOfficeServiceChargeRate ?? hotel?.serviceChargeRate ?? 0;
    // Exclude tips from total
    const tipRate = 0;
    const vatAmount = (basePrice * vatRate) / 100;
    const serviceChargeAmount = (basePrice * serviceChargeRate) / 100;
    const tipAmount = 0;
    const totalPrice = basePrice + vatAmount + serviceChargeAmount;

    const cardClass =
        'bg-white rounded-xl border border-slate-200/80 shadow-sm';
    const inputClass = (hasError: boolean) =>
        `w-full px-4 h-11 border rounded-lg text-sm bg-white text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-orion-blue/25 focus:border-orion-blue transition-shadow ${
            hasError
                ? 'border-red-400 bg-red-50/50'
                : 'border-slate-200 hover:border-slate-300'
        }`;

    return (
        <div className="w-full">
            <BookingStepProgress currentStep={step} />

            <BookingSuccessModal
                open={!!submittedData}
                onClose={handleReset}
                data={submittedData ?? undefined}
                confirmationNumber={bookingCode}
                confirmationNumbers={bookingCodes}
                paymentOption={successMeta?.paymentOption}
                paymentPending={successMeta?.paymentPending}
                bankAccount={successBankAccount}
                cancellationToken={successMeta?.cancellationToken}
            />

            <BookingPaymentMethodModal
                open={isPaymentModalOpen}
                onOpenChange={setIsPaymentModalOpen}
                form={form}
                hotelId={hotelId}
                totalAmount={totalPrice}
                formatCurrency={formatCurrency}
                onConfirm={handleConfirmPayment}
                isSubmitting={isSubmitting}
            />
            {step === 'booking' && (
                <div className="max-w-7xl mx-auto px-4 md:px-6">
                    <BookingGallery images={galleryImages} />
                    <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 lg:gap-8 items-start mt-6">
                        {/* Left Column: Info & Details */}
                        <div className="lg:col-span-3 space-y-6">
                            <div className={`${cardClass} p-6 md:p-8`}>
                                <h2 className="text-gray-900 text-lg md:text-xl font-bold mb-4">
                                    Information about{' '}
                                    {hotel?.name || 'the hotel'}
                                </h2>

                                {facilities.length > 0 && (
                                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 py-4 border-b border-gray-100 text-center">
                                        {facilities
                                            .slice(0, 8)
                                            .map((facility) => (
                                                <div
                                                    key={facility}
                                                    className="flex flex-col items-center gap-1.5"
                                                >
                                                    <div className="w-10 h-10 rounded-md bg-[#FAFAFA] border border-gray-100 flex items-center justify-center text-gray-500">
                                                        <Sparkles className="w-4 h-4 text-[#10B981]" />
                                                    </div>
                                                    <span className="text-[10px] md:text-xs text-gray-500 font-semibold uppercase tracking-wider line-clamp-2">
                                                        {facility}
                                                    </span>
                                                </div>
                                            ))}
                                    </div>
                                )}

                                {(businessTypeLabel ||
                                    roomCount > 0 ||
                                    locationLabel ||
                                    hotel?.displayHours) && (
                                    <div
                                        className={`bg-[#FAFAFA] border border-gray-100 rounded-md p-4 grid gap-4 text-center my-6 ${
                                            [
                                                businessTypeLabel,
                                                roomCount > 0,
                                                locationLabel,
                                                hotel?.displayHours,
                                            ].filter(Boolean).length >= 3
                                                ? 'grid-cols-2 md:grid-cols-4'
                                                : 'grid-cols-1 sm:grid-cols-2'
                                        }`}
                                    >
                                        {businessTypeLabel && (
                                            <div>
                                                <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">
                                                    Hotel Type
                                                </p>
                                                <p className="text-xs md:text-sm text-gray-700 font-bold mt-1 capitalize">
                                                    {businessTypeLabel}
                                                </p>
                                            </div>
                                        )}
                                        {roomCount > 0 && (
                                            <div>
                                                <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">
                                                    Number of Rooms
                                                </p>
                                                <p className="text-xs md:text-sm text-gray-700 font-bold mt-1">
                                                    {roomCount}
                                                </p>
                                            </div>
                                        )}
                                        {locationLabel && (
                                            <div>
                                                <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">
                                                    Location
                                                </p>
                                                <p className="text-xs md:text-sm text-gray-700 font-bold mt-1">
                                                    {locationLabel}
                                                </p>
                                            </div>
                                        )}
                                        {hotel?.displayHours && (
                                            <div>
                                                <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">
                                                    Hours
                                                </p>
                                                <p className="text-xs md:text-sm text-gray-700 font-bold mt-1">
                                                    {hotel.displayHours}
                                                </p>
                                            </div>
                                        )}
                                    </div>
                                )}

                                {hasRating && (
                                    <div className="flex items-center gap-2 py-4 border-b border-gray-100 text-xs md:text-sm text-gray-500">
                                        <Star className="w-4 h-4 text-amber-400 fill-amber-400 shrink-0" />
                                        <span>
                                            <strong className="font-semibold text-gray-700">
                                                {ratingValue.toFixed(1)}
                                            </strong>{' '}
                                            · {ratingCount} guest rating
                                            {ratingCount !== 1 ? 's' : ''}
                                        </span>
                                    </div>
                                )}

                                <div className="py-6 space-y-4 text-sm text-gray-600 leading-relaxed font-normal">
                                    {getHotelDisplayAddress(hotel) && (
                                        <p>
                                            {hotel?.name || 'This hotel'} is
                                            located at{' '}
                                            {getHotelDisplayAddress(hotel)}.
                                        </p>
                                    )}
                                    {roomCount > 0 && (
                                        <p>
                                            This property has {roomCount} room
                                            {roomCount !== 1 ? 's' : ''} in
                                            total.
                                        </p>
                                    )}
                                    {facilities.length > 0 && (
                                        <p>
                                            Facilities include:{' '}
                                            {facilities.join(', ')}.
                                        </p>
                                    )}
                                    {tagHighlights.length > 0 && (
                                        <div className="pt-2">
                                            <h4 className="font-semibold text-gray-800 mb-2">
                                                Highlights
                                            </h4>
                                            <ul className="list-disc pl-5 space-y-1.5 text-gray-500">
                                                {tagHighlights.map((tag) => (
                                                    <li key={tag}>{tag}</li>
                                                ))}
                                            </ul>
                                        </div>
                                    )}
                                </div>

                                <div className="pt-6 border-t border-gray-100">
                                    <h3 className="font-bold text-gray-800 text-sm md:text-base mb-3">
                                        {hotel?.name || 'Hotel'} policy
                                    </h3>
                                    <div className="flex items-center gap-2 text-sm text-gray-600 mb-3">
                                        <span className="font-semibold text-gray-700">
                                            Check-out:
                                        </span>
                                        <span>
                                            {PUBLIC_BOOKING_CHECKOUT_TIME}
                                        </span>
                                    </div>
                                    {hotel?.reservationTermsHtml && (
                                        <div
                                            className="prose prose-sm max-w-none text-gray-600"
                                            dangerouslySetInnerHTML={{
                                                __html: hotel.reservationTermsHtml,
                                            }}
                                        />
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Right Column: Unified Card with form, summary and rooms */}
                        <div className="lg:col-span-2 lg:sticky lg:top-6">
                            <div
                                className={`${cardClass} overflow-hidden flex flex-col ring-1 ring-slate-900/5`}
                            >
                                {/* Section 1: Check In - Check Out & Guests Selection */}
                                <div className="p-4 md:p-6 space-y-4">
                                    <div className="grid grid-cols-1 md:grid-cols-5 gap-3 items-end">
                                        {/* Date Range Picker Box */}
                                        <div className="md:col-span-3">
                                            <label className="block text-xs text-gray-600 font-semibold mb-1">
                                                Check In - Check Out
                                            </label>
                                            <Popover>
                                                <PopoverTrigger asChild>
                                                    <button
                                                        type="button"
                                                        className="w-full h-10 border border-gray-300 rounded-md px-3 bg-white hover:border-gray-400 transition-all flex items-center gap-2 text-left text-sm text-gray-700 font-medium focus:outline-none"
                                                    >
                                                        <CalendarIcon className="w-4 h-4 text-gray-400 shrink-0" />
                                                        <span>
                                                            {formatDateRange()}
                                                        </span>
                                                    </button>
                                                </PopoverTrigger>
                                                <PopoverContent
                                                    className="w-auto p-0"
                                                    align="start"
                                                >
                                                    <Calendar
                                                        initialFocus
                                                        mode="range"
                                                        defaultMonth={
                                                            range?.from
                                                        }
                                                        selected={range}
                                                        onSelect={setRange}
                                                        numberOfMonths={1}
                                                    />
                                                </PopoverContent>
                                            </Popover>
                                        </div>

                                        {/* Adults */}
                                        <div className="md:col-span-1">
                                            <label className="block text-xs text-gray-600 font-semibold mb-1">
                                                Adults
                                            </label>
                                            <div className="relative">
                                                <select
                                                    value={adults}
                                                    onChange={(e) =>
                                                        setAdults(
                                                            e.target.value,
                                                        )
                                                    }
                                                    className="w-full h-10 border border-gray-300 rounded-md px-3 pr-8 bg-white text-sm text-gray-750 font-semibold focus:outline-none appearance-none cursor-pointer"
                                                >
                                                    {GUEST_OPTIONS.map(
                                                        (opt) => (
                                                            <option
                                                                key={opt.value}
                                                                value={
                                                                    opt.value
                                                                }
                                                            >
                                                                {opt.label}
                                                            </option>
                                                        ),
                                                    )}
                                                </select>
                                                <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                                            </div>
                                        </div>

                                        {/* Children */}
                                        <div className="md:col-span-1">
                                            <label className="block text-xs text-gray-600 font-semibold mb-1">
                                                Children
                                            </label>
                                            <div className="relative">
                                                <select
                                                    value={childrenCount}
                                                    onChange={(e) =>
                                                        setChildrenCount(
                                                            e.target.value,
                                                        )
                                                    }
                                                    className="w-full h-10 border border-gray-300 rounded-md px-3 pr-8 bg-white text-sm text-gray-750 font-semibold focus:outline-none appearance-none cursor-pointer"
                                                >
                                                    {CHILD_OPTIONS.map(
                                                        (opt) => (
                                                            <option
                                                                key={opt.value}
                                                                value={
                                                                    opt.value
                                                                }
                                                            >
                                                                {opt.label}
                                                            </option>
                                                        ),
                                                    )}
                                                </select>
                                                <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Divider Line */}
                                <div className="border-b border-gray-200" />

                                {/* Section 2: Phone number and Reserve Button */}
                                <div className="p-4 md:p-6 space-y-4">
                                    <div>
                                        <label className="block text-xs text-gray-650 font-medium mb-2">
                                            Enter your phone number to start the
                                            booking process
                                        </label>
                                        <BookingPhoneInput
                                            control={control}
                                            name="customerDetails.phone"
                                            error={
                                                errors.customerDetails?.phone
                                                    ?.message
                                            }
                                        />
                                    </div>

                                    {/* Blue Reserve Button */}
                                    <button
                                        type="button"
                                        onClick={handleReserveNow}
                                        className="w-full h-12 bg-orion-blue hover:bg-[#0066d6] text-white rounded-xl text-sm font-bold shadow-lg shadow-orion-blue/25 transition-all flex items-center justify-center tracking-wide"
                                    >
                                        Continue to your details
                                    </button>
                                </div>

                                {/* Divider Line */}
                                <div className="border-b border-gray-200" />

                                {/* Section 3: Summary details */}
                                <div className="bg-white py-4 px-6">
                                    <p className="text-sm text-gray-800 font-semibold text-center">
                                        {selectedRoomType ? roomQuantity : 0}{' '}
                                        Rooms, {nightsCount} Night
                                    </p>

                                    {/* Breakdown */}
                                    {selectedRoomType && (
                                        <div className="mt-3 space-y-2 text-sm">
                                            <div className="flex justify-between">
                                                <span className="text-gray-600">
                                                    Room Total
                                                </span>
                                                <span className="text-gray-800 font-medium">
                                                    {formatCurrency(basePrice)}
                                                </span>
                                            </div>
                                            {vatRate > 0 && (
                                                <div className="flex justify-between">
                                                    <span className="text-gray-600">
                                                        VAT ({vatRate}%)
                                                    </span>
                                                    <span className="text-gray-800 font-medium">
                                                        {formatCurrency(
                                                            vatAmount,
                                                        )}
                                                    </span>
                                                </div>
                                            )}
                                            {serviceChargeRate > 0 && (
                                                <div className="flex justify-between">
                                                    <span className="text-gray-600">
                                                        Service Charge (
                                                        {serviceChargeRate}%)
                                                    </span>
                                                    <span className="text-gray-800 font-medium">
                                                        {formatCurrency(
                                                            serviceChargeAmount,
                                                        )}
                                                    </span>
                                                </div>
                                            )}
                                            <div className="border-t border-gray-200 pt-2 mt-2 flex justify-between">
                                                <span className="text-gray-800 font-bold">
                                                    Total Price
                                                </span>
                                                <span className="text-orion-blue font-extrabold">
                                                    {formatCurrency(totalPrice)}
                                                </span>
                                            </div>
                                        </div>
                                    )}
                                </div>

                                {/* Divider Line */}
                                <div className="border-b border-gray-200" />

                                {/* Section 4: Available Room types inside the card */}
                                <div className="divide-y divide-gray-200 bg-white">
                                    {!startDate || !endDate ? (
                                        <div className="p-6 text-center">
                                            <p className="text-gray-400 text-xs">
                                                Select check-in & check-out
                                                dates to load rooms
                                            </p>
                                        </div>
                                    ) : loadingAvailability ? (
                                        <div className="p-6 flex flex-col items-center justify-center gap-2 text-center">
                                            <Loader2 className="w-6 h-6 animate-spin text-orion-blue" />
                                            <p className="text-gray-400 text-xs">
                                                Checking availability...
                                            </p>
                                        </div>
                                    ) : availableRoomTypes.length === 0 ? (
                                        <div className="p-6 text-center">
                                            <p className="text-red-500 text-xs font-semibold">
                                                No rooms available for the
                                                selected dates
                                            </p>
                                        </div>
                                    ) : (
                                        availableRoomTypes.map((roomType) => {
                                            const isSelected =
                                                selectedRoomType ===
                                                roomType.roomTypeId.toString();

                                            return (
                                                <div
                                                    key={roomType.roomTypeId}
                                                    className="p-4 flex gap-4 items-center bg-white"
                                                >
                                                    {/* Room image on Left */}
                                                    <div className="relative w-20 h-20 bg-gray-150 rounded-md overflow-hidden shrink-0">
                                                        {roomType.sampleRoom
                                                            ?.coverImage ? (
                                                            <img
                                                                src={
                                                                    roomType
                                                                        .sampleRoom
                                                                        .coverImage
                                                                }
                                                                alt={
                                                                    roomType.roomTypeName
                                                                }
                                                                className="w-full h-full object-cover"
                                                            />
                                                        ) : (
                                                            <div className="w-full h-full flex items-center justify-center text-gray-400 text-[10px]">
                                                                No image
                                                            </div>
                                                        )}
                                                    </div>

                                                    {/* Details Middle */}
                                                    <div className="flex-1 min-w-0 flex flex-col justify-between h-20 py-0.5">
                                                        <div>
                                                            <h5 className="font-bold text-gray-800 text-sm truncate">
                                                                {
                                                                    roomType.roomTypeName
                                                                }
                                                            </h5>
                                                            <p className="text-gray-900 font-extrabold text-sm mt-1">
                                                                {formatCurrency(
                                                                    roomType.averagePrice,
                                                                )}
                                                                <span className="text-[10px] text-gray-450 font-normal ml-1">
                                                                    avg/night
                                                                </span>
                                                            </p>
                                                            <p className="text-[11px] text-gray-600 font-medium mt-0.5">
                                                                {
                                                                    roomType.availableCount
                                                                }{' '}
                                                                {roomType.availableCount ===
                                                                1
                                                                    ? 'room'
                                                                    : 'rooms'}{' '}
                                                                available
                                                            </p>
                                                        </div>
                                                        <div className="flex items-center gap-1 text-[10px] text-[#10B981] font-semibold">
                                                            <Check className="w-3.5 h-3.5" />
                                                            <span>
                                                                Free
                                                                cancellation
                                                            </span>
                                                        </div>
                                                    </div>

                                                    {/* Action Right */}
                                                    <div className="flex flex-col items-end justify-center shrink-0 self-center">
                                                        {!isSelected ? (
                                                            <button
                                                                type="button"
                                                                onClick={() =>
                                                                    handleRoomTypeSelect(
                                                                        roomType.roomTypeId.toString(),
                                                                    )
                                                                }
                                                                className="px-4 py-2 border border-orion-blue text-orion-blue hover:bg-orion-blue/10 rounded-md text-xs font-bold transition-all shrink-0"
                                                            >
                                                                Add Room
                                                            </button>
                                                        ) : (
                                                            <div className="flex flex-col items-center gap-1">
                                                                <div className="flex items-center gap-1.5">
                                                                    <button
                                                                        type="button"
                                                                        onClick={() =>
                                                                            handleQuantityChange(
                                                                                Math.max(
                                                                                    0,
                                                                                    roomQuantity -
                                                                                        1,
                                                                                ),
                                                                            )
                                                                        }
                                                                        className="w-7 h-7 rounded-md bg-orion-blue hover:bg-orion-blue/90 text-white font-bold flex items-center justify-center text-sm transition-all"
                                                                    >
                                                                        -
                                                                    </button>
                                                                    <span className="w-8 h-7 flex items-center justify-center border border-orion-blue text-orion-blue rounded-md font-bold text-xs bg-white">
                                                                        {
                                                                            roomQuantity
                                                                        }
                                                                    </span>
                                                                    <button
                                                                        type="button"
                                                                        onClick={() =>
                                                                            handleQuantityChange(
                                                                                Math.min(
                                                                                    roomType.availableCount,
                                                                                    roomQuantity +
                                                                                        1,
                                                                                ),
                                                                            )
                                                                        }
                                                                        className="w-7 h-7 rounded-md bg-orion-blue hover:bg-orion-blue/90 text-white font-bold flex items-center justify-center text-sm transition-all"
                                                                    >
                                                                        +
                                                                    </button>
                                                                </div>
                                                                <span className="text-[10px] text-gray-500 font-medium text-center">
                                                                    {
                                                                        roomQuantity
                                                                    }{' '}
                                                                    of{' '}
                                                                    {
                                                                        roomType.availableCount
                                                                    }{' '}
                                                                    selected
                                                                </span>
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            );
                                        })
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {step === 'details' && (
                <div className="max-w-7xl mx-auto px-4 md:px-6 pb-8">
                    <div className="flex items-center gap-3 mb-6">
                        <button
                            type="button"
                            onClick={() => setStep('booking')}
                            className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-orion-blue font-semibold transition-colors rounded-lg px-2 py-1 -ml-2 hover:bg-gray-50"
                        >
                            <svg
                                className="w-4 h-4"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="2.5"
                            >
                                <path d="M15 18l-6-6 6-6" />
                            </svg>
                            Back to room selection
                        </button>
                    </div>

                    <div className="flex items-start gap-3 bg-orion-blue/5 border border-orion-blue/20 rounded-xl px-5 py-4 mb-8">
                        <div className="w-9 h-9 bg-orion-blue/10 rounded-full flex items-center justify-center shrink-0">
                            <Sparkles className="w-4 h-4 text-orion-blue" />
                        </div>
                        <div>
                            <p className="text-sm font-bold text-gray-900">
                                Almost there
                            </p>
                            <p className="text-sm text-gray-600 mt-0.5 leading-relaxed">
                                Enter your details and pay with Paystack to
                                confirm your reservation. Your booking is only
                                created after payment succeeds.
                            </p>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 lg:gap-8 items-start">
                        <div
                            className={`lg:col-span-3 ${cardClass} p-6 md:p-8 space-y-6`}
                        >
                            <div>
                                <h3 className="text-gray-900 font-bold text-xl tracking-tight">
                                    Guest details
                                </h3>
                                <p className="text-sm text-slate-500 mt-1">
                                    We&apos;ll send your confirmation to the
                                    email below.
                                </p>
                            </div>

                            {/* Title + First + Last */}
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div>
                                    <label className="block text-xs text-slate-600 font-semibold mb-1.5">
                                        Title
                                    </label>
                                    <div className="relative">
                                        <select
                                            className="w-full h-11 border border-slate-200 rounded-lg px-3 pr-8 bg-white text-sm text-slate-800 font-medium focus:outline-none focus:ring-2 focus:ring-orion-blue/25 focus:border-orion-blue appearance-none"
                                            {...register(
                                                'customerDetails.title',
                                            )}
                                        >
                                            <option value="Mr.">Mr.</option>
                                            <option value="Mrs.">Mrs.</option>
                                            <option value="Ms.">Ms.</option>
                                            <option value="Miss">Miss</option>
                                            <option value="Dr.">Dr.</option>
                                            <option value="Prof.">Prof.</option>
                                        </select>
                                        <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-xs text-slate-600 font-semibold mb-1.5">
                                        First name *
                                    </label>
                                    <input
                                        type="text"
                                        placeholder="e.g. John"
                                        className={inputClass(
                                            !!errors.customerDetails?.firstName,
                                        )}
                                        {...register(
                                            'customerDetails.firstName',
                                        )}
                                    />
                                    {errors.customerDetails?.firstName && (
                                        <p className="mt-1 text-[10px] text-red-500">
                                            {
                                                errors.customerDetails.firstName
                                                    .message
                                            }
                                        </p>
                                    )}
                                </div>
                                <div>
                                    <label className="block text-xs text-slate-600 font-semibold mb-1.5">
                                        Last name *
                                    </label>
                                    <input
                                        type="text"
                                        placeholder="e.g. Doe"
                                        className={inputClass(
                                            !!errors.customerDetails?.lastName,
                                        )}
                                        {...register(
                                            'customerDetails.lastName',
                                        )}
                                    />
                                    {errors.customerDetails?.lastName && (
                                        <p className="mt-1 text-[10px] text-red-500">
                                            {
                                                errors.customerDetails.lastName
                                                    .message
                                            }
                                        </p>
                                    )}
                                </div>
                            </div>

                            {/* Phone + Email */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs text-slate-600 font-semibold mb-1.5">
                                        Phone *
                                    </label>
                                    <BookingPhoneInput
                                        control={control}
                                        name="customerDetails.phone"
                                        error={
                                            errors.customerDetails?.phone
                                                ?.message
                                        }
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs text-slate-600 font-semibold mb-1.5">
                                        Email address *
                                    </label>
                                    <input
                                        type="email"
                                        placeholder="john.doe@example.com"
                                        className={inputClass(
                                            !!errors.customerDetails?.email,
                                        )}
                                        {...register('customerDetails.email')}
                                    />
                                    {errors.customerDetails?.email && (
                                        <p className="mt-1 text-[10px] text-red-500">
                                            {
                                                errors.customerDetails.email
                                                    .message
                                            }
                                        </p>
                                    )}
                                    <p className="text-[10px] text-gray-400 mt-1">
                                        Booking ID will be sent to this email
                                    </p>
                                </div>
                            </div>

                            {/* On behalf */}
                            <label className="flex items-center gap-2 cursor-pointer">
                                <input
                                    type="checkbox"
                                    className="w-4 h-4 rounded border-gray-300 accent-orion-blue"
                                />
                                <span className="text-xs text-gray-600 font-medium">
                                    I&apos;m making this reservation on behalf
                                    of someone else
                                </span>
                            </label>

                            {/* Special Requests */}
                            <div>
                                <label className="block text-xs text-slate-600 font-semibold mb-1.5">
                                    Special requests (optional)
                                </label>
                                <textarea
                                    rows={3}
                                    placeholder="Early check-in, dietary needs, accessibility, etc."
                                    className="w-full px-4 py-3 border border-slate-200 rounded-lg text-sm bg-white text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-orion-blue/25 focus:border-orion-blue resize-none"
                                    {...register(
                                        'customerDetails.specialRequests',
                                    )}
                                />
                            </div>

                            <button
                                type="button"
                                disabled={isSubmitting}
                                onClick={handleProceedToPayment}
                                className="w-full h-12 bg-orion-blue hover:bg-orion-blue/90 disabled:opacity-60 text-white rounded-xl text-sm font-bold shadow-md shadow-orion-blue/20 transition-all flex items-center justify-center gap-2"
                            >
                                {isSubmitting ? (
                                    <>
                                        <Loader2 className="w-4 h-4 animate-spin" />
                                        Please wait…
                                    </>
                                ) : (
                                    <>
                                        <span>Proceed to payment</span>
                                        <svg
                                            className="w-4 h-4"
                                            viewBox="0 0 24 24"
                                            fill="none"
                                            stroke="currentColor"
                                            strokeWidth="2.5"
                                        >
                                            <path d="M5 12h14M12 5l7 7-7 7" />
                                        </svg>
                                    </>
                                )}
                            </button>
                            <p className="text-[11px] text-center text-gray-500">
                                Total {formatCurrency(totalPrice)} — choose your
                                payment method next
                            </p>

                            <p className="text-[11px] text-slate-500 bg-slate-50 border border-slate-100 rounded-lg p-3 leading-relaxed">
                                We use your personal data to process services
                                that you have applied for, to contact you with
                                newsletters and deal offers, and for
                                personalised content and ads. You consent to our{' '}
                                <span className="underline cursor-pointer">
                                    Data Policy
                                </span>{' '}
                                if you click above.
                            </p>
                        </div>

                        <div className="lg:col-span-2 lg:sticky lg:top-6 space-y-4">
                            <div
                                className={`${cardClass} overflow-hidden ring-1 ring-slate-900/5`}
                            >
                                {hotel?.coverImage ? (
                                    <div className="relative w-full h-40 md:h-48 bg-gray-100">
                                        <img
                                            src={hotel.coverImage}
                                            alt={hotel?.name || 'Hotel'}
                                            className="w-full h-full object-cover"
                                        />
                                    </div>
                                ) : null}
                                <div className="p-4 border-b border-gray-100">
                                    <p className="text-orion-blue font-bold text-sm">
                                        {hotel?.name || 'Hotel'}
                                    </p>
                                    {getHotelDisplayAddress(hotel) && (
                                        <p className="text-gray-500 text-xs mt-1 leading-snug">
                                            {getHotelDisplayAddress(hotel)}
                                        </p>
                                    )}
                                </div>

                                {/* Check-in / Check-out */}
                                <div className="p-4 grid grid-cols-3 items-center border-b border-gray-100 text-center">
                                    <div className="text-left">
                                        <p className="text-orion-blue font-bold text-xs mb-1">
                                            Check in
                                        </p>
                                        <div className="flex items-center gap-1 text-xs text-gray-700 font-semibold">
                                            <CalendarIcon className="w-3 h-3 text-gray-400" />
                                            <span>
                                                {startDate
                                                    ? dayjs(startDate).format(
                                                          'DD/MM/YYYY',
                                                      )
                                                    : '—'}
                                            </span>
                                        </div>
                                        <div className="flex items-center gap-1 text-xs text-gray-500 mt-0.5">
                                            <svg
                                                className="w-3 h-3 text-gray-400"
                                                viewBox="0 0 24 24"
                                                fill="none"
                                                stroke="currentColor"
                                                strokeWidth="2"
                                            >
                                                <circle
                                                    cx="12"
                                                    cy="12"
                                                    r="10"
                                                />
                                                <path d="M12 6v6l4 2" />
                                            </svg>
                                            <span>{checkInTimeLabel}</span>
                                        </div>
                                    </div>
                                    <div className="text-center text-[10px] text-gray-400 font-medium">
                                        — {nightsCount} Night
                                        {nightsCount !== 1 ? 's' : ''} —
                                    </div>
                                    <div className="text-right">
                                        <p className="text-orion-blue font-bold text-xs mb-1">
                                            Check out
                                        </p>
                                        <div className="flex items-center justify-end gap-1 text-xs text-gray-700 font-semibold">
                                            <CalendarIcon className="w-3 h-3 text-gray-400" />
                                            <span>
                                                {endDate
                                                    ? dayjs(endDate).format(
                                                          'DD/MM/YYYY',
                                                      )
                                                    : '—'}
                                            </span>
                                        </div>
                                        <div className="flex items-center justify-end gap-1 text-xs text-gray-500 mt-0.5">
                                            <svg
                                                className="w-3 h-3 text-gray-400"
                                                viewBox="0 0 24 24"
                                                fill="none"
                                                stroke="currentColor"
                                                strokeWidth="2"
                                            >
                                                <circle
                                                    cx="12"
                                                    cy="12"
                                                    r="10"
                                                />
                                                <path d="M12 6v6l4 2" />
                                            </svg>
                                            <span>
                                                {PUBLIC_BOOKING_CHECKOUT_TIME}
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                {/* Rooms / Nights / Guests pill row */}
                                <div className="px-4 py-3 flex items-center justify-between border-b border-gray-100">
                                    <div className="flex items-center gap-3 text-xs text-gray-600 font-semibold">
                                        <span>
                                            • {roomQuantity} Room
                                            {roomQuantity !== 1 ? 's' : ''}
                                        </span>
                                        <span>
                                            • {nightsCount} Night
                                            {nightsCount !== 1 ? 's' : ''}
                                        </span>
                                        <span>
                                            •{' '}
                                            {parseInt(adults) +
                                                parseInt(childrenCount)}{' '}
                                            Guest
                                            {parseInt(adults) +
                                                parseInt(childrenCount) !==
                                            1
                                                ? 's'
                                                : ''}
                                        </span>
                                    </div>
                                    <button
                                        type="button"
                                        onClick={() => setStep('booking')}
                                        className="text-xs border border-gray-300 rounded-md px-3 py-1 text-gray-600 font-semibold hover:bg-gray-50 transition-all"
                                    >
                                        Change
                                    </button>
                                </div>

                                {/* Selected room line */}
                                {selectedRoomData && (
                                    <div className="px-4 py-3 flex items-center justify-between border-b border-gray-100">
                                        <p className="text-xs text-gray-700 font-semibold">
                                            {roomQuantity} ×{' '}
                                            {selectedRoomData.roomTypeName}
                                        </p>
                                        <p className="text-xs text-gray-800 font-bold">
                                            {formatCurrency(
                                                selectedRoomData.averagePrice *
                                                    roomQuantity *
                                                    nightsCount,
                                            )}
                                        </p>
                                    </div>
                                )}

                                {/* Total */}
                                <div className="px-4 py-4 bg-gray-50 flex items-center justify-between">
                                    <p className="text-sm text-gray-700 font-semibold">
                                        Total Payable Amount
                                    </p>
                                    <p className="text-base font-extrabold text-orion-blue">
                                        {formatCurrency(totalPrice)}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
