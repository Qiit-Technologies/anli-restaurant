'use client';

import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import toast from 'react-hot-toast';
import { customerAuthService } from '@/services/customerAuth.service';
import { createPublicBooking } from '@/app/actions/booking';
import Image from 'next/image';

const STEPS = [
    { id: 1, label: 'Customer Details' },
    { id: 2, label: 'RSVP Date & time' },
    { id: 3, label: 'Payment method' },
];

const TABLE_TYPE_OPTIONS = [
    { value: 'single', label: 'Single table' },
    { value: '6', label: '6 tables' },
    { value: '8', label: '8 tables' },
    { value: 'others', label: 'Others' },
];

const RESERVATION_TYPE_OPTIONS = [
    { value: 'Single Reservation', label: 'Single Reservation' },
    { value: 'Group Reservation', label: 'Group Reservation' },
    { value: 'Business Reservation', label: 'Business Reservation' },
];

const FOOD_TYPE_OPTIONS = [
    { value: 'continental', label: 'Continental' },
    { value: 'african', label: 'African' },
    { value: 'asian', label: 'Asian' },
];

interface ReservationFormProps {
    hotelId?: string;
}

export default function ReservationForm({ hotelId }: ReservationFormProps) {
    const [currentStep, setCurrentStep] = useState(1);
    const [showSuccessModal, setShowSuccessModal] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const form = useForm({
        resolver: zodResolver({
            customerDetails: {
                firstName: { required: 'First name is required' },
                lastName: { required: 'Last name is required' },
                email: { required: 'Email is required', pattern: { value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/, message: 'Invalid email' } },
                phone: { required: 'Phone is required' },
            },
            reservationDateTime: {
                date: { required: 'Date is required' },
                time: { required: 'Time is required' },
                tableType: { required: 'Table type is required' },
                reservationType: { required: 'Reservation type is required' },
                guestNumber: { required: 'Guest number is required' },
            },
            paymentMethod: {
                paymentOption: { required: 'Payment method is required' },
            },
        }),
        mode: 'onChange',
        defaultValues: {
            customerDetails: { firstName: '', lastName: '', email: '', phone: '' },
            reservationDateTime: { date: '', time: '', tableType: '', reservationType: '', guestNumber: '', foodType: '', foodQuantity: '' },
            paymentMethod: { paymentOption: '', accountToPay: '', totalCost: '0' },
        },
    });

    useEffect(() => {
        const user = customerAuthService.getUser();
        if (user) {
            form.reset({
                ...form.getValues(),
                customerDetails: {
                    firstName: user.firstName || '',
                    lastName: user.lastName || '',
                    email: user.email || '',
                    phone: user.phoneNumber || '',
                },
            });
        }
    }, [form]);

    const { trigger, getValues, handleSubmit, watch, setValue, control } = form;

    const validateCurrentStep = async (): Promise<boolean> => {
        const fields = currentStep === 1 ? ['customerDetails'] : currentStep === 2 ? ['reservationDateTime'] : ['paymentMethod'];
        const result = await trigger(fields as any);
        return result;
    };

    const handleNext = async () => {
        const isValid = await validateCurrentStep();
        if (!isValid) return;
        if (currentStep < STEPS.length) {
            setCurrentStep(currentStep + 1);
        } else {
            handleSubmit(onSubmit, (errors) => {
                console.error('Validation errors:', errors);
            })();
        }
    };

    const onSubmit = async (data: any) => {
        if (!hotelId) {
            toast.error('Hotel ID is missing');
            return;
        }
        setIsSubmitting(true);
        const user = customerAuthService.getUser();
        const payload = {
            ...data.customerDetails,
            ...data.reservationDateTime,
            ...data.paymentMethod,
            guestNumber: Number(data.reservationDateTime.guestNumber),
            ...(user?.id && { customerId: user.id }),
        };
        const response = await createPublicBooking(payload, hotelId);
        setIsSubmitting(false);
        if (response.success) {
            setShowSuccessModal(true);
        } else {
            toast.error(response.message);
        }
    };

    const handleCloseModal = () => {
        setShowSuccessModal(false);
        setCurrentStep(1);
        form.reset();
    };

    const formatReservationDate = () => {
        const date = getValues('reservationDateTime.date');
        if (date) {
            const dateObj = new Date(date);
            return dateObj.toLocaleDateString('en-GB', { day: 'numeric', month: '2-digit', year: 'numeric' });
        }
        return '2th/ 09/2025';
    };

    const handlePrevious = () => {
        if (currentStep > 1) setCurrentStep(currentStep - 1);
    };

    const guestNumber = watch('reservationDateTime.guestNumber') || '1';
    const foodQuantity = watch('reservationDateTime.foodQuantity') || '1';
    const calculatedTotal = (parseInt(guestNumber) * 5000) + (parseInt(foodQuantity) * 2000);
    const formattedTotal = `₦${calculatedTotal.toLocaleString()}`;

    useEffect(() => {
        setValue('paymentMethod.totalCost', formattedTotal);
    }, [formattedTotal, setValue]);

    const renderStepContent = () => {
        switch (currentStep) {
            case 1:
                return (
                    <div className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1.5">First name.</label>
                                <input type="text" {...form.register('customerDetails.firstName')} placeholder="Enter First name" className="w-full h-11 px-4 text-sm rounded-xl border border-gray-200 focus:border-orange-500 outline-none" />
                            </div>
                            <div>
                                <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1.5">Last name.</label>
                                <input type="text" {...form.register('customerDetails.lastName')} placeholder="Enter Last name" className="w-full h-11 px-4 text-sm rounded-xl border border-gray-200 focus:border-orange-500 outline-none" />
                            </div>
                        </div>
                        <div>
                            <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1.5">Email Address</label>
                            <input type="email" {...form.register('customerDetails.email')} placeholder="Enter Email Address" className="w-full h-11 px-4 text-sm rounded-xl border border-gray-200 focus:border-orange-500 outline-none" />
                        </div>
                        <div>
                            <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1.5">Phone Number</label>
                            <input type="tel" {...form.register('customerDetails.phone')} placeholder="+234 000" className="w-full h-11 px-4 text-sm rounded-xl border border-gray-200 focus:border-orange-500 outline-none" />
                        </div>
                    </div>
                );
            case 2:
                return (
                    <div className="space-y-6">
                        <div className="p-4 space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1.5">Reservation date</label>
                                    <input type="date" {...form.register('reservationDateTime.date')} className="w-full h-11 px-4 text-sm rounded-xl border border-gray-200 focus:border-orange-500 outline-none" />
                                </div>
                                <div>
                                    <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1.5">Reservation time</label>
                                    <input type="time" {...form.register('reservationDateTime.time')} className="w-full h-11 px-4 text-sm rounded-xl border border-gray-200 focus:border-orange-500 outline-none" />
                                </div>
                            </div>
                            <div>
                                <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1.5">Table Type</label>
                                <select {...form.register('reservationDateTime.tableType')} className="w-full h-11 px-4 text-sm rounded-xl border border-gray-200 focus:border-orange-500 outline-none bg-white">
                                    <option value="">Select Table Type</option>
                                    {TABLE_TYPE_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                                </select>
                            </div>
                            <div>
                                <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1.5">Reservation Type</label>
                                <div className="space-y-2">
                                    {RESERVATION_TYPE_OPTIONS.map(o => (
                                        <label key={o.value} className="flex items-center space-x-2 cursor-pointer">
                                            <input type="radio" value={o.value} {...form.register('reservationDateTime.reservationType')} className="w-4 h-4 text-orange-500 border-gray-300 focus:ring-orange-500" />
                                            <span className="text-sm text-gray-700">{o.label}</span>
                                        </label>
                                    ))}
                                </div>
                            </div>
                            <div>
                                <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1.5">Guest Number</label>
                                <input type="number" {...form.register('reservationDateTime.guestNumber')} placeholder="Enter the number of guest" className="w-full h-11 px-4 text-sm rounded-xl border border-gray-200 focus:border-orange-500 outline-none" />
                                <div className="bg-[#F2FFF4] px-[8px] py-[7px] min-h-[40px] h-auto mt-3 flex items-center">
                                    <p className="text-xs text-[#066812] font-normal">Note if the number of guest is up to 12 and above you will have to pick a food menu.</p>
                                </div>
                            </div>
                        </div>
                        <div className="p-4 rounded-[24px] bg-[#F2F6FF] space-y-4">
                            <div>
                                <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1.5">Food Type</label>
                                <select {...form.register('reservationDateTime.foodType')} className="w-full h-11 px-4 text-sm rounded-xl border border-gray-200 focus:border-orange-500 outline-none bg-white">
                                    <option value="">Select Food type</option>
                                    {FOOD_TYPE_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                                </select>
                            </div>
                            <div>
                                <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1.5">Food Quantity (optional)</label>
                                <textarea {...form.register('reservationDateTime.foodQuantity')} placeholder="describe the quantity of foods you want" rows={3} className="w-full p-4 text-sm rounded-xl border border-gray-200 focus:border-orange-500 outline-none" />
                            </div>
                        </div>
                    </div>
                );
            case 3:
                return (
                    <div className="space-y-4">
                        <label className="block text-sm text-[#919191] mb-3">Select Payment method</label>
                        <div className="space-y-3">
                            <div className={`flex items-center justify-between p-4 h-16 rounded-lg border cursor-pointer transition-all ${form.watch('paymentMethod.paymentOption') === 'cash' ? 'border-[#007BFF] bg-[#F8FBFF]' : 'border-[#E5E7EB] bg-[#FAFAFA]'}`} onClick={() => form.setValue('paymentMethod.paymentOption', 'cash')}>
                                <span className="text-sm font-medium text-[#344054]">Cash on Arrival</span>
                                <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${form.watch('paymentMethod.paymentOption') === 'cash' ? 'border-[#007BFF]' : 'border-[#D0D5DD]'}`}>
                                    {form.watch('paymentMethod.paymentOption') === 'cash' && <div className="w-2.5 h-2.5 rounded-full bg-[#007BFF]" />}
                                </div>
                            </div>
                        </div>
                        <div className="mt-6">
                            <label className="block text-sm text-[#919191] mb-2">Total Cost</label>
                            <div className="w-full px-4 h-14 flex items-center rounded-[8px] bg-[#FAFAFA] text-[#344054] font-semibold text-lg">{formattedTotal}</div>
                            <div className="mt-3 px-4 py-3 min-h-10 flex items-center rounded-lg bg-[#F2FFF4]">
                                <p className="text-xs text-[#066812] font-medium leading-relaxed">Please Note this amount will be used as a deposit or reservation fee and is non-refundable.</p>
                            </div>
                        </div>
                    </div>
                );
            default:
                return null;
        }
    };

    return (
        <>
            <div className="max-w-4xl mx-auto px-4 py-12">
                <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
                    <div className="flex items-center justify-between mb-8">
                        {STEPS.map((step, index) => (
                            <div key={step.id} className="flex items-center flex-1">
                                <div className="flex flex-col items-center">
                                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${currentStep >= step.id ? 'bg-[#007BFF] text-white' : 'bg-gray-200 text-gray-500'}`}>
                                        {step.id}
                                    </div>
                                    <span className={`text-xs mt-2 font-medium ${currentStep >= step.id ? 'text-[#007BFF]' : 'text-gray-500'}`}>{step.label}</span>
                                </div>
                                {index < STEPS.length - 1 && <div className={`flex-1 h-0.5 mx-4 mt-[-16px] ${currentStep > step.id ? 'bg-[#007BFF]' : 'bg-gray-200'}`} />}
                            </div>
                        ))}
                    </div>
                    <div className="mb-8">{renderStepContent()}</div>
                    <div className="flex justify-between">
                        <button type="button" onClick={handlePrevious} disabled={currentStep === 1} className="px-6 py-2.5 bg-gray-200 hover:bg-gray-300 disabled:bg-gray-100 disabled:text-gray-400 text-gray-900 font-bold text-sm rounded-xl transition-all">Previous</button>
                        <button type="button" onClick={handleNext} disabled={isSubmitting} className="px-6 py-2.5 bg-[#007BFF] hover:bg-blue-600 disabled:bg-gray-400 text-white font-bold text-sm rounded-xl transition-all">{currentStep === STEPS.length ? 'Submit' : 'Next'}</button>
                    </div>
                </div>
            </div>
            {showSuccessModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
                    <div className="bg-white rounded-2xl p-8 max-w-md w-full mx-4 text-center">
                        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                            <svg className="w-8 h-8 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                        </div>
                        <h2 className="text-2xl font-bold text-gray-900 mb-2">Reservation Successful!</h2>
                        <p className="text-gray-600 mb-6">Your table has been reserved for {formatReservationDate()}. We look forward to welcoming you!</p>
                        <button onClick={handleCloseModal} className="px-6 py-2.5 bg-[#007BFF] hover:bg-blue-600 text-white font-bold text-sm rounded-xl transition-all">Close</button>
                    </div>
                </div>
            )}
        </>
    );
}
