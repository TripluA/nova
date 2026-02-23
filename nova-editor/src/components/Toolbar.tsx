import React from 'react';
import {
  Type,
  Eye,
  Layout,
  Sidebar as SidebarIcon,
  FileText,
  Calendar as CalendarIcon,
  Check,
  Loader2,
  X,
} from 'lucide-react';
import { Tooltip } from './Tooltip';
import { cn } from '../lib/utils';
import { Document } from '../types';

interface ToolbarProps {
  showSidebar: boolean;
  setShowSidebar: (show: boolean) => void;
  viewMode: 'editor' | 'preview' | 'split';
  setViewMode: (mode: 'editor' | 'preview' | 'split') => void;
  showCalendar: boolean;
  setShowCalendar: (show: boolean) => void;
  saveStatus: 'saved' | 'saving' | 'error';
  openTabs: string[];
  documents: Document[];
  activeId: string | null;
  handleSetActiveId: (id: string) => void;
  handleCloseTab: (id: string, e: React.MouseEvent) => void;
}

export const Toolbar = ({
  showSidebar,
  setShowSidebar,
  viewMode,
  setViewMode,
  showCalendar,
  setShowCalendar,
  saveStatus,
  openTabs,
  documents,
  activeId,
  handleSetActiveId,
  handleCloseTab,
}: ToolbarProps) => {
  return (
    <header className="flex flex-col border-b border-[var(--border-color)] bg-[var(--bg-primary)]/80 backdrop-blur-md sticky top-0 z-10">
      <div className="flex h-12 items-center justify-between px-4">
        <div className="flex items-center gap-4">
          <Tooltip text="Toggle Sidebar">
            <button
              onClick={() => setShowSidebar(!showSidebar)}
              className="rounded-md p-1.5 hover:bg-[var(--border-color)] transition-colors text-[var(--text-secondary)]"
            >
              <SidebarIcon size={18} />
            </button>
          </Tooltip>
        </div>

        <div className="flex items-center gap-6">
          <div className="flex items-center gap-1">
            <Tooltip text="Editor">
              <button
                onClick={() => setViewMode('editor')}
                className={cn(
                  "rounded-md p-1.5 transition-all",
                  viewMode === 'editor' ? "bg-[var(--accent-soft)] text-[var(--accent-color)]" : "text-[var(--text-secondary)] hover:bg-[var(--border-color)]"
                )}
              >
                <Type size={18} />
              </button>
            </Tooltip>
            <Tooltip text="Split view">
              <button
                onClick={() => setViewMode('split')}
                className={cn(
                  "rounded-md p-1.5 transition-all",
                  viewMode === 'split' ? "bg-[var(--accent-soft)] text-[var(--accent-color)]" : "text-[var(--text-secondary)] hover:bg-[var(--border-color)]"
                )}
              >
                <Layout size={18} />
              </button>
            </Tooltip>
            <Tooltip text="Preview">
              <button
                onClick={() => setViewMode('preview')}
                className={cn(
                  "rounded-md p-1.5 transition-all",
                  viewMode === 'preview' ? "bg-[var(--accent-soft)] text-[var(--accent-color)]" : "text-[var(--text-secondary)] hover:bg-[var(--border-color)]"
                )}
              >
                <Eye size={18} />
              </button>
            </Tooltip>
          </div>

          <div className="h-4 w-px bg-[var(--border-color)]" />

          <Tooltip text="Calendar">
            <button
              onClick={() => setShowCalendar(!showCalendar)}
              className={cn(
                "rounded-md p-1.5 transition-all",
                showCalendar ? "bg-[var(--accent-soft)] text-[var(--accent-color)]" : "text-[var(--text-secondary)] hover:bg-[var(--border-color)]"
              )}
            >
              <CalendarIcon size={18} />
            </button>
          </Tooltip>

          {/* Auto-save status */}
          <div className="flex items-center gap-2 text-[11px] font-medium text-[var(--text-muted)]">
            {saveStatus === 'saving' ? (
              <>
                <Loader2 size={12} className="animate-spin" />
                <span>Saving...</span>
              </>
            ) : (
              <>
                <Check size={12} className="text-green-500" />
                <span>Saved</span>
              </>
            )}
          </div>
        </div>
      </div>
      {/* File Tabs */}
      <div className="flex items-center border-t border-[var(--border-color)] bg-[var(--bg-secondary)]/50 h-10 px-2 overflow-x-auto">
        {openTabs.map((tabId, index) => {
          const doc = documents.find(d => d.id === tabId);
          if (!doc) return null;
          return (
            <div
              key={tabId}
              onClick={() => handleSetActiveId(tabId)}
              className={cn(
                "flex items-center gap-2 px-3 py-1.5 border-r border-[var(--border-color)] text-xs cursor-pointer whitespace-nowrap",
                activeId === tabId ? "bg-[var(--bg-primary)] text-[var(--text-primary)] font-medium" : "text-[var(--text-muted)] hover:bg-[var(--bg-primary)]"
              )}
            >
              <FileText size={14} />
              <span>{doc.title}</span>
              <button
                onClick={(e) => handleCloseTab(tabId, e)}
                className="p-0.5 rounded hover:bg-[var(--border-color)]"
              >
                <X size={12} />
              </button>
            </div>
          );
        })}
      </div>
    </header>
  );
};