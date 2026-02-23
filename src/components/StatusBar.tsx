import React, { useEffect, useState } from 'react';
import { useAppContext } from '../context/AppContext';

interface StatusBarProps {
  stats: {
    words: number;
    chars: number;
    readingTime: number;
  };
}

export const StatusBar = ({ stats }: StatusBarProps) => {
  const { saveStatus, dirHandle } = useAppContext();
  const [permission, setPermission] = useState<string>('prompt');

  useEffect(() => {
    if (dirHandle) {
      dirHandle.queryPermission({ mode: 'readwrite' }).then((perm: string) => {
        setPermission(perm);
      });
    }
  }, [dirHandle, saveStatus]);

  const requestPermission = async () => {
    if (dirHandle) {
      const newPerm = await dirHandle.requestPermission({ mode: 'readwrite' });
      setPermission(newPerm);
    }
  };

  return (
    <footer className="flex h-8 items-center justify-between border-t border-[var(--border-color)] bg-[var(--bg-primary)] px-4 text-[11px] font-medium text-[var(--text-secondary)]">
      <div className="flex items-center gap-4">
        <span>{stats.words} words</span>
        <span>{stats.chars} characters</span>
        <span>{stats.readingTime} min read</span>
      </div>
      <div className="flex items-center gap-4">
        {dirHandle && permission !== 'granted' && (
          <button onClick={requestPermission} className="text-red-500 hover:underline">
            Grant Folder Permission
          </button>
        )}
        <span className="capitalize">{saveStatus}</span>
        <span>UTF-8</span>
      </div>
    </footer>
  );
};