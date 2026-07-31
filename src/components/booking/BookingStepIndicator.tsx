'use client';

import React from 'react';
import { Check } from 'lucide-react';

export interface Step {
    id: number;
    label: string;
}

interface BookingStepIndicatorProps {
    steps: Step[];
    currentStep: number;
}

export default function BookingStepIndicator({
    steps,
    currentStep,
}: BookingStepIndicatorProps) {
    return (
        <div className="flex items-center justify-between w-full max-w-[280px] md:max-w-full mx-auto px-0 md:px-4">
            {steps.map((step, index) => {
                const isCompleted = step.id < currentStep;
                const isCurrent = step.id === currentStep;
                const isActiveOrCompleted = isCurrent || isCompleted;
                const isLast = index === steps.length - 1;

                return (
                    <React.Fragment key={step.id}>
                        <div className="flex flex-col items-center flex-shrink-0 relative z-10">
                            {isActiveOrCompleted ? (
                                <div className="w-4 h-4 md:w-5 md:h-5 flex items-center justify-center bg-white rounded-full shadow-sm">
                                    {isCompleted ? (
                                        <Check className="w-2.5 h-2.5 md:w-3 md:h-3 text-orange-500" strokeWidth={3} />
                                    ) : (
                                        <div className="w-2 h-2 md:w-2.5 md:h-2.5 bg-orange-500 rounded-full" />
                                    )}
                                </div>
                            ) : (
                                <div className="w-4 h-4 md:w-5 md:h-5 flex items-center justify-center bg-[#475467] rounded-full">
                                    <div className="w-1.5 h-1.5 md:w-2 md:h-2 bg-white rounded-full opacity-40" />
                                </div>
                            )}

                            <span
                                className={`
                                    mt-1 text-[9px] md:text-[11px] font-semibold whitespace-nowrap
                                    ${isActiveOrCompleted ? 'text-[#101828]' : 'text-[#98A2B3]'}
                                    hidden md:block
                                `}
                            >
                                {step.label}
                            </span>
                            {isCurrent && (
                                <span className="mt-1 text-[9px] font-bold text-[#101828] md:hidden">
                                    Step {step.id}
                                </span>
                            )}
                        </div>

                        {!isLast && (
                            <div
                                className={`
                                    flex-1 h-[1.5px] md:h-[2px] -mx-1 md:-mx-2 mb-0 md:mb-6 min-w-[20px] md:min-w-[60px]
                                    ${isCompleted ? 'bg-orange-500' : 'bg-[#475467]'}
                                `}
                            />
                        )}
                    </React.Fragment>
                );
            })}
        </div>
    );
}
