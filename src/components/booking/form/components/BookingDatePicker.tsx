'use client';

import React, { useState, useRef, useEffect } from 'react';
import dayjs, { Dayjs } from 'dayjs';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon } from 'lucide-react';

export interface DateRangeValue {
    startDate: string;
    endDate: string;
}

interface BookingDatePickerProps {
    value: DateRangeValue;
    onChange: (value: DateRangeValue) => void;
    placeholder?: string;
}

const DAYS_OF_WEEK = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];

export default function BookingDatePicker({
    value,
    onChange,
    placeholder = 'Select dates',
}: BookingDatePickerProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [viewMonth, setViewMonth] = useState<Dayjs>(
        value.startDate ? dayjs(value.startDate) : dayjs()
    );
    const [selecting, setSelecting] = useState<'start' | 'end'>('start');
    const [hovered, setHovered] = useState<string | null>(null);
    const containerRef = useRef<HTMLDivElement>(null);

    const startDate = value.startDate ? dayjs(value.startDate) : null;
    const endDate = value.endDate ? dayjs(value.endDate) : null;

    useEffect(() => {
        const handler = (e: MouseEvent) => {
            if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
                setIsOpen(false);
                setSelecting('start');
            }
        };
        document.addEventListener('mousedown', handler);
        return () => document.removeEventListener('mousedown', handler);
    }, []);

    const handleDayClick = (day: Dayjs) => {
        const dayStr = day.format('YYYY-MM-DD');
        if (selecting === 'start') {
            onChange({ startDate: dayStr, endDate: '' });
            setSelecting('end');
        } else {
            if (startDate && day.isBefore(startDate, 'day')) {
                onChange({ startDate: dayStr, endDate: '' });
                setSelecting('end');
            } else {
                onChange({ startDate: value.startDate, endDate: dayStr });
                setSelecting('start');
                setIsOpen(false);
            }
        }
    };

    const buildDays = (month: Dayjs): (Dayjs | null)[] => {
        const firstDay = month.startOf('month');
        const startOffset = firstDay.day();
        const daysInMonth = month.daysInMonth();
        const cells: (Dayjs | null)[] = [];
        for (let i = 0; i < startOffset; i++) cells.push(null);
        for (let d = 1; d <= daysInMonth; d++) cells.push(month.date(d));
        return cells;
    };

    const days = buildDays(viewMonth);

    const isStart = (day: Dayjs) => startDate ? day.isSame(startDate, 'day') : false;
    const isEnd = (day: Dayjs) => endDate ? day.isSame(endDate, 'day') : false;

    const isInRange = (day: Dayjs) => {
        const rangeEnd = selecting === 'end' && hovered ? dayjs(hovered) : endDate;
        if (!startDate || !rangeEnd) return false;
        const [a, b] = startDate.isBefore(rangeEnd)
            ? [startDate, rangeEnd]
            : [rangeEnd, startDate];
        return day.isAfter(a, 'day') && day.isBefore(b, 'day');
    };

    const isToday = (day: Dayjs) => day.isSame(dayjs(), 'day');
    const isPast = (day: Dayjs) => day.isBefore(dayjs(), 'day');

    const formatDisplay = () => {
        if (!value.startDate && !value.endDate) return placeholder;
        const s = value.startDate ? dayjs(value.startDate).format('ddd, D MMM') : '?';
        const e = value.endDate ? dayjs(value.endDate).format('ddd, D MMM') : '?';
        return s + '  —  ' + e;
    };

    const nightCount = startDate && endDate ? endDate.diff(startDate, 'day') : 0;

    return (
        <div ref={containerRef} className="relative w-full">
            <button
                type="button"
                onClick={() => setIsOpen((v) => !v)}
                className={
                    'w-full h-10 border rounded-md px-3 bg-white flex items-center gap-2 text-sm font-medium transition-all focus:outline-none focus:ring-1 focus:ring-blue-300 ' +
                    (isOpen ? 'border-blue-400 ring-1 ring-blue-200 ' : 'border-gray-300 hover:border-gray-400 ') +
                    (value.startDate ? 'text-gray-700' : 'text-gray-400')
                }
            >
                <CalendarIcon className="w-4 h-4 text-gray-400 shrink-0" />
                <span className="truncate text-left">{formatDisplay()}</span>
            </button>

            {isOpen && (
                <div className="absolute left-0 top-[calc(100%+6px)] z-50 bg-white border border-gray-200 rounded-md shadow-xl p-4 w-[310px]">
                    <div className="flex items-center justify-between mb-3">
                        <span className="text-[11px] font-bold text-gray-500 uppercase tracking-wider">
                            {selecting === 'start' ? 'Check-in date' : 'Check-out date'}
                        </span>
                        {(value.startDate || value.endDate) && (
                            <button
                                type="button"
                                onClick={() => {
                                    onChange({ startDate: '', endDate: '' });
                                    setSelecting('start');
                                }}
                                className="text-[10px] text-gray-400 hover:text-red-400 font-semibold transition-colors"
                            >
                                Clear
                            </button>
                        )}
                    </div>

                    <div className="flex items-center justify-between mb-3">
                        <button
                            type="button"
                            onClick={() => setViewMonth((m) => m.subtract(1, 'month'))}
                            className="w-7 h-7 flex items-center justify-center rounded-md hover:bg-gray-100 text-gray-500 transition-colors"
                        >
                            <ChevronLeft className="w-4 h-4" />
                        </button>
                        <span className="text-sm font-bold text-gray-800">
                            {viewMonth.format('MMMM YYYY')}
                        </span>
                        <button
                            type="button"
                            onClick={() => setViewMonth((m) => m.add(1, 'month'))}
                            className="w-7 h-7 flex items-center justify-center rounded-md hover:bg-gray-100 text-gray-500 transition-colors"
                        >
                            <ChevronRight className="w-4 h-4" />
                        </button>
                    </div>

                    <div className="grid grid-cols-7 mb-1">
                        {DAYS_OF_WEEK.map((d) => (
                            <div key={d} className="h-7 flex items-center justify-center text-[10px] font-bold text-gray-400 uppercase">
                                {d}
                            </div>
                        ))}
                    </div>

                    <div className="grid grid-cols-7">
                        {days.map((day, idx) => {
                            if (!day) return <div key={'empty-' + idx} className="h-8" />;

                            const start = isStart(day);
                            const end = isEnd(day);
                            const inRange = isInRange(day);
                            const today = isToday(day);
                            const past = isPast(day);

                            let cls = 'h-8 w-full flex items-center justify-center text-xs font-medium transition-all select-none ';
                            if (past) cls += 'text-gray-300 cursor-not-allowed';
                            else if (start || end) cls += 'bg-[#00A3FF] text-white rounded-md font-bold shadow-sm cursor-pointer';
                            else if (inRange) cls += 'bg-blue-50 text-blue-600 cursor-pointer';
                            else if (today) cls += 'text-[#00A3FF] font-bold cursor-pointer hover:bg-gray-100 rounded-md';
                            else cls += 'text-gray-700 cursor-pointer hover:bg-gray-100 rounded-md';

                            return (
                                <button
                                    key={day.format('YYYY-MM-DD')}
                                    type="button"
                                    disabled={past}
                                    onClick={() => handleDayClick(day)}
                                    onMouseEnter={() => { if (selecting === 'end') setHovered(day.format('YYYY-MM-DD')); }}
                                    onMouseLeave={() => setHovered(null)}
                                    className={cls}
                                >
                                    {day.date()}
                                </button>
                            );
                        })}
                    </div>

                    <div className="mt-3 pt-3 border-t border-gray-100 flex items-center justify-between">
                        <div className="text-xs text-gray-500">
                            {value.startDate && value.endDate ? (
                                <span><strong className="text-gray-800">{nightCount} night{nightCount !== 1 ? 's' : ''}</strong> selected</span>
                            ) : value.startDate ? (
                                <span className="text-[#00A3FF] font-semibold">Now pick check-out date</span>
                            ) : (
                                <span>Pick your check-in date</span>
                            )}
                        </div>
                        {value.startDate && value.endDate && (
                            <button
                                type="button"
                                onClick={() => setIsOpen(false)}
                                className="text-xs bg-[#00A3FF] text-white px-3 py-1 rounded-md font-semibold hover:bg-blue-600 transition-colors"
                            >
                                Done
                            </button>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}
