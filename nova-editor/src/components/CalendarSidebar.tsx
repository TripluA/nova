import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X } from 'lucide-react';
import { Calendar } from './Calendar';
import { useAppContext } from '../context/AppContext';

interface CalendarSidebarProps {
  showCalendar: boolean;
  setShowCalendar: (show: boolean) => void;
  onDateSelect: (dateStr: string) => void;
}

export const CalendarSidebar = ({ showCalendar, setShowCalendar, onDateSelect }: CalendarSidebarProps) => {
  const { documents } = useAppContext();
  
  return (
    <AnimatePresence>
      {showCalendar && (
        <motion.div
          initial={{ width: 0, opacity: 0 }}
          animate={{ width: 300, opacity: 1 }}
          exit={{ width: 0, opacity: 0 }}
          className="border-l border-[var(--border-color)] bg-[var(--bg-sidebar)] overflow-hidden flex flex-col"
        >
          <div className="p-4 border-b border-[var(--border-color)] flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-widest text-[var(--text-muted)]">Calendar</span>
            <button 
              onClick={() => setShowCalendar(false)}
              className="text-[var(--text-muted)] hover:text-[var(--text-primary)]"
            >
              <X size={16} />
            </button>
          </div>
          <div className="flex-1 overflow-y-auto">
            <Calendar onDateSelect={onDateSelect} documents={documents} />
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};