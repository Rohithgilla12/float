import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useNotes } from './hooks/useNotes';
import { useTheme } from './hooks/useTheme';
import { WindowHeader } from './components/WindowHeader';
import { NoteEditor } from './components/NoteEditor';
import { ActionBar } from './components/ActionBar';
import { CommandPaletteModal } from './components/CommandPaletteModal';
import { LicenseModal } from './components/LicenseModal';
import { SettingsModal } from './components/SettingsModal';
import { ImageExportModal } from './components/ImageExportModal';
import { ParticleBurstCanvas, ParticleCanvasHandle } from './components/ParticleBurstCanvas';
import { haptics } from './utils/audioHaptics';
import { getStoredLicense, LicenseStatus } from './utils/license';
import { speechEngine } from './utils/speechRecognition';

const OPACITY_STORAGE_KEY = 'float_window_opacity';

export const App: React.FC = () => {
  const {
    notes,
    activeNote,
    activeNoteId,
    setActiveNoteId,
    updateActiveNoteContent,
    createNote,
    deleteActiveNote,
    closeActiveNote,
    switchToNextNote,
    switchToPrevNote,
  } = useNotes();

  const { theme, themeConfig, setTheme, toggleLightDark } = useTheme();

  const [isPinned, setIsPinned] = useState(true);
  const [actionsPaletteOpen, setActionsPaletteOpen] = useState(false);
  const [licenseModalOpen, setLicenseModalOpen] = useState(false);
  const [settingsModalOpen, setSettingsModalOpen] = useState(false);
  const [imageExportOpen, setImageExportOpen] = useState(false);
  const [isDictating, setIsDictating] = useState(false);
  const [isFocusMode, setIsFocusMode] = useState(false);
  const [opacity, setOpacity] = useState<number>(() => {
    try {
      const saved = localStorage.getItem(OPACITY_STORAGE_KEY);
      if (saved) {
        const val = parseFloat(saved);
        if (!isNaN(val) && val >= 0.3 && val <= 1.0) return val;
      }
    } catch {}
    return 1.0;
  });
  const [licenseStatus, setLicenseStatus] = useState<LicenseStatus>(getStoredLicense);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const particleCanvasRef = useRef<ParticleCanvasHandle>(null);
  const windowShellRef = useRef<HTMLDivElement>(null);
  const activeNoteRef = useRef(activeNote);
  activeNoteRef.current = activeNote;

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

  // Window Opacity & Ghost Mode
  const handleAdjustOpacity = useCallback((delta: number) => {
    haptics.playClick();
    setOpacity(prev => {
      const next = Math.max(0.4, Math.min(1.0, Number((prev + delta).toFixed(2))));
      try {
        localStorage.setItem(OPACITY_STORAGE_KEY, String(next));
      } catch {}
      showToast(`👻 Ghost Mode: ${Math.round(next * 100)}% Opacity`);
      return next;
    });
  }, [showToast]);

  const handleCycleOpacity = useCallback(() => {
    haptics.playClick();
    setOpacity(prev => {
      let next = 1.0;
      if (prev >= 0.95) next = 0.85;
      else if (prev >= 0.80) next = 0.70;
      else if (prev >= 0.65) next = 0.50;
      else next = 1.0;
      try {
        localStorage.setItem(OPACITY_STORAGE_KEY, String(next));
      } catch {}
      showToast(`👻 Ghost Mode: ${Math.round(next * 100)}% Opacity`);
      return next;
    });
  }, [showToast]);

  const handleSetOpacity = useCallback((val: number) => {
    const clamped = Math.max(0.4, Math.min(1.0, val));
    setOpacity(clamped);
    try {
      localStorage.setItem(OPACITY_STORAGE_KEY, String(clamped));
    } catch {}
  }, []);

  // Web Speech Real-Time Dictation Mode
  const handleToggleDictation = useCallback(() => {
    haptics.playClick();
    if (!speechEngine.isSupported()) {
      showToast('⚠️ Speech recognition not supported in this browser/OS');
      return;
    }
    if (isDictating) {
      speechEngine.stop();
      setIsDictating(false);
      showToast('🎙️ Dictation stopped');
    } else {
      const started = speechEngine.start(
        (text) => {
          if (text) {
            const currentContent = activeNoteRef.current.content;
            const sep = currentContent.endsWith('\n') || !currentContent ? '' : '\n';
            updateActiveNoteContent(`${currentContent}${sep}${text}`);
          }
        },
        (listening) => {
          setIsDictating(listening);
        }
      );
      if (started) {
        setIsDictating(true);
        showToast('🎙️ Dictating... speak clearly');
      } else {
        showToast('⚠️ Could not access microphone');
      }
    }
  }, [isDictating, showToast, updateActiveNoteContent]);

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
      // ⌘⇧E: Export as Image Card
      if ((e.metaKey || e.ctrlKey) && e.shiftKey && e.key.toLowerCase() === 'e') {
        e.preventDefault();
        haptics.playClick();
        setImageExportOpen(prev => !prev);
        return;
      }

      // ⌥D: Voice Dictation (Speech-to-Text)
      if (e.altKey && e.key.toLowerCase() === 'd') {
        e.preventDefault();
        handleToggleDictation();
        return;
      }

      // ⌥[ / ⌥]: Ghost Mode Opacity
      if (e.altKey && (e.key === '[' || e.key === '“')) {
        e.preventDefault();
        handleAdjustOpacity(-0.1);
        return;
      }
      if (e.altKey && (e.key === ']' || e.key === '‘')) {
        e.preventDefault();
        handleAdjustOpacity(0.1);
        return;
      }

      // ⌘⇧F: Zen Focus Mode
      if ((e.metaKey || e.ctrlKey) && e.shiftKey && e.key.toLowerCase() === 'f') {
        e.preventDefault();
        haptics.playClick();
        setIsFocusMode(prev => {
          showToast(!prev ? '🧘 Zen Focus Mode: ON' : 'Zen Focus Mode: OFF');
          return !prev;
        });
        return;
      }

      // ⌘, : Open Settings & Keybinds
      if ((e.metaKey || e.ctrlKey) && e.key === ',') {
        e.preventDefault();
        haptics.playClick();
        setSettingsModalOpen(prev => !prev);
        return;
      }

      // ⌘K or ⌘O: Actions Palette / Quick Switcher
      if ((e.metaKey || e.ctrlKey) && (e.key.toLowerCase() === 'k' || e.key.toLowerCase() === 'o')) {
        e.preventDefault();
        haptics.playClick();
        setActionsPaletteOpen(prev => !prev);
        return;
      }

      // ⌥P: Toggle Pin (Always on Top)
      if (e.altKey && e.key.toLowerCase() === 'p') {
        e.preventDefault();
        handleTogglePin();
        return;
      }

      // ⌘N or ⌘T: New Note Tab
      if ((e.metaKey || e.ctrlKey) && (e.key.toLowerCase() === 'n' || e.key.toLowerCase() === 't')) {
        e.preventDefault();
        haptics.playClick();
        createNote();
        showToast('✨ Created new note');
        return;
      }

      // ⌘W: Close Current Note Tab
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'w') {
        e.preventDefault();
        haptics.playClick();
        closeActiveNote();
        showToast('🗑️ Closed note tab');
        return;
      }

      // ⌘] or ⌘} : Switch to Next Tab
      if ((e.metaKey || e.ctrlKey) && (e.key === ']' || (e.shiftKey && e.key === '}'))) {
        e.preventDefault();
        haptics.playClick();
        switchToNextNote();
        return;
      }

      // ⌘[ or ⌘{ : Switch to Previous Tab
      if ((e.metaKey || e.ctrlKey) && (e.key === '[' || (e.shiftKey && e.key === '{'))) {
        e.preventDefault();
        haptics.playClick();
        switchToPrevNote();
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

      // Esc: Dismiss Modal, Palette, Exit Focus or Close/Hide Window
      if (e.key === 'Escape') {
        if (imageExportOpen) {
          e.preventDefault();
          haptics.playClick();
          setImageExportOpen(false);
          return;
        }
        if (settingsModalOpen) {
          e.preventDefault();
          haptics.playClick();
          setSettingsModalOpen(false);
          return;
        }
        if (licenseModalOpen) {
          e.preventDefault();
          haptics.playClick();
          setLicenseModalOpen(false);
          return;
        }
        if (actionsPaletteOpen) {
          e.preventDefault();
          haptics.playClick();
          setActionsPaletteOpen(false);
          return;
        }
        if (isFocusMode) {
          e.preventDefault();
          haptics.playClick();
          setIsFocusMode(false);
          showToast('Zen Focus Mode: OFF');
          return;
        }

        const isTauri = typeof window !== 'undefined' && ('__TAURI_INTERNALS__' in window || '__TAURI__' in window);
        if (isTauri) {
          const hasPopover = document.querySelector('.slash-popover, .bubble-popover');
          if (hasPopover) {
            return;
          }
          const activeTag = document.activeElement?.tagName?.toLowerCase();
          if (activeTag === 'textarea' || activeTag === 'input') {
            (document.activeElement as HTMLElement)?.blur();
            return;
          }
          e.preventDefault();
          handleCloseWindow();
        }
        return;
      }
    };

    window.addEventListener('keydown', handleGlobalKeyDown);
    return () => window.removeEventListener('keydown', handleGlobalKeyDown);
  }, [
    settingsModalOpen,
    licenseModalOpen,
    actionsPaletteOpen,
    imageExportOpen,
    isFocusMode,
    handleTogglePin,
    handleCloseWindow,
    createNote,
    closeActiveNote,
    switchToNextNote,
    switchToPrevNote,
    notes,
    setActiveNoteId,
    showToast,
    handleToggleDictation,
    handleAdjustOpacity,
  ]);

  return (
    <div className={`theme-${theme} w-full h-full flex flex-col overflow-hidden bg-transparent`}>
      {/* Outer Floating Window Container with Overdrive Specular Glass Shader & Ghost Mode Opacity */}
      <div
        ref={windowShellRef}
        onMouseMove={handleMouseMove}
        style={{ opacity }}
        className="window-shell w-full h-full rounded-2xl flex flex-col overflow-hidden relative transition-opacity duration-150"
      >
        {/* Ambient Specular Glass Glow (Direction B) */}
        <div className="specular-glow" />

        {/* Micro-Particle Burst Canvas (Overdrive Direction B) */}
        <ParticleBurstCanvas ref={particleCanvasRef} />

        {/* Top Header Bar (Hidden in Zen Focus Mode) */}
        {!isFocusMode ? (
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
            onOpenSettings={() => {
              haptics.playClick();
              setSettingsModalOpen(true);
            }}
            onCloseWindow={handleCloseWindow}
            onMinimizeWindow={handleMinimizeWindow}
            isPro={licenseStatus.isPro}
            onOpenLicense={() => {
              haptics.playClick();
              setLicenseModalOpen(true);
            }}
          />
        ) : (
          /* Subtle Zen Exit Button in top right */
          <button
            onClick={() => {
              haptics.playClick();
              setIsFocusMode(false);
              showToast('Zen Focus Mode: OFF');
            }}
            className="absolute top-3 right-3 z-30 px-2.5 py-1 rounded-lg bg-black/60 hover:bg-black/90 text-white/50 hover:text-white border border-white/15 text-[10px] font-mono transition-all flex items-center gap-1 shadow-lg cursor-pointer"
            title="Exit Zen Focus Mode (Esc or ⌘⇧F)"
          >
            <span>Exit Zen (Esc)</span>
          </button>
        )}

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

        {/* Bottom Action Bar (Hidden in Zen Focus Mode) */}
        {!isFocusMode && (
          <ActionBar
            content={activeNote.content}
            onOpenActions={() => {
              haptics.playClick();
              setActionsPaletteOpen(true);
            }}
            onOpenImageExport={() => {
              haptics.playClick();
              setImageExportOpen(true);
            }}
            isDictating={isDictating}
            onToggleDictation={handleToggleDictation}
            opacity={opacity}
            onCycleOpacity={handleCycleOpacity}
          />
        )}

        {/* ⌘K Actions Command Palette */}
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
          isPro={licenseStatus.isPro}
          onOpenLicense={() => {
            haptics.playClick();
            setLicenseModalOpen(true);
          }}
          onOpenSettings={() => {
            haptics.playClick();
            setSettingsModalOpen(true);
          }}
          onOpenImageExport={() => setImageExportOpen(true)}
          isDictating={isDictating}
          onToggleDictation={handleToggleDictation}
          opacity={opacity}
          onCycleOpacity={handleCycleOpacity}
          isFocusMode={isFocusMode}
          onToggleFocusMode={() => {
            setIsFocusMode(prev => !prev);
            showToast(!isFocusMode ? '🧘 Zen Focus Mode: ON' : 'Zen Focus Mode: OFF');
          }}
        />

        {/* Ray.so / Carbon Style Visual Image Card Exporter */}
        <ImageExportModal
          isOpen={imageExportOpen}
          onClose={() => setImageExportOpen(false)}
          note={activeNote}
          themeConfig={themeConfig}
          onShowToast={showToast}
        />

        {/* Settings Modal (Storage, Shortcuts, License & Appearance) */}
        <SettingsModal
          isOpen={settingsModalOpen}
          onClose={() => setSettingsModalOpen(false)}
          currentTheme={theme}
          onSelectTheme={t => {
            haptics.playClick();
            setTheme(t);
            showToast(`Switched to ${t}`);
          }}
          licenseStatus={licenseStatus}
          onLicenseChanged={status => {
            setLicenseStatus(status);
            showToast(status.isPro ? '⚡ Float Pro Activated!' : 'License updated');
          }}
          onShowToast={showToast}
          opacity={opacity}
          onChangeOpacity={handleSetOpacity}
        />

        {/* Dodo Payments License Modal */}
        <LicenseModal
          isOpen={licenseModalOpen}
          onClose={() => setLicenseModalOpen(false)}
          licenseStatus={licenseStatus}
          onLicenseChanged={status => {
            setLicenseStatus(status);
            showToast(status.isPro ? '⚡ Float Pro Activated!' : 'License updated');
          }}
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
