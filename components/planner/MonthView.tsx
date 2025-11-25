
import React from 'react';
import { Todo } from '../../types';
import { ChevronLeftIcon, ChevronRightIcon } from '../Icons';

interface MonthViewProps {
    currentDate: Date;
    setCurrentDate: (date: Date) => void;
    selectedDate: Date;
    setSelectedDate: (date: Date) => void;
}

const MonthView: React.FC<MonthViewProps> = ({ currentDate, setCurrentDate, selectedDate, setSelectedDate }) => {
    const daysInMonth = (year: number, month: number) => new Date(year, month + 1, 0).getDate();
    const firstDayOfMonth = (year: number, month: number) => new Date(year, month, 1).getDay();

    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();

    const monthDays = daysInMonth(year, month);
    const startingDay = firstDayOfMonth(year, month);

    const blanks = Array(startingDay).fill(null);
    const days = Array.from({ length: monthDays }, (_, i) => i + 1);

    const prevMonth = () => setCurrentDate(new Date(year, month - 1, 1));
    const nextMonth = () => setCurrentDate(new Date(year, month + 1, 1));

    const isSelected = (day: number) => {
        return selectedDate.getFullYear() === year && selectedDate.getMonth() === month && selectedDate.getDate() === day;
    };
    
    const isToday = (day: number) => {
        const today = new Date();
        return today.getFullYear() === year && today.getMonth() === month && today.getDate() === day;
    }

    return (
        <div>
            <div className="flex justify-between items-center mb-4">
                <div className="flex items-center gap-2">
                    <button onClick={prevMonth} className="p-2 rounded-full hover:bg-black/5 dark:hover:bg-white/10"><ChevronLeftIcon /></button>
                    <button onClick={nextMonth} className="p-2 rounded-full hover:bg-black/5 dark:hover:bg-white/10"><ChevronRightIcon /></button>
                </div>
                <h3 className="text-lg font-semibold text-gray-600 dark:text-gray-300">
                    {currentDate.toLocaleString('default', { year: 'numeric' })}
                </h3>
            </div>
            <div className="grid grid-cols-7 gap-y-2 text-center text-sm text-gray-500 dark:text-gray-400 mb-2">
                {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((d, i) => <div key={i}>{d}</div>)}
            </div>
            <div className="grid grid-cols-7 gap-y-2">
                {blanks.map((_, i) => <div key={`blank-${i}`} />)}
                {days.map(day => (
                    <div key={day} className="flex justify-center">
                        <button
                            onClick={() => setSelectedDate(new Date(year, month, day))}
                            className={`flex items-center justify-center w-9 h-9 rounded-full transition-all duration-200 font-medium 
                            ${isSelected(day) ? 'bg-orange-500 text-white shadow-lg shadow-orange-500/30' : ''}
                            ${!isSelected(day) && isToday(day) ? 'border-2 border-orange-500 text-orange-500 dark:text-white' : ''}
                            ${!isSelected(day) ? 'hover:bg-black/5 dark:hover:bg-white/10 text-gray-700 dark:text-gray-300' : ''}
                            `}
                        >
                            {day}
                        </button>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default MonthView;