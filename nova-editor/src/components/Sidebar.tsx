import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Command,
  Search,
  X,
  Settings,
  Folder as FolderIcon,
  FileText,
  FilePlus,
  FolderPlus,
  Trash2,
  ChevronRight,
  ArrowDownAZ,
  ArrowUpAZ,
  Clock,
  Calendar as CalendarIcon,
} from 'lucide-react';
import { DndContext, DragOverlay, DragStartEvent, DragEndEvent, pointerWithin, useSensor, useSensors, PointerSensor, TouchSensor } from '@dnd-kit/core';
import { cn } from '../lib/utils';
import { Document, Folder } from '../types';
import { DraggableItem, DroppableFolder } from './dnd';
import { Tooltip } from './Tooltip';

interface SidebarProps {
  showSidebar: boolean;
  folders: Folder[];
  documents: Document[];
  activeId: string | null;
  sortOrder: 'a-z' | 'z-a' | 'date-newest' | 'date-oldest';
  setSortOrder: (order: 'a-z' | 'z-a' | 'date-newest' | 'date-oldest') => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  searchInputRef: React.RefObject<HTMLInputElement>;
  searchResults: Document[];
  handleSetActiveId: (id: string) => void;
  handleCreateFolder: (parentId: string | null) => void;
  handleCreateDoc: (folderId: string | null) => void;
  handleToggleFolder: (id: string) => void;
  handleDeleteDoc: (id: string, e: React.MouseEvent) => void;
  handleDeleteFolder: (id: string, e: React.MouseEvent) => void;
  handleContextMenu: (e: React.MouseEvent, type: 'folder' | 'document', id: string) => void;
  renamingId: string | null;
  renameValue: string;
  setRenameValue: (value: string) => void;
  handleRenameSave: () => void;
  handleRenameCancel: () => void;
  handleDragStart: (event: DragStartEvent) => void;
  handleDragEnd: (event: DragEndEvent) => void;
  activeDragId: string | null;
  setShowSettings: (show: boolean) => void;
}

