'use client';

import React from 'react';
import { UseFormReturn } from 'react-hook-form';
import { BookingFormData } from '../schemas';

interface BookingSummaryFormProps {
    form: UseFormReturn<BookingFormData, any, any>;
}

export default function BookingSummaryForm({
    form,
}: BookingSummaryFormProps) {
    const { getValues } = form;
    const data = getValues();

    return (
        <div className="space-y-3">
            {/* Green Note */}
            <div className="bg-[#F6FFF9] border border-[#E8F5EE] rounded-lg p-1.5 text-center mb-1">
                <p className="text-[#066812] text-[10px] font-medium leading-none">
                    Note: A down payment of 10% of the selected room will be made to book your reservation
                </p>
            </div>

            {/* Contact Information */}
            <div className="space-y-3">
                <h3 className="text-sm font-medium text-[#98A2B3]">Contact Information</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    <div>
                        <p className="text-[10px] text-[#98A2B3] font-medium">First Name</p>
                        <p className="text-xs text-[#101828] font-bold mt-0.5">{data.customerDetails.firstName || 'Uju'}</p>
                    </div>
                    <div>
                        <p className="text-[10px] text-[#98A2B3] font-medium">Last Name</p>
                        <p className="text-xs text-[#101828] font-bold mt-0.5">{data.customerDetails.lastName || 'Abubakar'}</p>
                    </div>
                    <div>
                        <p className="text-[10px] text-[#98A2B3] font-medium">Contact Phone Number</p>
                        <p className="text-xs text-[#101828] font-bold mt-0.5">{data.customerDetails.phone || '(+234) 802 345 0003'}</p>
                    </div>
                    <div>
                        <p className="text-[10px] text-[#98A2B3] font-medium">Contact Email Address</p>
                        <p className="text-xs text-[#101828] font-bold mt-0.5">{data.customerDetails.email || 'Uju.A@xyzmfb.com'}</p>
                    </div>
                </div>
            </div>

            {/* Special Requests */}
            <div className="space-y-1">
                <p className="text-[10px] text-[#98A2B3] font-medium uppercase tracking-wider">Special requests</p>
                <p className="text-xs text-[#101828] font-medium leading-tight break-all">
                    {data.customerDetails.specialRequests || '-'}
                </p>
            </div>

            {/* RSV Date & time */}
            <div className="space-y-3 pt-1">
                <h3 className="text-sm font-medium text-[#98A2B3]">RSV Date & time</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    <div>
                        <p className="text-[10px] text-[#98A2B3] font-medium">Room Type</p>
                        <p className="text-xs text-[#101828] font-bold mt-0.5">{data.bookingDetails.roomType || 'Room-302'}</p>
                    </div>
                    <div>
                        <p className="text-[10px] text-[#98A2B3] font-medium">Start Date</p>
                        <p className="text-xs text-[#101828] font-bold mt-0.5">{data.bookingDetails.startDate || '23/04/24'}</p>
                    </div>
                    <div>
                        <p className="text-[10px] text-[#98A2B3] font-medium">End Date</p>
                        <p className="text-xs text-[#101828] font-bold mt-1">{data.bookingDetails.endDate || '25/04/24'}</p>
                    </div>
                    <div>
                        <p className="text-[10px] text-[#98A2B3] font-medium">Reservation Time</p>
                        <p className="text-xs text-[#101828] font-bold mt-1">{data.bookingDetails.reservationTime || '2:30 Pm'}</p>
                    </div>
                </div>
            </div>
        </div>
    );
}
