'use client';

import React from 'react';
import { Check } from 'lucide-react';

type StepId = 'booking' | 'details';

interface BookingStepProgressProps {
    currentStep: StepId;
}

const STEPS: { id: StepId; label: string; short: string }[] = [
    { id: 'booking', label: 'Select stay', short: '1' },
    { id: 'details', label: 'Your details', short: '2' },
];

export default function BookingStepProgress({
    currentStep,
}: BookingStepProgressProps) {
    const currentIndex = STEPS.findIndex((s) => s.id === currentStep);

    return (
        <nav
            aria-label="Booking progress"
            className="max-w-7xl mx-auto px-4 md:px-6 mb-6 md:mb-8"
        >
            <ol className="flex items-center justify-center gap-2 md:gap-4">
                {STEPS.map((step, index) => {
                    const isComplete = index < currentIndex;
                    const isActive = index === currentIndex;

                    return (
                        <li
                            key={step.id}
                            className="flex items-center gap-2 md:gap-4"
                        >
                            <div className="flex items-center gap-2">
                                <span
                                    className={`flex h-8 w-8 md:h-9 md:w-9 items-center justify-center rounded-full text-xs md:text-sm font-bold transition-colors ${
                                        isComplete
                                            ? 'bg-emerald-500 text-white'
                                            : isActive
                                              ? 'bg-orion-blue text-white shadow-md shadow-orion-blue/30'
                                              : 'bg-slate-100 text-slate-400 border border-slate-200'
                                    }`}
                                >
                                    {isComplete ? (
                                        <Check className="w-4 h-4" strokeWidth={3} />
                                    ) : (
                                        step.short
                                    )}
                                </span>
                                <span
                                    className={`hidden sm:block text-sm font-semibold ${
                                        isActive
                                            ? 'text-gray-900'
                                            : isComplete
                                              ? 'text-slate-600'
                                              : 'text-slate-400'
                                    }`}
                                >
                                    {step.label}
                                </span>
                            </div>
                            {index < STEPS.length - 1 && (
                                <div
                                    className={`h-0.5 w-8 md:w-16 rounded-full ${
                                        index < currentIndex
                                            ? 'bg-emerald-400'
                                            : 'bg-slate-200'
                                    }`}
                                    aria-hidden
                                />
                            )}
                        </li>
                    );
                })}
            </ol>
        </nav>
    );
}
