import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Settings, X, Moon, Sun, Monitor, Folder as FolderIcon } from 'lucide-react';
import { cn } from '../lib/utils';

import { useAppContext } from '../context/AppContext';

interface SettingsModalProps {
  showSettings: boolean;
  setShowSettings: (show: boolean) => void;
  theme: 'dark' | 'light' | 'system';
  setTheme: (theme: 'dark' | 'light' | 'system') => void;
  fontSize: number;
  setFontSize: (size: number) => void;
  defaultCalendarExpanded: boolean;
  setDefaultCalendarExpanded: (expanded: boolean) => void;
  libraryPath: string | null;
  handleSelectLibraryLocation: () => void;
}

export const SettingsModal = ({ 
  showSettings, 
  setShowSettings, 
  theme, 
  setTheme, 
  fontSize, 
  setFontSize, 
  defaultCalendarExpanded, 
  setDefaultCalendarExpanded, 
  libraryPath, 
  handleSelectLibraryLocation 
}: SettingsModalProps) => {
  const { syncToLocalDisk } = useAppContext();
  return (
    <AnimatePresence>
      {showSettings && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setShowSettings(false)}
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="relative w-full max-w-md overflow-hidden rounded-2xl border border-[var(--border-color)] bg-[var(--bg-primary)] shadow-2xl"
          >
            <div className="flex items-center justify-between border-b border-[var(--border-color)] px-6 py-4">
              <div className="flex items-center gap-2 text-[var(--accent-color)]">
                <Settings size={18} />
                <h2 className="text-sm font-bold uppercase tracking-widest">Settings</h2>
              </div>
              <button 
                onClick={() => setShowSettings(false)}
                className="rounded-full p-1 text-[var(--text-muted)] hover:bg-[var(--bg-secondary)] hover:text-[var(--text-primary)] transition-all"
              >
                <X size={18} />
              </button>
            </div>

            <div className="p-6 space-y-8">
              {/* Theme Selection */}
              <div className="space-y-3">
                <label className="text-[10px] font-bold uppercase tracking-widest text-[var(--text-muted)]">Appearance</label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { id: 'dark', icon: Moon, label: 'Dark' },
                    { id: 'light', icon: Sun, label: 'Light' },
                    { id: 'system', icon: Monitor, label: 'System' }
                  ].map(item => (
                    <button
                      key={item.id}
                      onClick={() => setTheme(item.id as any)}
                      className={cn(
                        "flex flex-col items-center gap-2 rounded-xl border p-3 transition-all",
                        theme === item.id 
                          ? "border-[var(--accent-color)] bg-[var(--accent-soft)] text-[var(--accent-color)]" 
                          : "border-[var(--border-color)] bg-[var(--bg-secondary)] text-[var(--text-muted)] hover:border-[var(--text-muted)] hover:text-[var(--text-primary)]"
                      )}
                    >
                      <item.icon size={18} />
                      <span className="text-[10px] font-bold uppercase tracking-wider">{item.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Editor Preferences */}
              <div className="space-y-4">
                <label className="text-[10px] font-bold uppercase tracking-widest text-[var(--text-muted)]">Editor</label>
                <div className="space-y-4 rounded-xl border border-[var(--border-color)] bg-[var(--bg-secondary)] p-4">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-medium text-[var(--text-primary)]">Font Size</span>
                    <div className="flex items-center gap-3">
                      <button 
                        onClick={() => setFontSize(Math.max(12, fontSize - 1))}
                        className="flex h-6 w-6 items-center justify-center rounded-md border border-[var(--border-color)] bg-[var(--bg-primary)] text-xs hover:bg-[var(--border-color)] text-[var(--text-primary)]"
                      >
                        -
                      </button>
                      <span className="w-6 text-center text-xs font-mono text-[var(--text-primary)]">{fontSize}</span>
                      <button 
                        onClick={() => setFontSize(Math.min(24, fontSize + 1))}
                        className="flex h-6 w-6 items-center justify-center rounded-md border border-[var(--border-color)] bg-[var(--bg-primary)] text-xs hover:bg-[var(--border-color)] text-[var(--text-primary)]"
                      >
                        +
                      </button>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-medium text-[var(--text-primary)]">Spell Check</span>
                    <button className="relative h-5 w-9 rounded-full bg-[var(--accent-color)] p-0.5 transition-colors">
                      <div className="h-4 w-4 translate-x-4 rounded-full bg-white shadow-sm transition-transform" />
                    </button>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-medium text-[var(--text-primary)]">Expand Calendar on Start</span>
                    <button 
                      onClick={() => {
                        const newValue = !defaultCalendarExpanded;
                        setDefaultCalendarExpanded(newValue);
                        localStorage.setItem('nova-calendar-expanded', JSON.stringify(newValue));
                      }}
                      className={cn(
                        "relative h-5 w-9 rounded-full p-0.5 transition-colors",
                        defaultCalendarExpanded ? "bg-[var(--accent-color)]" : "bg-[var(--border-color)]"
                      )}
                    >
                      <div className={cn(
                        "h-4 w-4 rounded-full bg-white shadow-sm transition-transform",
                        defaultCalendarExpanded ? "translate-x-4" : "translate-x-0"
                      )} />
                    </button>
                  </div>
                </div>
              </div>

              {/* Storage Info */}
              <div className="space-y-3">
                <label className="text-[10px] font-bold uppercase tracking-widest text-[var(--text-muted)]">Storage</label>
                
                {/* Library Location */}
                <div className="flex items-center justify-between rounded-xl border border-[var(--border-color)] bg-[var(--bg-secondary)] p-4 mb-3">
                  <div className="flex items-center gap-3">
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[var(--accent-soft)] text-[var(--accent-color)]">
                      <FolderIcon size={16} />
                    </div>
                    <div>
                      <p className="text-xs font-medium text-[var(--text-primary)]">Library Location</p>
                      <p className="text-[10px] text-[var(--text-muted)] truncate max-w-[150px]">
                        {libraryPath ? libraryPath : 'No folder selected'}
                      </p>
                    </div>
                  </div>
                  <button 
                    onClick={handleSelectLibraryLocation}
                    className="text-[10px] font-bold uppercase tracking-widest text-[var(--accent-color)] hover:text-[var(--text-primary)] transition-colors"
                  >
                    Change
                  </button>
                </div>
                {libraryPath && (
                  <button 
                    onClick={syncToLocalDisk}
                    className="w-full rounded-xl border border-[var(--border-color)] bg-[var(--bg-secondary)] py-2 text-xs font-bold uppercase tracking-widest text-[var(--text-primary)] hover:bg-[var(--border-color)] transition-all"
                  >
                    Sync Now
                  </button>
                )}
              </div>
            </div>

            <div className="border-t border-white/5 bg-white/[0.02] px-6 py-4">
              <button 
                onClick={() => setShowSettings(false)}
                className="w-full rounded-xl bg-[var(--accent-color)] py-2 text-xs font-bold uppercase tracking-widest text-white hover:opacity-90 transition-all shadow-lg shadow-[var(--accent-color)]/20"
              >
                Done
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};