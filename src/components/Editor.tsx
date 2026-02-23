import React from 'react';
import Markdown from 'react-markdown';
import {
  Bold,
  Italic,
  List,
  Heading1,
  Code,
  Link as LinkIcon,
  Undo,
  Redo,
  Search,
  X,
  FileText,
  FilePlus,
} from 'lucide-react';
import { cn } from '../lib/utils';
import { Document } from '../types';
import { Tooltip } from './Tooltip';

interface EditorProps {
  activeDoc: Document | null;
  viewMode: 'editor' | 'preview' | 'split';
  showLocalSearch: boolean;
  setShowLocalSearch: (show: boolean) => void;
  localSearchInputRef: React.RefObject<HTMLInputElement>;
  localSearchQuery: string;
  setLocalSearchQuery: (query: string) => void;
  textareaRef: React.RefObject<HTMLTextAreaElement>;
  fontSize: number;
  handleUpdateContent: (content: string, fromHistory?: boolean) => void;
  handleFormat: (type: 'bold' | 'italic' | 'heading' | 'list' | 'link' | 'code') => void;
  history: { [docId: string]: string[] };
  historyIndex: { [docId: string]: number };
  activeId: string | null;
  handleUndo: () => void;
  handleRedo: () => void;
  handleCreateDoc: () => void;
}

