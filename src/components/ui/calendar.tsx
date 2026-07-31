'use client';

import * as React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { DayPicker, useDayRender } from 'react-day-picker';

import { cn } from '@/lib/utils';
import { buttonVariants } from '@/components/ui/button';
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from '@/components/ui/tooltip';

export type CalendarProps = React.ComponentProps<typeof DayPicker> & {
    disabledReason?: (date: Date) => string | null;
    showFooter?: boolean;
};

function Calendar({
    className,
    classNames,
    showOutsideDays = true,
    disabledReason,
    showFooter = false,
    ...props
}: CalendarProps) {
    return (
        <TooltipProvider>
            <DayPicker
                showOutsideDays={showOutsideDays}
                className={cn('p-3', className)}
                classNames={{
                    months: 'flex flex-col sm:flex-row space-y-4 sm:space-x-4 sm:space-y-0',
                    month: 'space-y-4',
                    caption: 'flex justify-center pt-1 relative items-center',
                    caption_label: 'text-sm font-medium',
                    nav: 'space-x-1 flex items-center',
                    nav_button: cn(
                        buttonVariants({ variant: 'outline' }),
                        'h-7 w-7 bg-transparent p-0 opacity-50 hover:opacity-100',
                    ),
                    nav_button_previous: 'absolute left-1',
                    nav_button_next: 'absolute right-1',
                    table: 'w-full border-collapse space-y-1',
                    head_row: 'flex',
                    head_cell:
                        'text-muted-foreground rounded-md w-8 font-normal text-[0.8rem]',
                    row: 'flex w-full mt-2',
                    cell: cn(
                        'relative p-0 text-center text-sm focus-within:relative focus-within:z-20 [&:has([aria-selected])]:bg-accent [&:has([aria-selected].day-outside)]:bg-accent/50 [&:has([aria-selected].day-range-end)]:rounded-r-md',
                        props.mode === 'range'
                            ? '[&:has(>.day-range-end)]:rounded-r-md [&:has(>.day-range-start)]:rounded-l-md first:[&:has([aria-selected])]:rounded-l-md last:[&:has([aria-selected])]:rounded-r-md'
                            : '[&:has([aria-selected])]:rounded-md',
                    ),
                    day: cn(
                        buttonVariants({ variant: 'ghost' }),
                        'h-8 w-8 p-0 font-normal aria-selected:opacity-100',
                    ),
                    day_range_start: 'day-range-start',
                    day_range_end: 'day-range-end',
                    day_selected:
                        'bg-orion-blue text-primary-foreground hover:bg-orion-blue hover:text-primary-foreground focus:bg-orion-blue focus:text-primary-foreground',
                    day_today: 'bg-accent text-accent-foreground',
                    day_outside:
                        'day-outside text-muted-foreground aria-selected:bg-accent/50 aria-selected:text-muted-foreground',
                    day_disabled:
                        'text-muted-foreground opacity-20 cursor-not-allowed pointer-events-none',
                    day_range_middle:
                        'aria-selected:bg-accent aria-selected:text-accent-foreground',
                    day_hidden: 'invisible',
                    ...classNames,
                }}
                modifiers={{
                    blocked: (date) => !!disabledReason?.(date),
                }}
                modifiersClassNames={{
                    blocked:
                        'text-red-600 opacity-70 line-through bg-red-50/30 border border-red-200/50 rounded-md shadow-inner !pointer-events-auto hover:bg-red-50/50 transition-all',
                }}
                components={{
                    IconLeft: ({ className, ...props }) => (
                        <ChevronLeft
                            className={cn('h-4 w-4', className)}
                            {...props}
                        />
                    ),
                    IconRight: ({ className, ...props }) => (
                        <ChevronRight
                            className={cn('h-4 w-4', className)}
                            {...props}
                        />
                    ),
                    Day: ({ date, displayMonth }) => {
                        const buttonRef = React.useRef<HTMLButtonElement>(null);
                        const { buttonProps, divProps, isButton, isHidden } =
                            useDayRender(date, displayMonth, buttonRef);

                        const reason = disabledReason?.(date);

                        if (isHidden) return null;

                        if (reason) {
                            return (
                                <Tooltip>
                                    <TooltipTrigger asChild>
                                        <div className="w-full h-full flex items-center justify-center cursor-not-allowed pointer-events-auto">
                                            <button
                                                {...buttonProps}
                                                ref={buttonRef}
                                            />
                                        </div>
                                    </TooltipTrigger>
                                    <TooltipContent
                                        side="top"
                                        className="bg-[#A02724] text-white border-none shadow-xl text-[10px] py-1.5 px-3 rounded-lg animate-in fade-in-0 zoom-in-95 pointer-events-none z-[100]"
                                    >
                                        <div className="relative z-[101]">
                                            <p className="font-semibold mb-0.5 whitespace-nowrap">
                                                Not Available
                                            </p>
                                            <p className="opacity-90 max-w-[150px] leading-tight">
                                                {reason}
                                            </p>
                                        </div>
                                    </TooltipContent>
                                </Tooltip>
                            );
                        }

                        if (!isButton) {
                            return <div {...divProps} />;
                        }

                        return <button {...buttonProps} ref={buttonRef} />;
                    },
                }}
                footer={
                    showFooter ? (
                        <div className="mt-4 pt-4 border-t border-gray-100 px-1 space-y-2">
                            <div className="flex items-center gap-2">
                                <div className="w-3 h-3 bg-red-50/40 border border-red-200/50 rounded-sm" />
                                <span className="text-[10px] text-gray-400 font-medium uppercase tracking-wider">
                                    Blocked (Hover for reason)
                                </span>
                            </div>
                            <div className="flex items-center gap-2">
                                <div className="w-3 h-3 bg-gray-100 rounded-sm" />
                                <span className="text-[10px] text-gray-400 font-normal uppercase tracking-wider opacity-60">
                                    Past Dates
                                </span>
                            </div>
                        </div>
                    ) : null
                }
                {...props}
            />
        </TooltipProvider>
    );
}
Calendar.displayName = 'Calendar';

export { Calendar };
