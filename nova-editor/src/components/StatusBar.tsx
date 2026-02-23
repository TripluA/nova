import React from 'react';

interface StatusBarProps {
  stats: {
    words: number;
    chars: number;
    readingTime: number;
  };
}

export const StatusBar = ({ stats }: StatusBarProps) => {
  return (
    <footer className="flex h-8 items-center justify-between border-t border-[var(--border-color)] bg-[var(--bg-primary)] px-4 text-[11px] font-medium text-[var(--text-secondary)]">
      <div className="flex items-center gap-4">
        <span>{stats.words} words</span>
        <span>{stats.chars} characters</span>
        <span>{stats.readingTime} min read</span>
      </div>
      <div className="flex items-center gap-4">
        <span>UTF-8</span>
      </div>
    </footer>
  );
};