export const Editor = ({
  activeDoc,
  viewMode,
  showLocalSearch,
  setShowLocalSearch,
  localSearchInputRef,
  localSearchQuery,
  setLocalSearchQuery,
  textareaRef,
  fontSize,
  handleUpdateContent,
  handleFormat,
  history,
  historyIndex,
  activeId,
  handleUndo,
  handleRedo,
  handleCreateDoc,
}: EditorProps) => {
  return (
    <div className="flex flex-1 flex-col overflow-hidden">
      {activeDoc ? (
        <div className="flex flex-1 overflow-hidden">
          {/* Editor Pane */}
          {(viewMode === 'editor' || viewMode === 'split') && (
            <div className={cn(
              "flex flex-col overflow-hidden relative",
              viewMode === 'split' ? "w-1/2 border-r border-[var(--border-color)]" : "w-full"
            )}>
              {showLocalSearch && (
                <div className="absolute top-4 right-4 z-20 flex items-center gap-2 bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-lg p-1.5 shadow-lg">
                  <Search size={14} className="text-[var(--text-muted)] ml-2" />
                  <input
                    ref={localSearchInputRef}
                    type="text"
                    placeholder="Find in document..."
                    value={localSearchQuery}
                    onChange={(e) => {
                      setLocalSearchQuery(e.target.value);
                      // Basic highlighting could be added here, but for now we just find
                      if (textareaRef.current && e.target.value) {
                        const text = textareaRef.current.value.toLowerCase();
                        const index = text.indexOf(e.target.value.toLowerCase());
                        if (index !== -1) {
                          textareaRef.current.focus();
                          textareaRef.current.setSelectionRange(index, index + e.target.value.length);
                        }
                      }
                    }}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && textareaRef.current && localSearchQuery) {
                        const text = textareaRef.current.value.toLowerCase();
                        const currentPos = textareaRef.current.selectionEnd;
                        let index = text.indexOf(localSearchQuery.toLowerCase(), currentPos);
                        if (index === -1) {
                          // Wrap around
                          index = text.indexOf(localSearchQuery.toLowerCase());
                        }
                        if (index !== -1) {
                          textareaRef.current.focus();
                          textareaRef.current.setSelectionRange(index, index + localSearchQuery.length);
                        }
                      }
                    }}
                    className="bg-transparent border-none outline-none text-sm text-[var(--text-primary)] w-48 px-2"
                  />
                  <button
                    onClick={() => {
                      setShowLocalSearch(false);
                      setLocalSearchQuery('');
                      textareaRef.current?.focus();
                    }}
                    className="p-1 hover:bg-[var(--border-color)] rounded text-[var(--text-muted)]"
                  >
                    <X size={14} />
                  </button>
                </div>
              )}
              <textarea
                ref={textareaRef}
                value={activeDoc.content}
                onChange={(e) => handleUpdateContent(e.target.value)}
                placeholder="Start writing..."
                style={{ fontSize: `${fontSize}px` }}
                className="flex-1 resize-none bg-transparent p-8 font-mono leading-relaxed text-[var(--text-primary)] outline-none placeholder:text-[var(--text-muted)]"
                spellCheck={false}
              />
              {/* Formatting Bar */}
              <div className="flex items-center gap-1 border-t border-[var(--border-color)] px-4 py-2 bg-[var(--bg-secondary)]">
                <Tooltip text="Bold">
                  <button onClick={() => handleFormat('bold')} className="p-1.5 rounded hover:bg-[var(--border-color)] text-[var(--text-muted)]"><Bold size={16} /></button>
                </Tooltip>
                <Tooltip text="Italic">
                  <button onClick={() => handleFormat('italic')} className="p-1.5 rounded hover:bg-[var(--border-color)] text-[var(--text-muted)]"><Italic size={16} /></button>
                </Tooltip>
                <Tooltip text="Heading">
                  <button onClick={() => handleFormat('heading')} className="p-1.5 rounded hover:bg-[var(--border-color)] text-[var(--text-muted)]"><Heading1 size={16} /></button>
                </Tooltip>
                <div className="w-px h-4 bg-[var(--border-color)] mx-1" />
                <Tooltip text="List">
                  <button onClick={() => handleFormat('list')} className="p-1.5 rounded hover:bg-[var(--border-color)] text-[var(--text-muted)]"><List size={16} /></button>
                </Tooltip>
                <Tooltip text="Link">
                  <button onClick={() => handleFormat('link')} className="p-1.5 rounded hover:bg-[var(--border-color)] text-[var(--text-muted)]"><LinkIcon size={16} /></button>
                </Tooltip>
                <Tooltip text="Code">
                  <button onClick={() => handleFormat('code')} className="p-1.5 rounded hover:bg-[var(--border-color)] text-[var(--text-muted)]"><Code size={16} /></button>
                </Tooltip>
                <div className="w-px h-4 bg-[var(--border-color)] mx-1" />
                <Tooltip text="Undo (CMD+Z)">
                  <button onClick={handleUndo} disabled={(historyIndex[activeId ?? ''] ?? 0) <= 0} className="p-1.5 rounded hover:bg-[var(--border-color)] text-[var(--text-muted)] disabled:opacity-50 disabled:cursor-not-allowed"><Undo size={16} /></button>
                </Tooltip>
                <Tooltip text="Redo (CMD+SHIFT+Z)">
                  <button onClick={handleRedo} disabled={(historyIndex[activeId ?? ''] ?? -1) >= (history[activeId ?? '']?.length ?? 0) - 1} className="p-1.5 rounded hover:bg-[var(--border-color)] text-[var(--text-muted)] disabled:opacity-50 disabled:cursor-not-allowed"><Redo size={16} /></button>
                </Tooltip>
              </div>
            </div>
          )}

          {/* Preview Pane */}
          {(viewMode === 'preview' || viewMode === 'split') && (
            <div className={cn(
              "flex-1 overflow-y-auto bg-[var(--bg-secondary)] p-8",
              viewMode === 'split' ? "w-1/2" : "w-full"
            )}>
              <div className="markdown-body mx-auto max-w-2xl">
                <Markdown>{activeDoc.content || '*No content to preview*'}</Markdown>
              </div>
            </div>
          )}
        </div>
      ) : (
        <div className="flex flex-1 flex-col items-center justify-center text-[var(--text-muted)] space-y-4">
          <div className="rounded-2xl bg-[var(--bg-secondary)] p-6">
            <FileText size={48} strokeWidth={1} />
          </div>
          <div className="text-center">
            <h3 className="text-lg font-medium text-[var(--text-primary)]">No Document Selected</h3>
            <p className="text-sm">Select a document from the sidebar or create a new one.</p>
          </div>
          <button
            onClick={() => handleCreateDoc()}
            className="flex items-center gap-2 rounded-full bg-[var(--accent-color)] px-6 py-2 text-sm font-medium text-white hover:opacity-90 transition-all shadow-md"
          >
            <FilePlus size={16} />
            Create New Document
          </button>
        </div>
      )}
    </div>
  );
};