'use client';

import React from 'react';
import { UseFormRegisterReturn } from 'react-hook-form';

interface BookingFormRadioProps {
    label: string;
    value: string;
    registration: UseFormRegisterReturn;
    id: string;
}

export default function BookingFormRadio({
    label,
    value,
    registration,
    id,
}: BookingFormRadioProps) {
    return (
        <div className="flex items-center gap-2">
            <div className="relative flex items-center">
                <input
                    type="radio"
                    id={id}
                    value={value}
                    {...registration}
                    className="peer appearance-none w-4 h-4 border border-[#EAECF0] rounded-full checked:border-orange-500 transition-all cursor-pointer"
                />
                <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-2 h-2 bg-orange-500 rounded-full scale-0 peer-checked:scale-100 transition-transform pointer-events-none" />
            </div>
            <label htmlFor={id} className="text-[11px] text-[#344054] cursor-pointer font-medium">
                {label}
            </label>
        </div>
    );
}
