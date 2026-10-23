import React from 'react';
import { Calendar } from 'lucide-react';

export const DateSelector = ({ selectedDate, onSelectDate }) => {
  // Generate 5 days starting from today
  const generateDates = () => {
    const dates = [];
    const today = new Date();
    const days = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'];
    const months = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'];

    for (let i = 0; i < 5; i++) {
      const d = new Date(today);
      d.setDate(today.getDate() + i);

      const y = d.getFullYear();
      const m = String(d.getMonth() + 1).padStart(2, '0');
      const dayNum = String(d.getDate()).padStart(2, '0');
      const dateStr = `${y}-${m}-${dayNum}`;

      dates.push({
        dateStr,
        dayName: i === 0 ? 'TODAY' : i === 1 ? 'TOMORROW' : days[d.getDay()],
        dayNumber: d.getDate(),
        monthName: months[d.getMonth()],
      });
    }
    return dates;
  };

  const datesList = generateDates();

  return (
    <div className="flex items-center gap-3 overflow-x-auto pb-2 scrollbar-none">
      <div className="hidden sm:flex items-center gap-2 pr-2 text-slate-400 text-xs font-bold uppercase tracking-wider shrink-0">
        <Calendar className="w-4 h-4 text-red-500" />
        <span>Dates</span>
      </div>

      <div className="flex gap-2">
        {datesList.map((item) => {
          const isSelected = selectedDate === item.dateStr;
          return (
            <button
              key={item.dateStr}
              onClick={() => onSelectDate(item.dateStr)}
              className={`flex flex-col items-center justify-center min-w-[70px] sm:min-w-[80px] py-2.5 px-3 rounded-2xl border transition-all text-center ${
                isSelected
                  ? 'bg-red-600 border-red-500 text-white shadow-lg shadow-red-600/30 scale-105'
                  : 'bg-slate-900/90 border-slate-800 text-slate-400 hover:text-white hover:border-slate-700'
              }`}
            >
              <span className={`text-[10px] font-bold tracking-wider ${isSelected ? 'text-red-100' : 'text-slate-500'}`}>
                {item.dayName}
              </span>
              <span className="text-lg font-black leading-tight">
                {item.dayNumber}
              </span>
              <span className={`text-[10px] font-semibold ${isSelected ? 'text-red-200' : 'text-slate-400'}`}>
                {item.monthName}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
};
