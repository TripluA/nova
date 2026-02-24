import React, { createContext, useState, useEffect, useMemo, useRef, useContext, ReactNode } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { DragStartEvent, DragEndEvent } from '@dnd-kit/core';
import { get, set } from 'idb-keyval';
import { Document, Folder } from '../types';

interface AppContextType {
  folders: Folder[];
  setFolders: React.Dispatch<React.SetStateAction<Folder[]>>;
  documents: Document[];
  setDocuments: React.Dispatch<React.SetStateAction<Document[]>>;
  activeId: string | null;
  setActiveId: React.Dispatch<React.SetStateAction<string | null>>;
  openTabs: string[];
  setOpenTabs: React.Dispatch<React.SetStateAction<string[]>>;
  showSidebar: boolean;
  setShowSidebar: React.Dispatch<React.SetStateAction<boolean>>;
  showCalendar: boolean;
  setShowCalendar: React.Dispatch<React.SetStateAction<boolean>>;
  defaultCalendarExpanded: boolean;
  setDefaultCalendarExpanded: React.Dispatch<React.SetStateAction<boolean>>;
  sortOrder: 'a-z' | 'z-a' | 'date-newest' | 'date-oldest';
  setSortOrder: React.Dispatch<React.SetStateAction<'a-z' | 'z-a' | 'date-newest' | 'date-oldest'>>;
  viewMode: 'editor' | 'preview' | 'split';
  setViewMode: React.Dispatch<React.SetStateAction<'editor' | 'preview' | 'split'>>;
  searchQuery: string;
  setSearchQuery: React.Dispatch<React.SetStateAction<string>>;
  showSettings: boolean;
  setShowSettings: React.Dispatch<React.SetStateAction<boolean>>;
  theme: 'dark' | 'light' | 'system';
  setTheme: React.Dispatch<React.SetStateAction<'dark' | 'light' | 'system'>>;
  fontSize: number;
  setFontSize: React.Dispatch<React.SetStateAction<number>>;
  saveStatus: 'saved' | 'saving' | 'error';
  setSaveStatus: React.Dispatch<React.SetStateAction<'saved' | 'saving' | 'error'>>;
  libraryPath: string | null;
  setLibraryPath: React.Dispatch<React.SetStateAction<string | null>>;
  dirHandle: any | null;
  setDirHandle: React.Dispatch<React.SetStateAction<any | null>>;
  activeDragId: string | null;
  setActiveDragId: React.Dispatch<React.SetStateAction<string | null>>;
  contextMenu: { x: number, y: number, type: 'folder' | 'document', id: string } | null;
  setContextMenu: React.Dispatch<React.SetStateAction<{ x: number, y: number, type: 'folder' | 'document', id: string } | null>>;
  clipboard: { type: 'folder' | 'document', id: string, action: 'copy' | 'move' } | null;
  setClipboard: React.Dispatch<React.SetStateAction<{ type: 'folder' | 'document', id: string, action: 'copy' | 'move' } | null>>;
  renamingId: string | null;
  setRenamingId: React.Dispatch<React.SetStateAction<string | null>>;
  renameValue: string;
  setRenameValue: React.Dispatch<React.SetStateAction<string>>;
  localSearchQuery: string;
  setLocalSearchQuery: React.Dispatch<React.SetStateAction<string>>;
  showLocalSearch: boolean;
  setShowLocalSearch: React.Dispatch<React.SetStateAction<boolean>>;
  localSearchInputRef: React.RefObject<HTMLInputElement>;
  history: { [docId: string]: string[] };
  setHistory: React.Dispatch<React.SetStateAction<{ [docId: string]: string[] }>>;
  historyIndex: { [docId: string]: number };
  setHistoryIndex: React.Dispatch<React.SetStateAction<{ [docId: string]: number }>>;
  searchInputRef: React.RefObject<HTMLInputElement>;
  textareaRef: React.RefObject<HTMLTextAreaElement>;
  isDescendant: (potentialAncestor: string, potentialDescendant: string) => boolean;
  handleDragStart: (event: DragStartEvent) => void;
  handleDragEnd: (event: DragEndEvent) => void;
  handleFormat: (type: 'bold' | 'italic' | 'heading' | 'list' | 'link' | 'code') => void;
  handleSetActiveId: (id: string) => void;
  handleDateSelect: (dateStr: string) => void;
  handleUndo: () => void;
  handleRedo: () => void;
  handleContextMenu: (e: React.MouseEvent, type: 'folder' | 'document', id: string) => void;
  closeContextMenu: () => void;
  handleCopy: () => void;
  handleCut: () => void;
  handlePaste: (targetFolderId: string | null) => void;
  handleDeleteFromContextMenu: () => void;
  handleRenameStart: () => void;
  handleRenameSave: () => void;
  handleRenameCancel: () => void;
  handleSelectLibraryLocation: () => Promise<void>;
  syncToLocalDisk: () => Promise<void>;
  activeDoc: Document | null;
  activeFolder: Folder | null;
  handleCreateFolder: (parentId?: string | null) => void;
  handleToggleFolder: (id: string) => void;
  handleCreateDoc: (folderId?: string | null) => void;
  handleDeleteDoc: (id: string, e: React.MouseEvent) => void;
  handleDeleteFolder: (id: string, e: React.MouseEvent) => void;
  handleUpdateContent: (content: string, fromHistory?: boolean) => void;
  handleCloseTab: (id: string, e: React.MouseEvent) => void;
  stats: { words: number; chars: number; readingTime: number };
  searchResults: Document[];
}

