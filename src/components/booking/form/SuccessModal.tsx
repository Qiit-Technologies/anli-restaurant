'use client';

import React from 'react';
import { Check, Calendar, Clock, Users, User, Mail, Phone, Upload, Loader2 } from 'lucide-react';
import dayjs from 'dayjs';
import {
    Dialog,
    DialogContent,
    DialogTitle,
} from '@/components/ui/dialog';
import useImageUpload from '@/hooks/useImageUpload';
import { uploadPublicReceipt } from '@/app/actions/booking';
import toast from 'react-hot-toast';

type BankAccountSummary = {
    bankName: string;
    accountName: string;
    accountNumber: string;
};

interface BookingSuccessModalProps {
    open: boolean;
    onClose: () => void;
    data?: any;
    confirmationNumber?: string;
    confirmationNumbers?: string[];
    paymentOption?: string;
    bankAccount?: BankAccountSummary | null;
    paymentPending?: boolean;
    cancellationToken?: string;
}

export default function BookingSuccessModal({
    open,
    onClose,
    data,
    confirmationNumber = '',
    confirmationNumbers = [],
    paymentOption,
    bankAccount,
    paymentPending,
    cancellationToken,
}: BookingSuccessModalProps) {
    const [receiptUrl, setReceiptUrl] = React.useState<string | null>(null);
    const [isSubmittingReceipt, setIsSubmittingReceipt] = React.useState(false);
    const { uploadImage, isLoading: isUploading } = useImageUpload();

    React.useEffect(() => {
        if (!open) {
            setReceiptUrl(null);
        }
    }, [open]);

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        const uploadedUrl = await uploadImage(file);
        if (uploadedUrl && cancellationToken) {
            setReceiptUrl(uploadedUrl);
            setIsSubmittingReceipt(true);
            const res = await uploadPublicReceipt(cancellationToken, uploadedUrl);
            setIsSubmittingReceipt(false);
            if (res.success) {
                toast.success('Proof of payment receipt uploaded successfully!');
            } else {
                toast.error(res.message || 'Failed to register receipt with reservation');
            }
        }
    };

    const bookingDetails = data?.bookingDetails || {};
    const customerDetails = data?.customerDetails || {};
    const codes =
        confirmationNumbers.length > 0
            ? confirmationNumbers
            : confirmationNumber
              ? confirmationNumber
                    .split(',')
                    .map((code) => code.trim())
                    .filter(Boolean)
              : [];

    const formattedDate = bookingDetails.startDate
        ? dayjs(bookingDetails.startDate).format('dddd, MMMM D, YYYY')
        : 'N/A';

    return (
        <Dialog
            open={open}
            onOpenChange={(isOpen) => {
                if (!isOpen) onClose();
            }}
        >
            <DialogContent className="max-w-lg w-[calc(100%-2rem)] max-h-[90vh] overflow-y-auto p-0 gap-0 border-0 sm:rounded-xl focus:outline-none">
                <DialogTitle className="sr-only">
                    Reservation confirmed
                </DialogTitle>

                <div className="w-full flex flex-col p-6 md:p-8">
                    <div className="flex flex-col items-center pb-4">
                        <div className="w-16 h-16 bg-[#D1FAE5] rounded-full flex items-center justify-center mb-4">
                            <div className="w-12 h-12 bg-[#10B981] rounded-full flex items-center justify-center">
                                <Check
                                    className="text-white w-7 h-7"
                                    strokeWidth={3}
                                />
                            </div>
                        </div>
                        <h2 className="text-2xl font-bold text-[#101828] mb-1">
                            Reservation Confirmed!
                        </h2>
                        <p className="text-[#667085] text-sm text-center">
                            Your reservation has been successfully created
                        </p>
                    </div>

                    <div className="mb-5">
                        <div className="bg-[#F2F4F7] rounded-xl py-3 px-4 flex flex-col items-center justify-center max-w-md mx-auto w-full">
                            <span className="text-[10px] font-medium text-[#667085] uppercase tracking-wider mb-1">
                                {codes.length > 1
                                    ? 'Confirmation Numbers'
                                    : 'Confirmation Number'}
                            </span>
                            {codes.length > 1 ? (
                                <ul className="text-sm font-bold text-[#101828] text-center space-y-1">
                                    {codes.map((code) => (
                                        <li key={code}>{code}</li>
                                    ))}
                                </ul>
                            ) : (
                                <span className="text-lg font-bold text-[#101828]">
                                    {codes[0] || confirmationNumber}
                                </span>
                            )}
                        </div>
                    </div>

                    <div className="mb-5 space-y-3">
                        {paymentOption === 'bank-transfer' && bankAccount && (
                            <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 text-left">
                                <p className="text-[10px] font-bold uppercase text-amber-800 mb-2">
                                    Bank transfer details
                                </p>
                                <p className="text-xs text-gray-800">
                                    <span className="font-semibold">Bank:</span>{' '}
                                    {bankAccount.bankName}
                                </p>
                                <p className="text-xs text-gray-800 mt-1">
                                    <span className="font-semibold">Account:</span>{' '}
                                    {bankAccount.accountNumber}
                                </p>
                                <p className="text-xs text-gray-800 mt-1">
                                    <span className="font-semibold">Name:</span>{' '}
                                    {bankAccount.accountName}
                                </p>
                            </div>
                        )}

                        {paymentOption === 'bank-transfer' && cancellationToken && (
                            <div className="bg-slate-50 border border-slate-200 rounded-lg p-4 text-left">
                                <p className="text-[10px] font-bold uppercase text-slate-800 mb-2">
                                    Upload proof of payment
                                </p>
                                
                                {receiptUrl ? (
                                    <div className="space-y-3">
                                        <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-lg flex items-center justify-between">
                                            <div className="flex items-center gap-2">
                                                <div className="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600">
                                                    <Check className="w-4 h-4" />
                                                </div>
                                                <div>
                                                    <p className="text-xs font-bold text-emerald-800">
                                                        Receipt Uploaded Successfully
                                                    </p>
                                                    <p className="text-[10px] text-emerald-600">
                                                        The hotel staff will verify and approve your booking.
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="relative aspect-video w-full overflow-hidden rounded-lg border border-slate-200 bg-white">
                                            <img
                                                src={receiptUrl}
                                                alt="Receipt preview"
                                                className="object-contain w-full h-full"
                                            />
                                        </div>
                                        <button
                                            type="button"
                                            onClick={() => setReceiptUrl(null)}
                                            className="text-xs text-blue-600 hover:text-blue-700 font-semibold"
                                        >
                                            Upload a different file
                                        </button>
                                    </div>
                                ) : (
                                    <div className="flex flex-col items-center justify-center p-6 border-2 border-dashed border-slate-300 rounded-lg bg-white hover:bg-slate-50 transition-colors relative cursor-pointer group">
                                        <input
                                            type="file"
                                            accept="image/*"
                                            onChange={handleFileChange}
                                            disabled={isUploading || isSubmittingReceipt}
                                            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                                        />
                                        {isUploading || isSubmittingReceipt ? (
                                            <div className="flex flex-col items-center gap-2">
                                                <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
                                                <p className="text-xs text-slate-500 font-medium">
                                                    {isUploading ? 'Uploading image...' : 'Saving reservation receipt...'}
                                                </p>
                                            </div>
                                        ) : (
                                            <div className="flex flex-col items-center gap-2 text-center">
                                                <Upload className="w-8 h-8 text-slate-400 group-hover:text-blue-500 transition-colors" />
                                                <div>
                                                    <p className="text-xs font-bold text-slate-700">
                                                        Select payment receipt/screenshot
                                                    </p>
                                                    <p className="text-[10px] text-slate-500 mt-0.5">
                                                        Supports JPEG, PNG (Max 5MB)
                                                    </p>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                        )}

                        <div className="bg-[#EFF6FF] border border-[#DBEAFE] rounded-lg p-3">
                            <p className="text-[#1E40AF] text-[11px] md:text-xs leading-relaxed">
                                <span className="font-bold">Important:</span>{' '}
                                {paymentOption === 'paystack' && paymentPending
                                    ? 'Your reservation is held. Complete payment via Paystack to receive your confirmation email.'
                                    : paymentOption === 'paystack'
                                      ? 'Payment received via Paystack. A confirmation email has been sent to'
                                      : paymentOption === 'bank-transfer'
                                        ? 'Your reservation is pending until the hotel confirms your transfer. Details were sent to'
                                        : 'A confirmation email has been sent to'}{' '}
                                {!(
                                    paymentOption === 'paystack' &&
                                    paymentPending
                                ) && (
                                    <span className="font-semibold text-[#2563EB]">
                                        {customerDetails.email || 'your email'}
                                    </span>
                                )}
                                {paymentOption !== 'paystack' ||
                                !paymentPending
                                    ? '. Please arrive 10 minutes before your reservation time.'
                                    : '.'}
                            </p>
                        </div>
                    </div>

                    <div className="space-y-4 mb-4">
                        <div className="bg-[#F9FAFB] rounded-xl p-4">
                            <h3 className="text-[10px] font-semibold text-[#344054] mb-3 uppercase tracking-wider">
                                Reservation Details
                            </h3>
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                                <div className="flex items-start gap-2.5">
                                    <div className="p-1.5 bg-white rounded-lg shadow-sm shrink-0">
                                        <Calendar className="w-3.5 h-3.5 text-[#98A2B3]" />
                                    </div>
                                    <div>
                                        <p className="text-[9px] text-[#98A2B3] font-medium uppercase">
                                            Date
                                        </p>
                                        <p className="text-[11px] text-[#101828] font-bold mt-0.5">
                                            {formattedDate}
                                        </p>
                                    </div>
                                </div>
                                <div className="flex items-start gap-2.5">
                                    <div className="p-1.5 bg-white rounded-lg shadow-sm shrink-0">
                                        <Clock className="w-3.5 h-3.5 text-[#98A2B3]" />
                                    </div>
                                    <div>
                                        <p className="text-[9px] text-[#98A2B3] font-medium uppercase">
                                            Time
                                        </p>
                                        <p className="text-[11px] text-[#101828] font-bold mt-0.5">
                                            {bookingDetails.reservationTime ||
                                                'N/A'}
                                        </p>
                                    </div>
                                </div>
                                <div className="flex items-start gap-2.5">
                                    <div className="p-1.5 bg-white rounded-lg shadow-sm shrink-0">
                                        <Users className="w-3.5 h-3.5 text-[#98A2B3]" />
                                    </div>
                                    <div>
                                        <p className="text-[9px] text-[#98A2B3] font-medium uppercase">
                                            Guests
                                        </p>
                                        <p className="text-[11px] text-[#101828] font-bold mt-0.5">
                                            {bookingDetails.numGuests || '1'}{' '}
                                            Guests
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="bg-[#F9FAFB] rounded-xl p-4">
                            <h3 className="text-[10px] font-semibold text-[#344054] mb-3 uppercase tracking-wider">
                                Customer Information
                            </h3>
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                                <div className="flex items-start gap-2.5">
                                    <div className="p-1.5 bg-white rounded-lg shadow-sm shrink-0">
                                        <User className="w-3.5 h-3.5 text-[#98A2B3]" />
                                    </div>
                                    <div className="min-w-0">
                                        <p className="text-[9px] text-[#98A2B3] font-medium uppercase">
                                            Full Name
                                        </p>
                                        <p className="text-[11px] text-[#101828] font-bold mt-0.5 truncate">
                                            {customerDetails.firstName}{' '}
                                            {customerDetails.lastName}
                                        </p>
                                    </div>
                                </div>
                                <div className="flex items-start gap-2.5">
                                    <div className="p-1.5 bg-white rounded-lg shadow-sm shrink-0">
                                        <Mail className="w-3.5 h-3.5 text-[#98A2B3]" />
                                    </div>
                                    <div className="min-w-0">
                                        <p className="text-[9px] text-[#98A2B3] font-medium uppercase">
                                            Email
                                        </p>
                                        <p className="text-[11px] text-[#101828] font-bold mt-0.5 truncate">
                                            {customerDetails.email}
                                        </p>
                                    </div>
                                </div>
                                <div className="flex items-start gap-2.5">
                                    <div className="p-1.5 bg-white rounded-lg shadow-sm shrink-0">
                                        <Phone className="w-3.5 h-3.5 text-[#98A2B3]" />
                                    </div>
                                    <div>
                                        <p className="text-[9px] text-[#98A2B3] font-medium uppercase">
                                            Phone
                                        </p>
                                        <p className="text-[11px] text-[#101828] font-bold mt-0.5">
                                            {customerDetails.phone}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="pt-4 border-t border-gray-100 flex flex-col sm:flex-row items-center justify-between gap-3">
                        <button
                            type="button"
                            onClick={onClose}
                            className="w-full sm:w-auto px-10 py-2.5 bg-[#F2F4F7] text-[#344054] rounded-lg text-sm font-bold transition-all hover:bg-gray-200"
                        >
                            Close
                        </button>
                        <button
                            type="button"
                            onClick={onClose}
                            className="w-full sm:w-auto px-10 py-2.5 bg-orion-blue text-white rounded-lg text-sm font-bold shadow-lg shadow-blue-100 transition-all hover:bg-orion-blue/90 active:scale-95"
                        >
                            Make Another Reservation
                        </button>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}
