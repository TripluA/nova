import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '../lib/utils';
import { Document, Folder } from '../types';

interface ContextMenuProps {
  contextMenu: { x: number, y: number, type: 'folder' | 'document', id: string } | null;
  clipboard: { type: 'folder' | 'document', id: string, action: 'copy' | 'move' } | null;
  documents: Document[];
  handleCopy: () => void;
  handleCut: () => void;
  handlePaste: (targetFolderId: string | null) => void;
  handleRenameStart: () => void;
  handleDeleteFromContextMenu: () => void;
}

export const ContextMenu = ({ 
  contextMenu, 
  clipboard, 
  documents,
  handleCopy, 
  handleCut, 
  handlePaste, 
  handleRenameStart, 
  handleDeleteFromContextMenu 
}: ContextMenuProps) => {
  if (!contextMenu) return null;

  return (
    <AnimatePresence>
      {contextMenu && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="fixed z-50 w-48 rounded-lg border border-[var(--border-color)] bg-[var(--bg-secondary)] p-1 shadow-xl backdrop-blur-md"
          style={{ top: contextMenu.y, left: contextMenu.x }}
        >
          {contextMenu.id !== 'root' && (
            <>
              <button 
                onClick={handleCopy}
                className="flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-xs font-medium text-[var(--text-primary)] hover:bg-[var(--accent-color)] hover:text-white"
              >
                Copy
              </button>
              <button 
                onClick={handleCut}
                className="flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-xs font-medium text-[var(--text-primary)] hover:bg-[var(--accent-color)] hover:text-white"
              >
                Cut
              </button>
            </>
          )}
          {(contextMenu.type === 'folder' || contextMenu.type === 'document' || contextMenu.id === 'root') && (
            <button 
              onClick={() => {
                let targetId = contextMenu.id === 'root' ? null : contextMenu.id;
                if (contextMenu.type === 'document') {
                  const doc = documents.find(d => d.id === contextMenu.id);
                  targetId = doc?.folderId || null;
                }
                handlePaste(targetId);
              }}
              disabled={!clipboard}
              className={cn(
                "flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-xs font-medium transition-colors",
                clipboard 
                  ? "text-[var(--text-primary)] hover:bg-[var(--accent-color)] hover:text-white" 
                  : "text-[var(--text-muted)] opacity-50 cursor-not-allowed"
              )}
            >
              Paste
            </button>
          )}
          {contextMenu.id !== 'root' && (
            <>
              <button 
                onClick={handleRenameStart}
                className="flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-xs font-medium text-[var(--text-primary)] hover:bg-[var(--accent-color)] hover:text-white"
              >
                Rename
              </button>
              <div className="my-1 h-px bg-[var(--border-color)]" />
              <button 
                onClick={handleDeleteFromContextMenu}
                className="flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-xs font-medium text-red-500 hover:bg-red-500 hover:text-white"
              >
                Delete
              </button>
            </>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );
};