const AppContext = createContext<AppContextType | undefined>(undefined);

const DEFAULT_CONTENT = `# Welcome to Nova Editor\n\nNova is a minimalist, macOS-inspired Markdown editor designed for focused writing.\n\n## Features\n- **Real-time Preview**: See your changes as you type.\n- **macOS Aesthetic**: Clean, modern interface with a native feel.\n- **Local Storage**: Your documents are saved automatically.\n- **Word Count**: Keep track of your writing progress.\n\n### Getting Started\nTry editing this text! You can use standard Markdown syntax:\n- **Bold** and *Italic*\n- [Links](https://google.com)\n- \`Inline code\`\n- Code blocks\n\n> "Writing is the painting of the voice." — Voltaire\n\nEnjoy your writing session!\n`;

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [folders, setFolders] = useState<Folder[]>([]);
  const [documents, setDocuments] = useState<Document[]>([]);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [openTabs, setOpenTabs] = useState<string[]>([]);
  const [showSidebar, setShowSidebar] = useState(true);
  const [showCalendar, setShowCalendar] = useState(false);
  const [defaultCalendarExpanded, setDefaultCalendarExpanded] = useState(false);
  const [sortOrder, setSortOrder] = useState<'a-z' | 'z-a' | 'date-newest' | 'date-oldest'>('a-z');
  const [viewMode, setViewMode] = useState<'editor' | 'preview' | 'split'>('split');
  const [searchQuery, setSearchQuery] = useState('');
  const [showSettings, setShowSettings] = useState(false);
  const [theme, setTheme] = useState<'dark' | 'light' | 'system'>('dark');
  const [fontSize, setFontSize] = useState(12);
  const [saveStatus, setSaveStatus] = useState<'saved' | 'saving' | 'error'>('saved');
  const [libraryPath, setLibraryPath] = useState<string | null>(null);
  const [dirHandle, setDirHandle] = useState<any | null>(null);
  const [activeDragId, setActiveDragId] = useState<string | null>(null);
  const [contextMenu, setContextMenu] = useState<{ x: number, y: number, type: 'folder' | 'document', id: string } | null>(null);
  const [clipboard, setClipboard] = useState<{ type: 'folder' | 'document', id: string, action: 'copy' | 'move' } | null>(null);
  const [renamingId, setRenamingId] = useState<string | null>(null);
  const [renameValue, setRenameValue] = useState('');
  const [localSearchQuery, setLocalSearchQuery] = useState('');
  const [showLocalSearch, setShowLocalSearch] = useState(false);
  const localSearchInputRef = useRef<HTMLInputElement>(null);
  const [history, setHistory] = useState<{ [docId: string]: string[] }>({});
  const [historyIndex, setHistoryIndex] = useState<{ [docId: string]: number }>({});
  const searchInputRef = useRef<HTMLInputElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const isDescendant = (potentialAncestor: string, potentialDescendant: string) => {
    if (potentialAncestor === potentialDescendant) return true;
    const descendant = folders.find(f => f.id === potentialDescendant);
    if (!descendant || !descendant.parentId) return false;
    return isDescendant(potentialAncestor, descendant.parentId);
  };

  const handleDragStart = (event: DragStartEvent) => {
    setActiveDragId(event.active.id as string);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveDragId(null);

    if (!over) return;

    const activeId = active.id as string;
    const overId = over.id as string;
    
    if (activeId === overId) return;

    const activeType = active.data.current?.type;
    const overType = over.data.current?.type;

    // Move document to folder or root
    if (activeType === 'document' && (overType === 'folder' || overType === 'root')) {
       const doc = documents.find(d => d.id === activeId);
       const targetFolderId = overType === 'root' ? null : overId;
       
       if (doc && doc.folderId === targetFolderId) return;

       setDocuments(prev => prev.map(d => 
         d.id === activeId ? { ...d, folderId: targetFolderId } : d
       ));
       
       if (targetFolderId) {
         setFolders(prev => prev.map(f => f.id === targetFolderId ? { ...f, isExpanded: true } : f));
       }
    }
    
    // Move folder to folder or root
    if (activeType === 'folder' && (overType === 'folder' || overType === 'root')) {
      const targetParentId = overType === 'root' ? null : overId;
      
      if (targetParentId && isDescendant(activeId, targetParentId)) {
        return;
      }
      
      const folder = folders.find(f => f.id === activeId);
      if (folder && folder.parentId === targetParentId) return;

      setFolders(prev => prev.map(f => 
        f.id === activeId ? { ...f, parentId: targetParentId } : 
        (f.id === targetParentId ? { ...f, isExpanded: true } : f)
      ));
    }
  };

  const handleFormat = (type: 'bold' | 'italic' | 'heading' | 'list' | 'link' | 'code') => {
    if (!textareaRef.current || !activeDoc) return;

    const textarea = textareaRef.current;
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const text = textarea.value;
    const selectedText = text.substring(start, end);
    
    let newText = text;
    let newCursorPos = end;

    switch (type) {
      case 'bold':
        newText = text.substring(0, start) + `**${selectedText || 'bold text'}**` + text.substring(end);
        newCursorPos = end + 4 + (selectedText ? 0 : 9); // Adjust cursor position
        break;
      case 'italic':
        newText = text.substring(0, start) + `*${selectedText || 'italic text'}*` + text.substring(end);
        newCursorPos = end + 2 + (selectedText ? 0 : 11);
        break;
      case 'heading':
        const lineStart = text.lastIndexOf('\n', start - 1) + 1;
        newText = text.substring(0, lineStart) + '# ' + text.substring(lineStart);
        newCursorPos = end + 2;
        break;
      case 'list':
        const listLineStart = text.lastIndexOf('\n', start - 1) + 1;
        newText = text.substring(0, listLineStart) + '- ' + text.substring(listLineStart);
        newCursorPos = end + 2;
        break;
      case 'link':
        newText = text.substring(0, start) + `[${selectedText || 'link text'}](url)` + text.substring(end);
        newCursorPos = end + 3 + (selectedText ? 0 : 9);
        break;
      case 'code':
        newText = text.substring(0, start) + `\`${selectedText || 'code'}\`` + text.substring(end);
        newCursorPos = end + 2 + (selectedText ? 0 : 4);
        break;
    }

    handleUpdateContent(newText);
    
    // Restore focus and cursor
    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(newCursorPos, newCursorPos);
    }, 0);
  };

  const handleSetActiveId = (id: string) => {
    setActiveId(id);
    if (!openTabs.includes(id)) {
      setOpenTabs([...openTabs, id]);
    }
  };

  const handleDateSelect = (dateStr: string) => {
    // Check if document already exists
    const existingDoc = documents.find(d => d.title === dateStr && d.folderId === null);
    
    if (existingDoc) {
      handleSetActiveId(existingDoc.id);
    } else {
      // Create new document
      const newDoc: Document = {
        id: uuidv4(),
        title: dateStr,
        content: `# ${dateStr}\n\n`,
        updatedAt: Date.now(),
        folderId: null,
      };
      setDocuments([newDoc, ...documents]);
      handleSetActiveId(newDoc.id);
    }
  };

  // Theme management
  useEffect(() => {
    const root = window.document.documentElement;
    root.classList.remove('light', 'dark');

    if (theme === 'system') {
      const systemTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
      root.classList.add(systemTheme);
    } else {
      root.classList.add(theme);
    }
  }, [theme]);

  // Load data from localStorage
  useEffect(() => {
    const savedDocs = localStorage.getItem('nova-documents');
    const savedFolders = localStorage.getItem('nova-folders');
    const savedLibraryPath = localStorage.getItem('nova-library-path');
    const savedCalendarExpanded = localStorage.getItem('nova-calendar-expanded');
    
    if (savedLibraryPath) {
      setLibraryPath(savedLibraryPath);
    }

    get('nova-library-handle').then(handle => {
      if (handle) {
        setDirHandle(handle);
      }
    });

    if (savedCalendarExpanded) {
      try {
        const isExpanded = JSON.parse(savedCalendarExpanded);
        setDefaultCalendarExpanded(isExpanded);
        setShowCalendar(isExpanded);
      } catch (error) {
        console.error("Failed to parse saved calendar expanded state:", error);
        setDefaultCalendarExpanded(false);
        setShowCalendar(false);
      }
    }
    
    if (savedDocs) {
      try {
        const parsedDocs = JSON.parse(savedDocs);
        setDocuments(parsedDocs);
        if (parsedDocs.length > 0) handleSetActiveId(parsedDocs[0].id);
      } catch (error) {
        console.error("Failed to parse saved documents:", error);
        const initialDoc: Document = {
          id: '1',
          title: 'Welcome to Nova',
          content: DEFAULT_CONTENT,
          updatedAt: Date.now(),
          folderId: null,
        };
        setDocuments([initialDoc]);
        handleSetActiveId(initialDoc.id);
      }
    } else {
      const initialDoc: Document = {
        id: '1',
        title: 'Welcome to Nova',
        content: DEFAULT_CONTENT,
        updatedAt: Date.now(),
        folderId: null,
      };
      setDocuments([initialDoc]);
      handleSetActiveId(initialDoc.id);
    }

    if (savedFolders) {
      try {
        setFolders(JSON.parse(savedFolders));
      } catch (error) {
        console.error("Failed to parse saved folders:", error);
        setFolders([]);
      }
    }
  }, []);

  const handleUndo = () => {
    if (!activeId) return;
    const docHistory = history[activeId] || [];
    const currentHistoryIndex = historyIndex[activeId] ?? 0;

    if (currentHistoryIndex > 0) {
      const newIndex = currentHistoryIndex - 1;
      setHistoryIndex(prev => ({ ...prev, [activeId]: newIndex }));
      handleUpdateContent(docHistory[newIndex], true);
    }
  };

  const handleRedo = () => {
    if (!activeId) return;
    const docHistory = history[activeId] || [];
    const currentHistoryIndex = historyIndex[activeId] ?? -1;

    if (currentHistoryIndex < docHistory.length - 1) {
      const newIndex = currentHistoryIndex + 1;
      setHistoryIndex(prev => ({ ...prev, [activeId]: newIndex }));
      handleUpdateContent(docHistory[newIndex], true);
    }
  };

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.shiftKey && e.key.toLowerCase() === 'f') {
        e.preventDefault();
        setShowSidebar(true);
        setTimeout(() => searchInputRef.current?.focus(), 100);
      } else if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'f') {
        e.preventDefault();
        setShowLocalSearch(true);
        setTimeout(() => localSearchInputRef.current?.focus(), 100);
      } else if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'z') {
        e.preventDefault();
        if (e.shiftKey) {
          handleRedo();
        } else {
          handleUndo();
        }
      }
      if (e.key === 'Escape') {
        setShowLocalSearch(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Context Menu Handlers
  const handleContextMenu = (e: React.MouseEvent, type: 'folder' | 'document', id: string) => {
    e.preventDefault();
    setContextMenu({ x: e.clientX, y: e.clientY, type, id });
  };

  const closeContextMenu = () => setContextMenu(null);

  useEffect(() => {
    const handleClick = () => closeContextMenu();
    window.addEventListener('click', handleClick);
    return () => window.removeEventListener('click', handleClick);
  }, []);

  const handleCopy = () => {
    if (!contextMenu) return;
    setClipboard({ type: contextMenu.type, id: contextMenu.id, action: 'copy' });
    closeContextMenu();
  };

  const handleCut = () => {
    if (!contextMenu) return;
    setClipboard({ type: contextMenu.type, id: contextMenu.id, action: 'move' });
    closeContextMenu();
  };

  const handlePaste = (targetFolderId: string | null) => {
    if (!clipboard) return;

    if (clipboard.action === 'move') {
      if (clipboard.type === 'document') {
        setDocuments(prev => prev.map(d => d.id === clipboard.id ? { ...d, folderId: targetFolderId } : d));
      } else if (clipboard.type === 'folder') {
        if (clipboard.id === targetFolderId || isDescendant(clipboard.id, targetFolderId || '')) return;
        setFolders(prev => prev.map(f => f.id === clipboard.id ? { ...f, parentId: targetFolderId } : f));
      }
      setClipboard(null);
    } else if (clipboard.action === 'copy') {
      if (clipboard.type === 'document') {
        const docToCopy = documents.find(d => d.id === clipboard.id);
        if (docToCopy) {
          const newDoc: Document = {
            ...docToCopy,
            id: uuidv4(),
            title: `${docToCopy.title} (Copy)`,
            folderId: targetFolderId,
            updatedAt: Date.now()
          };
          setDocuments(prev => [...prev, newDoc]);
        }
      } else if (clipboard.type === 'folder') {
        // Deep copy folder logic would go here - simplified for now to just alert
        alert('Folder copy not fully implemented yet');
      }
    }
    closeContextMenu();
  };

  const handleDeleteFromContextMenu = () => {
    if (!contextMenu) return;
    if (contextMenu.type === 'document') {
      // @ts-ignore
      handleDeleteDoc(contextMenu.id, { stopPropagation: () => {} } as React.MouseEvent);
    } else {
      // @ts-ignore
      handleDeleteFolder(contextMenu.id, { stopPropagation: () => {} } as React.MouseEvent);
    }
    closeContextMenu();
  };

  const handleRenameStart = () => {
    if (!contextMenu) return;
    setRenamingId(contextMenu.id);
    if (contextMenu.type === 'folder') {
      const folder = folders.find(f => f.id === contextMenu.id);
      if (folder) setRenameValue(folder.name);
    }
 else {
      const doc = documents.find(d => d.id === contextMenu.id);
      if (doc) setRenameValue(doc.title);
    }
    closeContextMenu();
  };

  const handleRenameSave = () => {
    if (!renamingId) return;
    
    const folder = folders.find(f => f.id === renamingId);
    if (folder) {
      setFolders(prev => prev.map(f => f.id === renamingId ? { ...f, name: renameValue } : f));
    }
 else {
      const doc = documents.find(d => d.id === renamingId);
      if (doc) {
        setDocuments(prev => prev.map(d => d.id === renamingId ? { ...d, title: renameValue } : d));
      }
    }
    setRenamingId(null);
    setRenameValue('');
  };

  const handleRenameCancel = () => {
    setRenamingId(null);
    setRenameValue('');
  };

  const handleSelectLibraryLocation = async () => {
    try {
      if ('showDirectoryPicker' in window) {
        // @ts-ignore - File System Access API
        const handle = await window.showDirectoryPicker({ mode: 'readwrite' });
        setLibraryPath(handle.name);
        setDirHandle(handle);
        localStorage.setItem('nova-library-path', handle.name);
        await set('nova-library-handle', handle);
        
        // Force a sync immediately after selecting
        setTimeout(() => {
          syncToLocalDisk();
        }, 500);
      }
 else {
        alert('File System Access API is not supported in this browser.');
      }
    }
 catch (err) {
      // User cancelled or error occurred
      console.log('Folder selection cancelled or failed', err);
    }
  };

  const syncToLocalDisk = async () => {
    if (!dirHandle) {
      alert("No library folder selected.");
      return;
    }
    
    try {
      if (await dirHandle.queryPermission({ mode: 'readwrite' }) !== 'granted') {
        const perm = await dirHandle.requestPermission({ mode: 'readwrite' });
        if (perm !== 'granted') {
          alert("Permission to access the folder was denied.");
          return;
        }
      }
      
      setSaveStatus('saving');
      
      for (const doc of documents) {
        let currentDir = dirHandle;
        if (doc.folderId) {
          const folderPath = [];
          let currentFolderId: string | null | undefined = doc.folderId;
          while (currentFolderId) {
            const folder = folders.find(f => f.id === currentFolderId);
            if (folder) {
              folderPath.unshift(folder.name);
              currentFolderId = folder.parentId;
            } else {
              break;
            }
          }
          
          for (const folderName of folderPath) {
            const safeFolderName = folderName.replace(/[/\\?%*:|"<>]/g, '-');
            currentDir = await currentDir.getDirectoryHandle(safeFolderName, { create: true });
          }
        }
        
        const safeFileName = `${(doc.title || 'Untitled').replace(/[/\\?%*:|"<>]/g, '-')}.md`;
        
        // Handle renaming/moving
        if ((doc.lastSavedTitle && doc.lastSavedTitle !== doc.title) || 
            (doc.lastSavedFolderId !== undefined && doc.lastSavedFolderId !== doc.folderId)) {
          try {
            let oldDir = dirHandle;
            if (doc.lastSavedFolderId) {
              const oldFolderPath = [];
              let currentOldFolderId: string | null | undefined = doc.lastSavedFolderId;
              while (currentOldFolderId) {
                const folder = folders.find(f => f.id === currentOldFolderId);
                if (folder) {
                  oldFolderPath.unshift(folder.name);
                  currentOldFolderId = folder.parentId;
                } else {
                  break;
                }
              }
              for (const folderName of oldFolderPath) {
                const safeFolderName = folderName.replace(/[/\\?%*:|"<>]/g, '-');
                oldDir = await oldDir.getDirectoryHandle(safeFolderName, { create: false });
              }
            }
            const oldSafeFileName = `${(doc.lastSavedTitle || 'Untitled').replace(/[/\\?%*:|"<>]/g, '-')}.md`;
            await oldDir.removeEntry(oldSafeFileName);
          } catch (e) {
            // Ignore errors if old file doesn't exist
          }
        }

        const fileHandle = await currentDir.getFileHandle(safeFileName, { create: true });
        const writable = await fileHandle.createWritable();
        await writable.write(doc.content);
        await writable.close();
        
        // Update lastSaved properties
        doc.lastSavedTitle = doc.title;
        doc.lastSavedFolderId = doc.folderId;
      }
      
      setSaveStatus('saved');
      alert("Successfully synced to local folder!");
    } catch (err: any) {
      console.error("Failed to sync to local library", err);
      alert(`Failed to sync: ${err.message || 'Unknown error'}`);
      setSaveStatus('error');
    }
  };

  // Auto-save logic
  useEffect(() => {
    if (documents.length === 0) return;
    
    setSaveStatus('saving');
    const timer = setTimeout(async () => {
      localStorage.setItem('nova-documents', JSON.stringify(documents));
      localStorage.setItem('nova-folders', JSON.stringify(folders));
      
      if (dirHandle) {
        try {
          if (await dirHandle.queryPermission({ mode: 'readwrite' }) === 'granted') {
            for (const doc of documents) {
              let currentDir = dirHandle;
              if (doc.folderId) {
                const folderPath = [];
                let currentFolderId: string | null | undefined = doc.folderId;
                while (currentFolderId) {
                  const folder = folders.find(f => f.id === currentFolderId);
                  if (folder) {
                    folderPath.unshift(folder.name);
                    currentFolderId = folder.parentId;
                  } else {
                    break;
                  }
                }
                
                for (const folderName of folderPath) {
                  const safeFolderName = folderName.replace(/[/\\?%*:|"<>]/g, '-');
                  currentDir = await currentDir.getDirectoryHandle(safeFolderName, { create: true });
                }
              }
              
              const safeFileName = `${(doc.title || 'Untitled').replace(/[/\\?%*:|"<>]/g, '-')}.md`;
              
              // Handle renaming/moving
              if ((doc.lastSavedTitle && doc.lastSavedTitle !== doc.title) || 
                  (doc.lastSavedFolderId !== undefined && doc.lastSavedFolderId !== doc.folderId)) {
                try {
                  let oldDir = dirHandle;
                  if (doc.lastSavedFolderId) {
                    const oldFolderPath = [];
                    let currentOldFolderId: string | null | undefined = doc.lastSavedFolderId;
                    while (currentOldFolderId) {
                      const folder = folders.find(f => f.id === currentOldFolderId);
                      if (folder) {
                        oldFolderPath.unshift(folder.name);
                        currentOldFolderId = folder.parentId;
                      } else {
                        break;
                      }
                    }
                    for (const folderName of oldFolderPath) {
                      const safeFolderName = folderName.replace(/[/\\?%*:|"<>]/g, '-');
                      oldDir = await oldDir.getDirectoryHandle(safeFolderName, { create: false });
                    }
                  }
                  const oldSafeFileName = `${(doc.lastSavedTitle || 'Untitled').replace(/[/\\?%*:|"<>]/g, '-')}.md`;
                  await oldDir.removeEntry(oldSafeFileName);
                } catch (e) {
                  // Ignore errors if old file doesn't exist
                }
              }

              const fileHandle = await currentDir.getFileHandle(safeFileName, { create: true });
              const writable = await fileHandle.createWritable();
              await writable.write(doc.content);
              await writable.close();
              
              // Update lastSaved properties
              doc.lastSavedTitle = doc.title;
              doc.lastSavedFolderId = doc.folderId;
            }
          }
        } catch (err) {
          console.error("Failed to save to local library", err);
        }
      }
      
      setSaveStatus('saved');
    }, 1000);

    return () => clearTimeout(timer);
  }, [documents, folders, dirHandle]);

  const activeDoc = useMemo(() => 
    documents.find(doc => doc.id === activeId) || null,
  [documents, activeId]);

  const activeFolder = useMemo(() => {
    if (!activeDoc || !activeDoc.folderId) return null;
    return folders.find(f => f.id === activeDoc.folderId) || null;
  }, [activeDoc, folders]);

  const handleCreateFolder = (parentId: string | null = null) => {
    const newFolder: Folder = {
      id: uuidv4(),
      name: 'New Folder',
      updatedAt: Date.now(),
      isExpanded: true,
      parentId,
    };
    setFolders([newFolder, ...folders]);
  };

  const handleToggleFolder = (id: string) => {
    setFolders(prev => prev.map(f => f.id === id ? { ...f, isExpanded: !f.isExpanded } : f));
  };

  const handleCreateDoc = (folderId: string | null = null) => {
    const newDoc: Document = {
      id: uuidv4(),
      title: 'New file',
      content: '',
      updatedAt: Date.now(),
      folderId,
    };
    setDocuments([newDoc, ...documents]);
    handleSetActiveId(newDoc.id);
    if (folderId) {
      setFolders(prev => prev.map(f => f.id === folderId ? { ...f, isExpanded: true } : f));
    }
  };

  const handleDeleteDoc = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const docToDelete = documents.find(doc => doc.id === id);
    const newDocs = documents.filter(doc => doc.id !== id);
    setDocuments(newDocs);

    if (docToDelete && dirHandle) {
      try {
        if (await dirHandle.queryPermission({ mode: 'readwrite' }) === 'granted') {
          let currentDir = dirHandle;
          if (docToDelete.lastSavedFolderId || docToDelete.folderId) {
            const folderIdToUse = docToDelete.lastSavedFolderId !== undefined ? docToDelete.lastSavedFolderId : docToDelete.folderId;
            if (folderIdToUse) {
              const folderPath = [];
              let currentFolderId: string | null | undefined = folderIdToUse;
              while (currentFolderId) {
                const folder = folders.find(f => f.id === currentFolderId);
                if (folder) {
                  folderPath.unshift(folder.name);
                  currentFolderId = folder.parentId;
                } else {
                  break;
                }
              }
              
              for (const folderName of folderPath) {
                const safeFolderName = folderName.replace(/[/\\?%*:|"<>]/g, '-');
                currentDir = await currentDir.getDirectoryHandle(safeFolderName, { create: false });
              }
            }
          }
          
          const titleToUse = docToDelete.lastSavedTitle || docToDelete.title || 'Untitled';
          const safeFileName = `${titleToUse.replace(/[/\\?%*:|"<>]/g, '-')}.md`;
          await currentDir.removeEntry(safeFileName);
        }
      } catch (err) {
        console.error("Failed to delete file from local library", err);
      }
    }

    // Also close the tab
    handleCloseTab(id, e);

    if (activeId === id) {
      // Logic to set new activeId is now in handleCloseTab
    }
  };

  const handleDeleteFolder = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setFolders(prev => prev.filter(f => f.id !== id));
    setDocuments(prev => prev.map(doc => doc.folderId === id ? { ...doc, folderId: null } : doc));
  };

  const handleUpdateContent = (content: string, fromHistory = false) => {
    if (!activeId) return;

    if (!fromHistory) {
      const docHistory = history[activeId] || [];
      const currentHistoryIndex = historyIndex[activeId] ?? -1;
      const newHistory = docHistory.slice(0, currentHistoryIndex + 1);
      newHistory.push(content);

      setHistory(prev => ({ ...prev, [activeId]: newHistory }));
      setHistoryIndex(prev => ({ ...prev, [activeId]: newHistory.length - 1 }));
    }

    setDocuments(prev => prev.map(doc => {
      if (doc.id === activeId) {
        return { ...doc, content, updatedAt: Date.now() };
      }
      return doc;
    }));
  };

  const handleCloseTab = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const tabIndex = openTabs.indexOf(id);
    const newTabs = openTabs.filter(tabId => tabId !== id);
    setOpenTabs(newTabs);

    if (activeId === id) {
      if (newTabs.length > 0) {
        const newActiveIndex = Math.max(0, tabIndex - 1);
        setActiveId(newTabs[newActiveIndex]);
      }
 else {
        setActiveId(null);
      }
    }
  };

  const stats = useMemo(() => {
    if (!activeDoc) return { words: 0, chars: 0, readingTime: 0 };
    const words = activeDoc.content.trim() ? activeDoc.content.trim().split(/\s+/).length : 0;
    const chars = activeDoc.content.length;
    const readingTime = Math.ceil(words / 200);
    return { words, chars, readingTime };
  }, [activeDoc]);

  const searchResults = useMemo(() => {
    if (!searchQuery) return [];

    return documents.filter(doc => 
      doc.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      doc.content.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [documents, searchQuery]);

  const contextValue = useMemo(
    () => ({
      folders,
      setFolders,
      documents,
      setDocuments,
      activeId,
      setActiveId,
      openTabs,
      setOpenTabs,
      showSidebar,
      setShowSidebar,
      showCalendar,
      setShowCalendar,
      defaultCalendarExpanded,
      setDefaultCalendarExpanded,
      sortOrder,
      setSortOrder,
      viewMode,
      setViewMode,
      searchQuery,
      setSearchQuery,
      showSettings,
      setShowSettings,
      theme,
      setTheme,
      fontSize,
      setFontSize,
      saveStatus,
      setSaveStatus,
      libraryPath,
      setLibraryPath,
      dirHandle,
      setDirHandle,
      activeDragId,
      setActiveDragId,
      contextMenu,
      setContextMenu,
      clipboard,
      setClipboard,
      renamingId,
      setRenamingId,
      renameValue,
      setRenameValue,
      localSearchQuery,
      setLocalSearchQuery,
      showLocalSearch,
      setShowLocalSearch,
      localSearchInputRef,
      history,
      setHistory,
      historyIndex,
      setHistoryIndex,
      searchInputRef,
      textareaRef,
      isDescendant,
      handleDragStart,
      handleDragEnd,
      handleFormat,
      handleSetActiveId,
      handleDateSelect,
      handleUndo,
      handleRedo,
      handleContextMenu,
      closeContextMenu,
      handleCopy,
      handleCut,
      handlePaste,
      handleDeleteFromContextMenu,
      handleRenameStart,
      handleRenameSave,
      handleRenameCancel,
      handleSelectLibraryLocation,
      syncToLocalDisk,
      activeDoc,
      activeFolder,
      handleCreateFolder,
      handleToggleFolder,
      handleCreateDoc,
      handleDeleteDoc,
      handleDeleteFolder,
      handleUpdateContent,
      handleCloseTab,
      stats,
      searchResults,
    }),
    [
      folders,
      documents,
      activeId,
      openTabs,
      showSidebar,
      showCalendar,
      defaultCalendarExpanded,
      sortOrder,
      viewMode,
      searchQuery,
      showSettings,
      theme,
      fontSize,
      saveStatus,
      libraryPath,
      dirHandle,
      activeDragId,
      contextMenu,
      clipboard,
      renamingId,
      renameValue,
      localSearchQuery,
      showLocalSearch,
      history,
      historyIndex,
      activeDoc,
      activeFolder,
      stats,
      searchResults,
    ]
  );

  return <AppContext.Provider value={contextValue}>{children}</AppContext.Provider>;
};

export const useAppContext = () => {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useAppContext must be used within an AppProvider');
  }
  return context;
};