export const Sidebar = ({ 
  showSidebar, 
  folders, 
  documents, 
  activeId, 
  sortOrder, 
  setSortOrder, 
  searchQuery, 
  setSearchQuery, 
  searchInputRef, 
  searchResults, 
  handleSetActiveId, 
  handleCreateFolder, 
  handleCreateDoc, 
  handleToggleFolder, 
  handleDeleteDoc, 
  handleDeleteFolder, 
  handleContextMenu, 
  renamingId, 
  renameValue, 
  setRenameValue, 
  handleRenameSave, 
  handleRenameCancel, 
  handleDragStart, 
  handleDragEnd, 
  activeDragId, 
  setShowSettings 
}: SidebarProps) => {

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(TouchSensor)
  );

  const sortItems = (a: any, b: any, type: 'folder' | 'document') => {
    if (sortOrder === 'a-z') {
      const nameA = type === 'folder' ? a.name : a.title;
      const nameB = type === 'folder' ? b.name : b.title;
      return nameA.localeCompare(nameB);
    }
    if (sortOrder === 'z-a') {
      const nameA = type === 'folder' ? a.name : a.title;
      const nameB = type === 'folder' ? b.name : b.title;
      return nameB.localeCompare(nameA);
    }
    if (sortOrder === 'date-newest') {
      return b.updatedAt - a.updatedAt;
    }
    if (sortOrder === 'date-oldest') {
      return a.updatedAt - b.updatedAt;
    }
    return 0;
  };

  const renderFolderTree = (parentId: string | null = null, level = 0) => {
    const currentFolders = folders
      .filter(f => (f.parentId || null) === parentId)
      .sort((a, b) => sortItems(a, b, 'folder'));
    const currentDocs = documents
      .filter(d => (d.folderId || null) === parentId)
      .sort((a, b) => sortItems(a, b, 'document'));

    return (
      <div className="space-y-0.5">
        {currentFolders.map(folder => (
          <DraggableItem key={folder.id} id={folder.id} data={{ type: 'folder', folder }}>
            <div className="space-y-0.5">
              <DroppableFolder id={folder.id} data={{ type: 'folder', folder }}>
                <div 
                  onClick={() => handleToggleFolder(folder.id)}
                  onContextMenu={(e) => handleContextMenu(e, 'folder', folder.id)}
                  className="group flex items-center justify-between rounded-lg px-2 py-1.5 text-[var(--text-muted)] hover:bg-[var(--border-color)] cursor-pointer transition-all"
                  style={{ paddingLeft: `${level * 12 + 8}px` }}
                >
                  <div className="flex items-center gap-2 overflow-hidden">
                    <div className={cn(
                      "transition-transform duration-300",
                      folder.isExpanded ? "rotate-90 text-[var(--accent-color)]" : "rotate-0"
                    )}>
                      <ChevronRight size={14} />
                    </div>
                    <FolderIcon size={14} className={folder.isExpanded ? "text-[var(--accent-color)]" : "text-[var(--text-muted)]"} />
                    {renamingId === folder.id ? (
                      <input
                        autoFocus
                        type="text"
                        value={renameValue}
                        onChange={(e) => setRenameValue(e.target.value)}
                        onBlur={handleRenameSave}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') handleRenameSave();
                          if (e.key === 'Escape') handleRenameCancel();
                        }}
                        onClick={(e) => e.stopPropagation()}
                        className="flex-1 bg-transparent text-[13px] font-medium outline-none border-b border-[var(--accent-color)] text-[var(--text-primary)] min-w-0"
                      />
                    ) : (
                      <span className={cn(
                        "text-[13px] font-medium truncate",
                        folder.isExpanded ? "text-[var(--text-primary)]" : "text-[var(--text-muted)]"
                      )}>{folder.name}</span>
                    )}
                  </div>
                  <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button 
                      onClick={(e) => { e.stopPropagation(); handleCreateFolder(folder.id); }}
                      className="p-1 hover:bg-[var(--border-color)] rounded text-[var(--text-muted)] hover:text-[var(--accent-color)]"
                      title="New Folder"
                    >
                      <FolderPlus size={12} />
                    </button>
                    <button 
                      onClick={(e) => { e.stopPropagation(); handleCreateDoc(folder.id); }}
                      className="p-1 hover:bg-[var(--border-color)] rounded text-[var(--text-muted)] hover:text-[var(--accent-color)]"
                      title="New Document"
                    >
                      <FilePlus size={12} />
                    </button>
                    <button 
                      onClick={(e) => handleDeleteFolder(folder.id, e)}
                      className="p-1 hover:bg-[var(--border-color)] rounded text-[var(--text-muted)] hover:text-red-400"
                      title="Delete Folder"
                    >
                      <Trash2 size={12} />
                    </button>
                  </div>
                </div>
              </DroppableFolder>
              
              <AnimatePresence initial={false}>
                {folder.isExpanded && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="overflow-hidden"
                  >
                    {renderFolderTree(folder.id, level + 1)}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </DraggableItem>
        ))}
        {currentDocs.map(doc => (
           <DraggableItem key={doc.id} id={doc.id} data={{ type: 'document', doc }}>
             <div
               onClick={() => handleSetActiveId(doc.id)}
               onContextMenu={(e) => handleContextMenu(e, 'document', doc.id)}
               className={cn(
                 "group relative flex w-full cursor-pointer items-center gap-2 rounded-md py-1.5 transition-all outline-none",
                 activeId === doc.id 
                   ? "bg-[var(--accent-soft)] text-[var(--text-primary)]" 
                   : "hover:bg-[var(--border-color)] text-[var(--text-secondary)]"
               )}
               style={{ paddingLeft: `${(level + 1) * 12 + 8}px` }}
             >
               <FileText size={14} className={activeId === doc.id ? "text-[var(--accent-color)]" : "text-[var(--text-muted)]"} />
               {renamingId === doc.id ? (
                 <input
                   autoFocus
                   type="text"
                   value={renameValue}
                   onChange={(e) => setRenameValue(e.target.value)}
                   onBlur={handleRenameSave}
                   onKeyDown={(e) => {
                     if (e.key === 'Enter') handleRenameSave();
                     if (e.key === 'Escape') handleRenameCancel();
                   }}
                   onClick={(e) => e.stopPropagation()}
                   className="flex-1 bg-transparent text-[13px] font-medium outline-none border-b border-[var(--accent-color)] text-[var(--text-primary)] min-w-0"
                 />
               ) : (
                 <span className={cn(
                   "text-[13px] font-medium truncate flex-1",
                   activeId === doc.id ? "text-[var(--text-primary)]" : "text-[var(--text-secondary)] group-hover:text-[var(--text-primary)]"
                 )}>
                   {doc.title || 'Untitled'}
                 </span>
               )}
               <button
                 onClick={(e) => handleDeleteDoc(doc.id, e)}
                 className="opacity-0 group-hover:opacity-100 transition-opacity p-1 rounded hover:bg-[var(--border-color)] text-[var(--text-muted)] hover:text-red-400"
               >
                 <Trash2 size={12} />
               </button>
             </div>
           </DraggableItem>
        ))}
      </div>
    );
  };

  return (
    <AnimatePresence initial={false}>
      {showSidebar && (
        <motion.aside
          initial={{ width: 0, opacity: 0 }}
          animate={{ width: 280, opacity: 1 }}
          exit={{ width: 0, opacity: 0 }}
          className="flex flex-col border-r border-[var(--border-color)] bg-[var(--bg-sidebar)]"
        >
          <DndContext sensors={sensors} collisionDetection={pointerWithin} onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
            {/* Sidebar Header */}
            <div className="flex items-center justify-between px-5 py-8">
              <div className="flex items-center gap-3">
                <div className="h-8 w-8 rounded-xl bg-gradient-to-br from-[var(--accent-color)] to-[var(--accent-color)] flex items-center justify-center shadow-[0_0_15px_var(--accent-soft)]">
                  <Command size={18} className="text-white" />
                </div>
                <span className="text-sm font-bold tracking-[0.15em] uppercase text-[var(--text-primary)]">Nova</span>
              </div>
              <div className="flex gap-2">
                <Tooltip text={`Sort: ${sortOrder === 'a-z' ? 'A-Z' : sortOrder === 'z-a' ? 'Z-A' : sortOrder === 'date-newest' ? 'Newest' : 'Oldest'}`}>
                  <button
                    onClick={() => {
                      const orders: ('a-z' | 'z-a' | 'date-newest' | 'date-oldest')[] = ['a-z', 'z-a', 'date-newest', 'date-oldest'];
                      const nextIndex = (orders.indexOf(sortOrder) + 1) % orders.length;
                      setSortOrder(orders[nextIndex]);
                    }}
                    className="flex items-center justify-center h-8 w-8 rounded-lg bg-[var(--bg-secondary)] border border-[var(--border-color)] text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:border-[var(--accent-color)] transition-all"
                  >
                    {sortOrder === 'a-z' && <ArrowDownAZ size={16} />}
                    {sortOrder === 'z-a' && <ArrowUpAZ size={16} />}
                    {sortOrder === 'date-newest' && <Clock size={16} />}
                    {sortOrder === 'date-oldest' && <CalendarIcon size={16} />}
                  </button>
                </Tooltip>
              </div>
            </div>

            {/* Quick Search Trigger */}
            <div className="px-4 mb-4">
              <div className="relative group">
                <input
                  ref={searchInputRef}
                  type="text"
                  placeholder="Search..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full rounded-xl bg-[var(--bg-secondary)] border border-[var(--border-color)] pl-10 pr-10 py-2.5 text-sm text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:border-[var(--accent-color)] outline-none transition-all"
                />
                <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--text-muted)] group-focus-within:text-[var(--accent-color)] transition-colors" />
                {searchQuery && (
                  <button 
                    onClick={() => setSearchQuery('')}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)] hover:text-[var(--text-primary)]"
                  >
                    <X size={14} />
                  </button>
                )}
              </div>
            </div>

            {/* Folder & Document List */}
            <div className="flex-1 overflow-y-auto px-3 py-4">
              {searchQuery ? (
                <div className="space-y-1">
                  <div className="px-2 pb-2 text-[10px] font-bold uppercase tracking-widest text-[var(--text-muted)]">
                    Search Results
                  </div>
                  {searchResults.length > 0 ? (
                    searchResults.map(doc => (
                      <button
                        key={doc.id}
                        onClick={() => handleSetActiveId(doc.id)}
                        className={cn(
                          "flex w-full items-center gap-2 rounded-lg px-2 py-1.5 text-left text-sm transition-colors",
                          activeId === doc.id ? "bg-[var(--accent-soft)] text-[var(--accent-color)]" : "text-[var(--text-secondary)] hover:bg-[var(--bg-secondary)] hover:text-[var(--text-primary)]"
                        )}
                      >
                        <FileText size={14} />
                        <span className="truncate">{doc.title}</span>
                      </button>
                    ))
                  ) : (
                    <div className="px-2 py-4 text-center text-xs text-[var(--text-muted)]">
                      No documents found
                    </div>
                  )}
                </div>
              ) : (
                <>
                  <DroppableFolder id="root-library" data={{ type: 'root' }} className="mb-4">
                <div 
                  className="px-2 flex items-center justify-between group"
                >
                  <div className="flex items-center gap-2 text-[var(--text-primary)]">
                    <FolderIcon size={16} className="text-[var(--accent-color)]" />
                    <span className="text-sm font-bold tracking-wide">Library</span>
                  </div>
                  <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button 
                      onClick={(e) => { e.stopPropagation(); handleCreateFolder(null); }}
                      className="p-1 hover:bg-[var(--border-color)] rounded text-[var(--text-muted)] hover:text-[var(--accent-color)] transition-all"
                      title="New Folder"
                    >
                      <FolderPlus size={14} />
                    </button>
                    <button 
                      onClick={(e) => { e.stopPropagation(); handleCreateDoc(null); }}
                      className="p-1 hover:bg-[var(--border-color)] rounded text-[var(--text-muted)] hover:text-[var(--accent-color)] transition-all"
                      title="New Document"
                    >
                      <FilePlus size={14} />
                    </button>
                  </div>
                </div>
              </DroppableFolder>
              {renderFolderTree(null)}
                </>
              )}
            </div>

            {/* Sidebar Footer */}
            <div className="p-6 border-t border-[var(--border-color)] flex items-center justify-between">
              <button 
                onClick={() => setShowSettings(true)}
                className="text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors"
              >
                <Settings size={18} />
              </button>
              <div className="flex items-center gap-2.5">
                <div className="h-1.5 w-1.5 rounded-full bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.5)]" />
                <span className="text-[10px] font-bold uppercase tracking-[0.15em] text-[var(--text-muted)]">v1.0.4</span>
              </div>
            </div>

            <DragOverlay>
              {activeDragId ? (
                <div className="bg-[var(--bg-secondary)] border border-[var(--border-color)] p-2 rounded shadow-lg opacity-90 backdrop-blur pointer-events-none">
                  <div className="flex items-center gap-2">
                    <FileText size={14} className="text-[var(--text-muted)]" />
                    <span className="text-xs font-medium text-[var(--text-primary)]">Moving item...</span>
                  </div>
                </div>
              ) : null}
            </DragOverlay>
          </DndContext>
        </motion.aside>
      )}
    </AnimatePresence>
  );
};