import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useNotes } from './hooks/useNotes';
import { useTheme } from './hooks/useTheme';
import { WindowHeader } from './components/WindowHeader';
import { NoteEditor } from './components/NoteEditor';
import { ActionBar } from './components/ActionBar';
import { CommandPaletteModal } from './components/CommandPaletteModal';
import { ParticleBurstCanvas, ParticleCanvasHandle } from './components/ParticleBurstCanvas';
import { haptics } from './utils/audioHaptics';

export const App: React.FC = () => {
  const {
    notes,
    activeNote,
    activeNoteId,
    setActiveNoteId,
    updateActiveNoteContent,
    createNote,
    deleteActiveNote,
  } = useNotes();

  const { theme, themeConfig, setTheme, toggleLightDark } = useTheme();

  const [isPinned, setIsPinned] = useState(true);
  const [actionsPaletteOpen, setActionsPaletteOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const particleCanvasRef = useRef<ParticleCanvasHandle>(null);
  const windowShellRef = useRef<HTMLDivElement>(null);

  const showToast = useCallback((msg: string) => {
    setToastMessage(msg);
  }, []);

  useEffect(() => {
    if (!toastMessage) return;
    const timer = setTimeout(() => setToastMessage(null), 2200);
    return () => clearTimeout(timer);
  }, [toastMessage]);

  // Overdrive Direction B: Mouse-Tracking Sub-Pixel Specular Glass Border
  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    const win = windowShellRef.current;
    if (!win) return;
    const rect = win.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    win.style.setProperty('--mouse-x', `${x}px`);
    win.style.setProperty('--mouse-y', `${y}px`);
  }, []);

  // Always on Top Pin Toggle with Tauri Backend Integration
  const handleTogglePin = useCallback(async () => {
    const nextState = !isPinned;
    setIsPinned(nextState);
    haptics.playClick();

    // Call Tauri window API if available
    try {
      const { invoke } = await import('@tauri-apps/api/core');
      await invoke('set_always_on_top', { alwaysOnTop: nextState });
    } catch {
      // In web preview fallback
    }

    showToast(nextState ? '📌 Pinned to desktop (Always on Top)' : '🔓 Window unpinned (normal float)');
  }, [isPinned, showToast]);

  // Window Controls
  const handleCloseWindow = useCallback(async () => {
    haptics.playClick();
    try {
      const { invoke } = await import('@tauri-apps/api/core');
      await invoke('hide_window');
    } catch {
      showToast('Close window (⌘W / Esc)');
    }
  }, [showToast]);

  const handleMinimizeWindow = useCallback(async () => {
    haptics.playClick();
    try {
      const { invoke } = await import('@tauri-apps/api/core');
      await invoke('minimize_window');
    } catch {
      showToast('Minimize window (⌘M)');
    }
  }, [showToast]);

  // Copy Note Markdown to Clipboard
  const handleCopyNote = useCallback(async () => {
    haptics.playClick();
    try {
      if (navigator.clipboard) {
        await navigator.clipboard.writeText(activeNote.content);
      }
      showToast('⚡ Copied note markdown to clipboard');
    } catch (e) {
      console.error('Clipboard copy error:', e);
      showToast('Failed to copy to clipboard');
    }
  }, [activeNote.content, showToast]);

  // Export Note as .md File
  const handleExportNote = useCallback(() => {
    haptics.playClick();
    try {
      const blob = new Blob([activeNote.content], { type: 'text/markdown;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      const filename = `${activeNote.title.replace(/[^a-zA-Z0-9_-]/g, '_') || 'note'}.md`;
      a.href = url;
      a.download = filename;
      a.click();
      URL.revokeObjectURL(url);
      showToast(`💾 Exported to ${filename}`);
    } catch (e) {
      console.error('Export error:', e);
      showToast('Failed to export note');
    }
  }, [activeNote, showToast]);

  // Global Keyboard Shortcuts
  useEffect(() => {
    const handleGlobalKeyDown = (e: KeyboardEvent) => {
      // ⌘K: Actions Palette
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        haptics.playClick();
        setActionsPaletteOpen(prev => !prev);
        return;
      }

      // ⌥P: Toggle Pin
      if (e.altKey && e.key.toLowerCase() === 'p') {
        e.preventDefault();
        handleTogglePin();
        return;
      }

      // ⌘N: New Note
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'n') {
        e.preventDefault();
        haptics.playClick();
        createNote();
        showToast('✨ Created new note');
        return;
      }

      // ⌘1..9: Quick Switcher
      if ((e.metaKey || e.ctrlKey) && /^[1-9]$/.test(e.key)) {
        const index = parseInt(e.key, 10) - 1;
        if (notes[index]) {
          e.preventDefault();
          haptics.playClick();
          setActiveNoteId(notes[index].id);
          showToast(`Switched to "${notes[index].title}"`);
        }
        return;
      }

      // Esc: Dismiss Palette or Close/Hide Window
      if (e.key === 'Escape') {
        e.preventDefault();
        if (actionsPaletteOpen) {
          haptics.playClick();
          setActionsPaletteOpen(false);
        } else {
          handleCloseWindow();
        }
        return;
      }
    };

    window.addEventListener('keydown', handleGlobalKeyDown);
    return () => window.removeEventListener('keydown', handleGlobalKeyDown);
  }, [actionsPaletteOpen, handleTogglePin, handleCloseWindow, createNote, notes, setActiveNoteId, showToast]);

  return (
    <div className={`theme-${theme} w-screen h-screen flex flex-col overflow-hidden bg-transparent`}>
      {/* Outer Floating Window Container with Overdrive Specular Glass Shader */}
      <div
        ref={windowShellRef}
        onMouseMove={handleMouseMove}
        className="window-shell w-full h-full rounded-2xl flex flex-col overflow-hidden relative select-none"
      >
        {/* Ambient Specular Glass Glow (Direction B) */}
        <div className="specular-glow" />

        {/* Micro-Particle Burst Canvas (Overdrive Direction B) */}
        <ParticleBurstCanvas ref={particleCanvasRef} />

        {/* Top Header Bar */}
        <WindowHeader
          notes={notes}
          activeNoteId={activeNoteId}
          onSelectNote={id => {
            haptics.playClick();
            setActiveNoteId(id);
          }}
          onCreateNote={() => {
            haptics.playClick();
            createNote();
            showToast('✨ Created new note');
          }}
          isPinned={isPinned}
          onTogglePin={handleTogglePin}
          currentTheme={themeConfig}
          onToggleThemeMode={() => {
            haptics.playClick();
            toggleLightDark();
          }}
          onOpenActions={() => {
            haptics.playClick();
            setActionsPaletteOpen(true);
          }}
          onCloseWindow={handleCloseWindow}
          onMinimizeWindow={handleMinimizeWindow}
        />

        {/* Note Editor Area with Task Particle Bursts (Overdrive Direction B) & Audio Haptics (Direction A) */}
        <NoteEditor
          content={activeNote.content}
          onChange={updateActiveNoteContent}
          onOpenActions={() => {
            haptics.playClick();
            setActionsPaletteOpen(true);
          }}
          onTaskCheckBurst={(x, y) => {
            particleCanvasRef.current?.burst(x, y, [
              themeConfig.accent,
              '#FFFFFF',
              '#38BDF8',
              '#F59E0B',
            ]);
          }}
        />

        {/* Bottom Raycast Action Bar */}
        <ActionBar
          content={activeNote.content}
          onOpenActions={() => {
            haptics.playClick();
            setActionsPaletteOpen(true);
          }}
        />

        {/* Raycast ⌘K Actions Command Palette */}
        <CommandPaletteModal
          isOpen={actionsPaletteOpen}
          onClose={() => setActionsPaletteOpen(false)}
          onCopyNote={handleCopyNote}
          isPinned={isPinned}
          onTogglePin={handleTogglePin}
          currentTheme={theme}
          onSelectTheme={t => {
            haptics.playClick();
            setTheme(t);
            showToast(`Switched to ${t}`);
          }}
          onCreateNote={() => {
            haptics.playClick();
            createNote();
            showToast('✨ Created new note');
          }}
          onDeleteNote={() => {
            haptics.playClick();
            deleteActiveNote();
            showToast('🗑️ Deleted note');
          }}
          onExportNote={handleExportNote}
        />

        {/* Toast Notification */}
        {toastMessage && (
          <div className="absolute bottom-12 left-1/2 transform -translate-x-1/2 z-50 px-3.5 py-1.5 rounded-xl bg-black/90 text-white border border-white/20 text-xs font-medium shadow-2xl flex items-center gap-2 pointer-events-none animate-fadeIn">
            <span className="text-amber-400">⚡</span>
            <span>{toastMessage}</span>
          </div>
        )}

      </div>
    </div>
  );
};

export default App;
