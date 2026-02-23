/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Sidebar } from './components/Sidebar';
import { Editor } from './components/Editor';
import { Toolbar } from './components/Toolbar';
import { SettingsModal } from './components/SettingsModal';
import { ContextMenu } from './components/ContextMenu';
import { StatusBar } from './components/StatusBar';
import { CalendarSidebar } from './components/CalendarSidebar';
import { useAppContext } from './context/AppContext';



export default function App() {
  const {
    folders,
    documents,
    activeId,
    openTabs,
    showSidebar,
    setShowSidebar,
    showCalendar,
    setShowCalendar,
    sortOrder,
    setSortOrder,
    searchQuery,
    setSearchQuery,
    viewMode,
    setViewMode,
    showSettings,
    setShowSettings,
    fontSize,
    setFontSize,
    defaultCalendarExpanded,
    setDefaultCalendarExpanded,
    saveStatus,
    libraryPath,
    activeDragId,
    contextMenu,
    clipboard,
    renamingId,
    renameValue,
    setRenameValue,
    localSearchQuery,
    setLocalSearchQuery,
    showLocalSearch,
    setShowLocalSearch,
    localSearchInputRef,
    history,
    historyIndex,
    searchInputRef,
    textareaRef,
    activeDoc,
    activeFolder,
    stats,
    searchResults,
    handleSetActiveId,
    handleCreateFolder,
    handleToggleFolder,
    handleCreateDoc,
    handleDeleteDoc,
    handleDeleteFolder,
    handleUpdateContent,
    handleCloseTab,
    handleFormat,
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
    handleDragStart,
    handleDragEnd,
  } = useAppContext();

  const [theme, setTheme] = useState<'dark' | 'light' | 'system'>('dark'); // Keep theme state local to App.tsx

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

  return (
    <>
      <div className="flex h-screen w-full overflow-hidden bg-[var(--bg-primary)] text-[var(--text-primary)] font-sans">
        <Sidebar
          showSidebar={showSidebar}
          folders={folders}
          documents={documents}
          activeId={activeId}
          sortOrder={sortOrder}
          setSortOrder={setSortOrder}
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          searchInputRef={searchInputRef}
          searchResults={searchResults}
          handleSetActiveId={handleSetActiveId}
          handleCreateFolder={handleCreateFolder}
          handleCreateDoc={handleCreateDoc}
          handleToggleFolder={handleToggleFolder}
          handleDeleteDoc={handleDeleteDoc}
          handleDeleteFolder={handleDeleteFolder}
          handleContextMenu={handleContextMenu}
          renamingId={renamingId}
          renameValue={renameValue}
          setRenameValue={setRenameValue}
          handleRenameSave={handleRenameSave}
          handleRenameCancel={handleRenameCancel}
          handleDragStart={handleDragStart}
          handleDragEnd={handleDragEnd}
          activeDragId={activeDragId}
          setShowSettings={setShowSettings}
        />

        <SettingsModal
          showSettings={showSettings}
          setShowSettings={setShowSettings}
          theme={theme}
          setTheme={setTheme}
          fontSize={fontSize}
          setFontSize={setFontSize}
          defaultCalendarExpanded={defaultCalendarExpanded}
          setDefaultCalendarExpanded={setDefaultCalendarExpanded}
          libraryPath={libraryPath}
          handleSelectLibraryLocation={handleSelectLibraryLocation}
        />

        <ContextMenu
          contextMenu={contextMenu}
          clipboard={clipboard}
          documents={documents}
          handleCopy={handleCopy}
          handleCut={handleCut}
          handlePaste={handlePaste}
          handleRenameStart={handleRenameStart}
          handleDeleteFromContextMenu={handleDeleteFromContextMenu}
        />

        <main className="flex flex-1 flex-col bg-[var(--bg-primary)]">
          <Toolbar
            showSidebar={showSidebar}
            setShowSidebar={setShowSidebar}
            viewMode={viewMode}
            setViewMode={setViewMode}
            showCalendar={showCalendar}
            setShowCalendar={setShowCalendar}
            saveStatus={saveStatus}
            openTabs={openTabs}
            documents={documents}
            activeId={activeId}
            handleSetActiveId={handleSetActiveId}
            handleCloseTab={handleCloseTab}
          />

          <Editor
            activeDoc={activeDoc}
            viewMode={viewMode}
            showLocalSearch={showLocalSearch}
            setShowLocalSearch={setShowLocalSearch}
            localSearchInputRef={localSearchInputRef}
            localSearchQuery={localSearchQuery}
            setLocalSearchQuery={setLocalSearchQuery}
            textareaRef={textareaRef}
            fontSize={fontSize}
            handleUpdateContent={handleUpdateContent}
            handleFormat={handleFormat}
            history={history}
            historyIndex={historyIndex}
            activeId={activeId}
            handleUndo={handleUndo}
            handleRedo={handleRedo}
            handleCreateDoc={handleCreateDoc}
          />

          <StatusBar stats={stats} />
        </main>

        <CalendarSidebar
          showCalendar={showCalendar}
          setShowCalendar={setShowCalendar}
          onDateSelect={handleDateSelect}
        />
      </div>
    </>
  );
}
