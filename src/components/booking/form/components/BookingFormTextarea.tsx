'use client';

import React from 'react';
import { UseFormRegisterReturn } from 'react-hook-form';

interface BookingFormTextareaProps {
    label: string;
    placeholder?: string;
    error?: string;
    registration: UseFormRegisterReturn;
    rows?: number;
    className?: string;
}

export default function BookingFormTextarea({
    label,
    placeholder,
    error,
    registration,
    rows = 4,
    className = '',
}: BookingFormTextareaProps) {
    return (
        <div className="w-full">
            <label className="block text-sm text-[#667085] mb-2 font-medium">{label}</label>
            <textarea
                placeholder={placeholder}
                {...registration}
                rows={rows}
                className={`
                    w-full px-4 py-3 border rounded-xl text-base transition-all
                    focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-400
                    placeholder:text-[#98A2B3] bg-[#F9FAFB] resize-none
                    ${error ? 'border-red-400 bg-red-50' : 'border-[#EAECF0]'}
                    ${className}
                `}
            />
            {error && <p className="mt-1 text-xs text-red-500">{error}</p>}
        </div>
    );
}
