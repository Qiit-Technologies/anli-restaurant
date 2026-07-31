'use client';

import React from 'react';
import PhoneInput from 'react-phone-input-2';
import 'react-phone-input-2/lib/style.css';
import { Control, Controller, FieldPath } from 'react-hook-form';
import { BookingFormData } from './schemas';

type BookingPhoneInputProps = {
    control: Control<BookingFormData>;
    name: FieldPath<BookingFormData>;
    error?: string;
    placeholder?: string;
};

export default function BookingPhoneInput({
    control,
    name,
    error,
    placeholder = 'Phone number',
}: BookingPhoneInputProps) {
    return (
        <div>
            <Controller
                control={control}
                name={name}
                render={({ field }) => {
                    const phoneValue =
                        typeof field.value === 'string' ? field.value : '';
                    return (
                    <PhoneInput
                        country="ng"
                        enableSearch
                        countryCodeEditable={false}
                        value={phoneValue.replace(/\D/g, '')}
                        onChange={(value) => {
                            field.onChange(value ? `+${value}` : '');
                        }}
                        placeholder={placeholder}
                        inputProps={{
                            name: field.name,
                            required: true,
                        }}
                        inputStyle={{
                            width: '100%',
                            height: '40px',
                            fontSize: '14px',
                            borderColor: error ? '#f87171' : '#EAECF0',
                            backgroundColor: error ? '#fef2f2' : '#FAFAFA',
                            borderRadius: '6px',
                            paddingLeft: '48px',
                        }}
                        buttonStyle={{
                            borderColor: error ? '#f87171' : '#EAECF0',
                            backgroundColor: '#FAFAFA',
                            borderRadius: '6px 0 0 6px',
                        }}
                        dropdownStyle={{
                            zIndex: 50,
                        }}
                    />
                    );
                }}
            />
            {error && (
                <p className="mt-1 text-[10px] text-red-500">{error}</p>
            )}
        </div>
    );
}
