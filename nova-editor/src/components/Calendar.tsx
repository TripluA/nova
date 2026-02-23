import React, { useState, useMemo } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '../lib/utils';

interface Document {
  id: string;
  title: string;
  content: string;
  updatedAt: number;
  folderId?: string | null;
}

interface CalendarProps {
  onDateSelect: (dateStr: string) => void;
  documents: Document[];
}

export function Calendar({ onDateSelect, documents }: CalendarProps) {
  const [currentDate, setCurrentDate] = useState(new Date());

  const docsByDate = useMemo(() => {
    return documents.reduce((acc, doc) => {
      // Assuming title is YYYY-MM-DD
      if (/^\d{4}-\d{2}-\d{2}$/.test(doc.title)) {
        acc[doc.title] = true;
      }
      return acc;
    }, {} as Record<string, boolean>);
  }, [documents]);

  const getDaysInMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth(), 1).getDay();
  };

  const prevMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  };

  const nextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  };

  const handleDateClick = (day: number) => {
    const selectedDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);
    // Format as YYYY-MM-DD
    const year = selectedDate.getFullYear();
    const month = String(selectedDate.getMonth() + 1).padStart(2, '0');
    const date = String(selectedDate.getDate()).padStart(2, '0');
    const dateStr = `${year}-${month}-${date}`;
    onDateSelect(dateStr);
  };

  const daysInMonth = getDaysInMonth(currentDate);
  const firstDay = getFirstDayOfMonth(currentDate);
  const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);
  const emptyDays = Array.from({ length: firstDay }, (_, i) => i);

  const monthNames = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];

  const today = new Date();
  const isCurrentMonth = today.getMonth() === currentDate.getMonth() && today.getFullYear() === currentDate.getFullYear();

  return (
    <div className="p-4 select-none">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-bold text-[var(--text-primary)]">
          {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
        </h3>
        <div className="flex items-center gap-2">
          <button 
            onClick={() => setCurrentDate(new Date())}
            className="text-sm font-medium text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors pr-2"
          >
            Today
          </button>
          <button 
            onClick={prevMonth}
            className="p-1 rounded hover:bg-[var(--border-color)] text-[var(--text-secondary)]"
          >
            <ChevronLeft size={16} />
          </button>
          <button 
            onClick={nextMonth}
            className="p-1 rounded hover:bg-[var(--border-color)] text-[var(--text-secondary)]"
          >
            <ChevronRight size={16} />
          </button>
        </div>
      </div>
      
      <div className="grid grid-cols-7 gap-1 mb-2 text-center">
        {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map(day => (
          <div key={day} className="text-[10px] font-bold text-[var(--text-muted)] uppercase">
            {day}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-1 text-center">
        {emptyDays.map(i => (
          <div key={`empty-${i}`} />
        ))}
        {days.map(day => {
          const isToday = isCurrentMonth && day === today.getDate();
          const dateStr = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
          const hasDoc = docsByDate[dateStr];

          return (
            <button
              key={day}
              onClick={() => handleDateClick(day)}
              className={cn(
                "h-8 w-8 flex items-center justify-center rounded-full text-sm transition-colors relative",
                isToday 
                  ? "bg-[var(--accent-color)] text-white font-bold" 
                  : "text-[var(--text-primary)] hover:bg-[var(--bg-secondary)]"
              )}
            >
              {day}
              {hasDoc && <div className="absolute bottom-1.5 h-1 w-1 rounded-full bg-current" />}
            </button>
          );
        })}
      </div>
    </div>
  );
}
