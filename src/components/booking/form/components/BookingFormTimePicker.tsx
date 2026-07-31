'use client';

import React from 'react';
import { Control, Controller } from 'react-hook-form';
import { Clock } from 'lucide-react';
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from '@/components/ui/popover';
import { cn } from '@/lib/utils';
import { ScrollArea } from '@/components/ui/scroll-area';

interface BookingFormTimePickerProps {
    label: string;
    name: string;
    control: Control<any>;
    placeholder?: string;
    error?: string;
    className?: string;
    noBorder?: boolean;
}

export default function BookingFormTimePicker({
    label,
    name,
    control,
    placeholder = 'Select time',
    error,
    className = '',
    noBorder = false,
}: BookingFormTimePickerProps) {
    const hours = Array.from({ length: 12 }, (_, i) => i + 1);
    const minutes = Array.from({ length: 60 }, (_, i) => i);
    const periods = ['AM', 'PM'];

    return (
        <div className="w-full">
            <label className="block text-sm text-[#667085] mb-1 font-medium">{label}</label>
            <Controller
                name={name}
                control={control}
                render={({ field }) => {
                    const [currentHour, rest] = field.value ? field.value.split(':') : ['12', '00 AM'];
                    const [currentMinute, currentPeriod] = rest ? rest.split(' ') : ['00', 'AM'];

                    const updateTime = (h: string, m: string, p: string) => {
                        field.onChange(`${h}:${m} ${p}`);
                    };

                    return (
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
                                        <Clock className="w-4 h-4" />
                                    </div>
                                    <span>{field.value || placeholder}</span>
                                </button>
                            </PopoverTrigger>
                            <PopoverContent className="w-[280px] p-0" align="start">
                                <div className="flex h-64">
                                    <div className="flex-1 flex flex-col border-r">
                                        <div className="p-2 text-center text-[10px] font-bold text-gray-400 bg-gray-50 uppercase tracking-wider">Hour</div>
                                        <ScrollArea className="flex-1">
                                            {hours.map((h) => {
                                                const hStr = h.toString().padStart(2, '0');
                                                return (
                                                    <button
                                                        key={h}
                                                        type="button"
                                                        className={cn(
                                                            'w-full px-2 py-2 text-sm hover:bg-gray-100 transition-colors text-center',
                                                            currentHour === hStr && 'bg-blue-50 text-[#007BFF] font-bold'
                                                        )}
                                                        onClick={() => updateTime(hStr, currentMinute, currentPeriod)}
                                                    >
                                                        {hStr}
                                                    </button>
                                                );
                                            })}
                                        </ScrollArea>
                                    </div>
                                    <div className="flex-1 flex flex-col border-r">
                                        <div className="p-2 text-center text-[10px] font-bold text-gray-400 bg-gray-50 uppercase tracking-wider">Min</div>
                                        <ScrollArea className="flex-1">
                                            {minutes.map((m) => {
                                                const mStr = m.toString().padStart(2, '0');
                                                return (
                                                    <button
                                                        key={m}
                                                        type="button"
                                                        className={cn(
                                                            'w-full px-2 py-2 text-sm hover:bg-gray-100 transition-colors text-center',
                                                            currentMinute === mStr && 'bg-blue-50 text-[#007BFF] font-bold'
                                                        )}
                                                        onClick={() => updateTime(currentHour, mStr, currentPeriod)}
                                                    >
                                                        {mStr}
                                                    </button>
                                                );
                                            })}
                                        </ScrollArea>
                                    </div>
                                    <div className="flex-1 flex flex-col">
                                        <div className="p-2 text-center text-[10px] font-bold text-gray-400 bg-gray-50 uppercase tracking-wider">AM/PM</div>
                                        <div className="flex-1 flex flex-col justify-center">
                                            {periods.map((p) => (
                                                <button
                                                    key={p}
                                                    type="button"
                                                    className={cn(
                                                        'w-full px-2 py-4 text-sm hover:bg-gray-100 transition-colors text-center font-medium',
                                                        currentPeriod === p && 'bg-blue-50 text-[#007BFF] font-bold'
                                                    )}
                                                    onClick={() => updateTime(currentHour, currentMinute, p)}
                                                >
                                                    {p}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </PopoverContent>
                        </Popover>
                    );
                }}
            />
            {error && <p className="mt-1 text-[11px] text-red-500">{error}</p>}
        </div>
    );
}
