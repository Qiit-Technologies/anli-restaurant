'use client';

import React from 'react';
import { Control, Controller } from 'react-hook-form';
import { Calendar as CalendarIcon } from 'lucide-react';
import { format } from 'date-fns';
import { Calendar } from '@/components/ui/calendar';
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from '@/components/ui/popover';
import { cn } from '@/lib/utils';

interface BookingFormDatePickerProps {
    label: string;
    name: string;
    control: Control<any>;
    placeholder?: string;
    error?: string;
    className?: string;
    noBorder?: boolean;
}

export default function BookingFormDatePicker({
    label,
    name,
    control,
    placeholder = 'Select date',
    error,
    className = '',
    noBorder = false,
}: BookingFormDatePickerProps) {
    return (
        <div className="w-full">
            <label className="block text-sm text-[#667085] mb-1 font-medium">{label}</label>
            <Controller
                name={name}
                control={control}
                render={({ field }) => (
                    <Popover>
                        <PopoverTrigger asChild>
                            <button
                                type="button"
                                className={cn(
                                    'w-full px-4 h-10 rounded-md text-sm transition-all text-left flex items-center relative bg-[#FAFAFA]',
                                    'pl-10',
                                    noBorder ? 'border-none' : error ? 'border-red-400 bg-red-50' : 'border-[#EAECF0] border',
                                    !field.value && 'text-[#98A2B3]',
                                    field.value && 'text-[#667085] font-medium',
                                    'focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-400',
                                    className,
                                )}
                            >
                                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-[#667085] z-10">
                                    <CalendarIcon className="w-4 h-4" />
                                </div>
                                <span>
                                    {field.value
                                        ? format(new Date(field.value), 'PPP')
                                        : placeholder}
                                </span>
                            </button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                            <Calendar
                                mode="single"
                                selected={field.value ? new Date(field.value) : undefined}
                                onSelect={(date) => {
                                    if (date) {
                                        const year = date.getFullYear();
                                        const month = String(date.getMonth() + 1).padStart(2, '0');
                                        const day = String(date.getDate()).padStart(2, '0');
                                        field.onChange(`${year}-${month}-${day}`);
                                    }
                                }}
                                initialFocus
                            />
                        </PopoverContent>
                    </Popover>
                )}
            />
            {error && <p className="mt-1 text-[11px] text-red-500">{error}</p>}
        </div>
    );
}
