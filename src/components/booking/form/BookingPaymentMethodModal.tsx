'use client';

import React from 'react';
import { UseFormReturn } from 'react-hook-form';
import { Building2, CreditCard, Loader2 } from 'lucide-react';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import BookingPaymentMethod from '@/components/booking/form/BookingPaymentMethod';
import { BookingFormData } from './schemas';

interface BookingPaymentMethodModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    form: UseFormReturn<BookingFormData>;
    hotelId: string;
    totalAmount: number;
    formatCurrency: (amount: number) => string;
    onConfirm: () => void;
    isSubmitting: boolean;
}

export default function BookingPaymentMethodModal({
    open,
    onOpenChange,
    form,
    hotelId,
    totalAmount,
    formatCurrency,
    onConfirm,
    isSubmitting,
}: BookingPaymentMethodModalProps) {
    const paymentOption = form.watch('paymentMethod.paymentOption');

    const handleConfirm = async () => {
        const valid = await form.trigger([
            'paymentMethod.paymentOption',
            'paymentMethod.accountToPay',
        ]);
        if (valid) {
            onConfirm();
        }
    };

    return (
        <Dialog
            open={open}
            onOpenChange={(next) => {
                if (!isSubmitting) onOpenChange(next);
            }}
        >
            <DialogContent className="max-w-md w-[calc(100%-2rem)] p-0 gap-0 overflow-hidden border border-gray-200 sm:rounded-xl shadow-lg">
                <div className="px-6 pt-6 pb-4 border-b border-gray-100 bg-white">
                    <DialogHeader className="space-y-1.5 text-left">
                        <DialogTitle className="text-lg font-bold text-gray-900">
                            Choose payment method
                        </DialogTitle>
                        <DialogDescription className="text-sm text-gray-500">
                            Select how you would like to pay for your stay.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="mt-4 flex items-center justify-between rounded-lg bg-gray-50 border border-gray-200 px-4 py-3">
                        <span className="text-sm font-medium text-gray-600">
                            Total payable
                        </span>
                        <span className="text-lg font-bold text-orion-blue">
                            {formatCurrency(totalAmount)}
                        </span>
                    </div>
                </div>

                <div className="px-6 py-5 max-h-[min(52vh,420px)] overflow-y-auto bg-white">
                    <BookingPaymentMethod
                        form={form}
                        hotelId={hotelId}
                        totalAmount={totalAmount}
                        formatCurrency={formatCurrency}
                        showHeader={false}
                        compact
                    />
                </div>

                <div className="border-t border-gray-100 bg-gray-50 px-6 py-4 space-y-3">
                    {paymentOption === 'paystack' && (
                        <p className="text-xs text-gray-500 text-center leading-relaxed">
                            Paystack will open so you can pay with card, bank
                            transfer, or USSD.
                        </p>
                    )}

                    <button
                        type="button"
                        disabled={isSubmitting}
                        onClick={handleConfirm}
                        className="w-full h-11 bg-orion-blue hover:bg-orion-blue/90 disabled:opacity-60 text-white rounded-lg text-sm font-bold transition-all flex items-center justify-center gap-2"
                    >
                        {isSubmitting ? (
                            <>
                                <Loader2 className="w-4 h-4 animate-spin" />
                                Please wait…
                            </>
                        ) : paymentOption === 'paystack' ? (
                            <>
                                <CreditCard className="w-4 h-4" />
                                Continue to Paystack
                            </>
                        ) : (
                            'Confirm reservation'
                        )}
                    </button>

                    <button
                        type="button"
                        disabled={isSubmitting}
                        onClick={() => onOpenChange(false)}
                        className="w-full h-10 text-sm font-semibold text-gray-500 hover:text-gray-800 transition-colors"
                    >
                        Cancel
                    </button>
                </div>
            </DialogContent>
        </Dialog>
    );
}
