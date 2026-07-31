'use client';

import React from 'react';
import { UseFormRegisterReturn } from 'react-hook-form';

interface BookingFormInputProps {
    label: string;
    type?: 'text' | 'email' | 'tel' | 'date' | 'time' | 'number';
    placeholder?: string;
    error?: string;
    registration: UseFormRegisterReturn;
    className?: string;
    noBorder?: boolean;
    disabled?: boolean;
}

export default function BookingFormInput({
    label,
    type = 'text',
    placeholder,
    error,
    registration,
    className = '',
    noBorder = false,
    disabled = false,
}: BookingFormInputProps) {
    return (
        <div className="w-full">
            <label className="block text-sm text-[#667085] mb-1 font-medium">{label}</label>
            <input
                type={type}
                placeholder={placeholder}
                {...registration}
                disabled={disabled}
                className={`
                    w-full px-4 h-10 rounded-md text-sm transition-all appearance-none
                    focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-400
                    placeholder:text-[#98A2B3] bg-[#FAFAFA] text-[#667085] font-medium
                    ${noBorder ? 'border-none' : error ? 'border-red-400 bg-red-50' : 'border-[#EAECF0] border'}
                    ${className}
                `}
            />
            {error && <p className="mt-1 text-[11px] text-red-500">{error}</p>}
        </div>
    );
}
