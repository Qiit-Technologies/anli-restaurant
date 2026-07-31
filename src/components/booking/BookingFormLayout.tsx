'use client';

import React from 'react';
import BookingStepIndicator, { Step } from './BookingStepIndicator';
import { Button } from '@/components/ui/button';
import { FaSpinner } from 'react-icons/fa6';

interface BookingFormLayoutProps {
    steps: Step[];
    currentStep: number;
    children: React.ReactNode;
    onPrevious: () => void;
    onNext: () => void;
    isFirstStep: boolean;
    isLastStep: boolean;
    isSubmitting: boolean;
    isSuccess?: boolean;
}

export default function BookingFormLayout({
    steps,
    currentStep,
    children,
    onPrevious,
    onNext,
    isFirstStep,
    isLastStep,
    isSubmitting,
    isSuccess = false,
}: BookingFormLayoutProps) {
    return (
        <section className="w-full bg-transparent px-6 md:px-4">
            <div className="max-w-[700px] mx-auto">
                {!isSuccess && (
                    <div className="text-center mb-6">
                        <h2 className="text-white text-xl md:text-3xl font-bold mb-2">
                            Fill the form to book a reservation
                        </h2>
                    </div>
                )}

                <div className="bg-white rounded-2xl md:rounded-[32px] p-4 md:p-6 shadow-2xl">
                    {!isSuccess && (
                        <>
                            <div className="text-center mb-4">
                                <h3 className="text-[#344054] text-base md:text-lg font-bold">
                                    Create new reservation
                                </h3>
                                <p className="text-[#98A2B3] text-[10px] md:text-xs mt-0.5">
                                    Enter every details to register a new customer order
                                </p>
                            </div>

                            <div className="mb-6 pt-4 border-t border-gray-100 overflow-x-auto no-scrollbar">
                                <BookingStepIndicator
                                    steps={steps}
                                    currentStep={currentStep}
                                />
                            </div>
                        </>
                    )}

                    <div>{children}</div>

                    {!isSuccess && (
                        <div className="flex items-center gap-3 mt-4 pt-4 border-t border-gray-100">
                            <button
                                type="button"
                                onClick={onPrevious}
                                disabled={isFirstStep || isSubmitting}
                                className={`
                                    flex-1 h-10 rounded-xl text-sm font-semibold transition-all border
                                    ${isFirstStep ? 'invisible' : 'bg-white border-[#EAECF0] text-[#667085] hover:bg-gray-50'}
                                `}
                            >
                                Previous
                            </button>

                            <Button
                                type="button"
                                onClick={onNext}
                                disabled={isSubmitting}
                                className="flex-1 h-10 bg-[#007BFF] hover:bg-[#0056b3] text-white rounded-xl text-sm font-semibold transition-all shadow-md shadow-blue-50"
                            >
                                {isSubmitting ? (
                                    <FaSpinner className="animate-spin text-lg" />
                                ) : isLastStep ? (
                                    'Submit'
                                ) : (
                                    'Next'
                                )}
                            </Button>
                        </div>
                    )}
                </div>
            </div>
        </section>
    );
}
