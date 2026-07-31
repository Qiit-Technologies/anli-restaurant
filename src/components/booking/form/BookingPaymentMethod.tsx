'use client';

import React, { useEffect, useState } from 'react';
import { Controller, UseFormReturn } from 'react-hook-form';
import {
    Building2,
    ChevronDown,
    ChevronUp,
    CreditCard,
    Landmark,
    Loader2,
} from 'lucide-react';
import { getPublicBankAccounts, BankAccount } from '@/app/actions/bank-accounts';
import { BookingFormData } from './schemas';

interface BookingPaymentMethodProps {
    form: UseFormReturn<BookingFormData>;
    hotelId: string;
    totalAmount: number;
    formatCurrency: (amount: number) => string;
    showHeader?: boolean;
    compact?: boolean;
}

export default function BookingPaymentMethod({
    form,
    hotelId,
    totalAmount,
    formatCurrency,
    showHeader = true,
    compact = false,
}: BookingPaymentMethodProps) {
    const [isBankTransferOpen, setIsBankTransferOpen] = useState(false);
    const [bankAccounts, setBankAccounts] = useState<BankAccount[]>([]);
    const [isLoadingBanks, setIsLoadingBanks] = useState(false);

    const {
        control,
        watch,
        setValue,
        formState: { errors },
    } = form;

    const selectedAccount = watch('paymentMethod.accountToPay');
    const paymentOption = watch('paymentMethod.paymentOption');

    useEffect(() => {
        if (!hotelId) return;

        const fetchBanks = async () => {
            setIsLoadingBanks(true);
            try {
                const response = await getPublicBankAccounts(hotelId);
                if (Array.isArray(response)) {
                    setBankAccounts(response);
                }
            } catch (error) {
                console.error('Failed to fetch bank accounts:', error);
            } finally {
                setIsLoadingBanks(false);
            }
        };

        fetchBanks();
    }, [hotelId]);

    const getSelectedAccountLabel = () => {
        const account = bankAccounts.find(
            (acc) => String(acc.id) === selectedAccount,
        );
        return account
            ? `${account.bankName} (${account.accountNumber})`
            : 'Bank Transfer';
    };

    const handleBankAccountSelect = (accountValue: string) => {
        setValue('paymentMethod.accountToPay', accountValue, {
            shouldValidate: true,
        });
        setValue('paymentMethod.paymentOption', 'bank-transfer', {
            shouldValidate: true,
        });
        setIsBankTransferOpen(false);
    };

    const handlePaymentOptionSelect = (
        optionValue: 'paystack' | 'bank-transfer',
        fieldOnChange: (value: string) => void,
    ) => {
        if (optionValue === 'bank-transfer') {
            setIsBankTransferOpen(!isBankTransferOpen);
            fieldOnChange(optionValue);
        } else {
            fieldOnChange(optionValue);
            setValue('paymentMethod.accountToPay', '');
            setIsBankTransferOpen(false);
        }
    };

    const optionClass = (active: boolean) =>
        `flex items-center justify-between ${compact ? 'p-3.5 min-h-[3.25rem]' : 'p-4 min-h-[3.5rem]'} rounded-xl border cursor-pointer transition-all duration-200 ${
            active
                ? 'border-orion-blue bg-orion-blue/5 shadow-sm ring-1 ring-orion-blue/20'
                : 'border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50/50'
        }`;

    const radioClass = (active: boolean) =>
        `w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 ${
            active ? 'border-orion-blue' : 'border-[#D0D5DD]'
        }`;

    return (
        <div className={`space-y-3 ${showHeader ? 'pt-2 border-t border-gray-100' : ''}`}>
            {showHeader && (
                <>
                    <h4 className="text-gray-900 font-bold text-sm">
                        Payment method
                    </h4>
                    <p className="text-xs text-gray-500 -mt-2">
                        Total payable:{' '}
                        <span className="font-bold text-orion-blue">
                            {formatCurrency(totalAmount)}
                        </span>
                    </p>
                </>
            )}

            <Controller
                name="paymentMethod.paymentOption"
                control={control}
                render={({ field }) => (
                    <div className="space-y-2.5">
                        <div
                            className={optionClass(field.value === 'paystack')}
                            onClick={() =>
                                handlePaymentOptionSelect(
                                    'paystack',
                                    field.onChange,
                                )
                            }
                        >
                            <div className="flex items-center gap-3">
                                <CreditCard className="w-4 h-4 text-orion-blue" />
                                <div>
                                    <span className="text-sm font-semibold text-[#344054] block">
                                        Pay with Paystack
                                    </span>
                                    <span className="text-[10px] text-gray-500">
                                        Card, bank transfer, or USSD
                                    </span>
                                </div>
                            </div>
                            <div className={radioClass(field.value === 'paystack')}>
                                {field.value === 'paystack' && (
                                    <div className="w-2.5 h-2.5 rounded-full bg-orion-blue" />
                                )}
                            </div>
                        </div>

                        <div>
                            <div
                                className={optionClass(
                                    field.value === 'bank-transfer',
                                )}
                                onClick={() =>
                                    handlePaymentOptionSelect(
                                        'bank-transfer',
                                        field.onChange,
                                    )
                                }
                            >
                                <div className="flex items-center gap-3">
                                    <Landmark className="w-4 h-4 text-orion-blue shrink-0" />
                                    <span className="text-sm font-semibold text-[#344054]">
                                        {selectedAccount &&
                                        field.value === 'bank-transfer'
                                            ? getSelectedAccountLabel()
                                            : 'Bank transfer'}
                                    </span>
                                </div>
                                {isBankTransferOpen ? (
                                    <ChevronUp className="w-5 h-5 text-[#667085]" />
                                ) : (
                                    <ChevronDown className="w-5 h-5 text-[#667085]" />
                                )}
                            </div>

                            {isBankTransferOpen && (
                                <div className="mt-2 p-3 bg-white border border-[#EAECF0] rounded-md space-y-2 max-h-[200px] overflow-y-auto">
                                    {isLoadingBanks ? (
                                        <div className="flex items-center justify-center py-4">
                                            <Loader2 className="w-5 h-5 animate-spin text-orion-blue" />
                                        </div>
                                    ) : bankAccounts.length > 0 ? (
                                        bankAccounts.map((account) => (
                                            <div
                                                key={account.id}
                                                className={`p-3 cursor-pointer rounded-md transition-all ${
                                                    selectedAccount ===
                                                    String(account.id)
                                                        ? 'bg-orion-blue/5 border border-orion-blue'
                                                        : 'hover:bg-[#FAFAFA] border border-transparent'
                                                }`}
                                                onClick={() =>
                                                    handleBankAccountSelect(
                                                        String(account.id),
                                                    )
                                                }
                                            >
                                                <span className="text-sm font-semibold text-[#344054] block">
                                                    {account.bankName}
                                                </span>
                                                <span className="text-xs text-[#667085]">
                                                    {account.accountNumber} —{' '}
                                                    {account.accountName}
                                                </span>
                                            </div>
                                        ))
                                    ) : (
                                        <p className="text-sm text-center py-2 text-[#667085]">
                                            No bank accounts configured for this
                                            hotel.
                                        </p>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>
                )}
            />

            {errors.paymentMethod?.paymentOption && (
                <p className="text-xs text-red-500">
                    {errors.paymentMethod.paymentOption.message}
                </p>
            )}
            {errors.paymentMethod?.accountToPay && (
                <p className="text-xs text-red-500">
                    {errors.paymentMethod.accountToPay.message}
                </p>
            )}

            {showHeader && paymentOption === 'bank-transfer' && (
                <p className="text-[10px] text-gray-500 leading-relaxed bg-amber-50 border border-amber-100 rounded-lg p-3">
                    Transfer the total amount to the selected account. Your
                    reservation is confirmed once payment is verified by the
                    hotel.
                </p>
            )}
            {showHeader && paymentOption === 'paystack' && (
                <p className="text-[10px] text-gray-500 leading-relaxed bg-orion-blue/5 border border-orion-blue/20 rounded-lg p-3">
                    You will complete payment securely via Paystack after
                    confirming your details.
                </p>
            )}
        </div>
    );
}
