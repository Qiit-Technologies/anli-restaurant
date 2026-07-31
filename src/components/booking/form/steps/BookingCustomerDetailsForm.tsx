'use client';

import React from 'react';
import { UseFormReturn } from 'react-hook-form';
import { BookingFormInput, BookingFormTextarea } from '../components';
import { BookingFormData } from '../schemas';

interface BookingCustomerDetailsFormProps {
    form: UseFormReturn<BookingFormData, any, any>;
}

export default function BookingCustomerDetailsForm({
    form,
}: BookingCustomerDetailsFormProps) {
    const {
        register,
        formState: { errors },
    } = form;

    return (
        <div className="space-y-4 md:space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                <BookingFormInput
                    label="First name."
                    placeholder="Enter First name"
                    error={errors.customerDetails?.firstName?.message}
                    registration={register('customerDetails.firstName')}
                />
                <BookingFormInput
                    label="Last name."
                    placeholder="Enter Last name"
                    error={errors.customerDetails?.lastName?.message}
                    registration={register('customerDetails.lastName')}
                />
            </div>

            <BookingFormInput
                label="Email Address"
                type="email"
                placeholder="Enter Email Address"
                error={errors.customerDetails?.email?.message}
                registration={register('customerDetails.email')}
            />

            <BookingFormInput
                label="Phone Number"
                type="tel"
                placeholder="+234 000"
                error={errors.customerDetails?.phone?.message}
                registration={register('customerDetails.phone')}
            />

            <BookingFormTextarea
                label="Special requests (Optional)"
                placeholder="Any special request......"
                rows={3}
                error={errors.customerDetails?.specialRequests?.message}
                registration={register('customerDetails.specialRequests')}
            />
        </div>
    );
}
