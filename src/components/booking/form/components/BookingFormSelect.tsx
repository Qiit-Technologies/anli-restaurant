'use client';

import React, { useState, useRef, useEffect } from 'react';
import { UseFormRegisterReturn } from 'react-hook-form';
import { ChevronDown, Check } from 'lucide-react';

interface BookingFormSelectProps {
    label: string;
    options: { value: string; label: string }[];
    placeholder?: string;
    error?: string;
    registration: UseFormRegisterReturn;
    value?: string;
    className?: string;
    noBorder?: boolean;
}

export default function BookingFormSelect({
    label,
    options,
    placeholder = 'Select an option',
    error,
    registration,
    value,
    className = '',
    noBorder = false,
}: BookingFormSelectProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [selectedValue, setSelectedValue] = useState(value || '');
    const dropdownRef = useRef<HTMLDivElement>(null);

    // Sync with external value changes (e.g. form reset or defaultValues)
    useEffect(() => {
        if (value !== undefined && value !== selectedValue) {
            setSelectedValue(value);
        }
    }, [value]);

    const selectedOption = options.find((opt) => opt.value === selectedValue);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (
                dropdownRef.current &&
                !dropdownRef.current.contains(event.target as Node)
            ) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () =>
            document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleSelect = (option: { value: string; label: string }) => {
        setSelectedValue(option.value);
        setIsOpen(false);

        // Update react-hook-form
        const event = {
            target: {
                name: registration.name,
                value: option.value,
            },
        } as any;
        registration.onChange(event);
    };

    return (
        <div className="w-full relative" ref={dropdownRef}>
            <label className="block text-sm text-[#667085] mb-1 font-medium">
                {label}
            </label>

            <input type="hidden" {...registration} value={selectedValue} />

            <button
                type="button"
                onClick={() => setIsOpen(!isOpen)}
                className={`
                    w-full px-4 h-10 rounded-md text-sm transition-all
                    flex items-center justify-between bg-[#FAFAFA] text-left
                    focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-400
                    ${noBorder ? 'border-none' : error ? 'border-red-400 bg-red-50' : 'border-[#EAECF0] border'}
                    ${!selectedValue ? 'text-[#98A2B3]' : 'text-[#667085] font-medium'}
                    ${className}
                `}
            >
                <span>{selectedOption?.label || placeholder}</span>
                <ChevronDown
                    className={`w-4 h-4 text-[#667085] transition-transform ${isOpen ? 'rotate-180' : ''}`}
                />
            </button>

            {isOpen && (
                <div className="absolute z-50 left-0 right-0 mt-1 bg-white border border-[#EAECF0] rounded-md shadow-lg overflow-hidden">
                    <div className="max-h-60 overflow-y-auto">
                        {options.map((option) => (
                            <button
                                key={option.value}
                                type="button"
                                onClick={() => handleSelect(option)}
                                className={`
                                    w-full px-4 py-2 text-left text-sm flex items-center justify-between
                                    hover:bg-[#FAFAFA] transition-colors
                                    ${selectedValue === option.value ? 'bg-[#F0F7FF] text-[#007BFF]' : 'text-[#667085]'}
                                `}
                            >
                                <span>{option.label}</span>
                                {selectedValue === option.value && (
                                    <Check className="w-4 h-4" />
                                )}
                            </button>
                        ))}
                    </div>
                </div>
            )}
            {error && <p className="mt-1 text-[11px] text-red-500">{error}</p>}
        </div>
    );
}
