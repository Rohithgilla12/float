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
import { UpdateBanner } from './components/UpdateBanner';
import { ParticleBurstCanvas, ParticleCanvasHandle } from './components/ParticleBurstCanvas';
import { haptics } from './utils/audioHaptics';
import {
  getStoredLicense,
  revalidateStoredLicense,
  isThemeUnlocked,
  FREE_NOTE_LIMIT,
  LicenseStatus,
  ProFeature,
} from './utils/license';
import { speechEngine } from './utils/speechRecognition';
import { checkForUpdates, isTauri, AvailableUpdate } from './utils/updater';
import { ThemeId } from './types/theme';

const OPACITY_STORAGE_KEY = 'float_window_opacity';
const STARTUP_UPDATE_CHECK_DELAY_MS = 4000;

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
  const [lockedFeature, setLockedFeature] = useState<ProFeature | null>(null);
  const [settingsModalOpen, setSettingsModalOpen] = useState(false);
  const [imageExportOpen, setImageExportOpen] = useState(false);
  const [isDictating, setIsDictating] = useState(false);
  const [isFocusMode, setIsFocusMode] = useState(false);
  const [soundsOn, setSoundsOn] = useState(haptics.enabled);
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
  const [availableUpdate, setAvailableUpdate] = useState<AvailableUpdate | null>(null);
  const [updateDismissed, setUpdateDismissed] = useState(false);
  const [updateProgress, setUpdateProgress] = useState<number | null>(null);
  const [checkingUpdates, setCheckingUpdates] = useState(false);

  const isPro = licenseStatus.isPro;

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

  const openLicense = useCallback((feature: ProFeature | null = null) => {
    haptics.playClick();
    setLockedFeature(feature);
    setLicenseModalOpen(true);
  }, []);

  const requirePro = useCallback(
    (feature: ProFeature, run: () => void) => {
      if (isPro) run();
      else openLicense(feature);
    },
    [isPro, openLicense]
  );

  const applyLicense = useCallback(
    (status: LicenseStatus) => {
      setLicenseStatus(status);
      if (status.isPro) showToast('Float Pro is active');
    },
    [showToast]
  );

  useEffect(() => {
    revalidateStoredLicense().then(setLicenseStatus);
  }, []);

  useEffect(() => {
    if (!isThemeUnlocked(theme, isPro)) setTheme('obsidian');
  }, [theme, isPro, setTheme]);

  useEffect(() => {
    if (!isPro && opacity < 1) setOpacity(1);
    if (!isPro && isFocusMode) setIsFocusMode(false);
  }, [isPro, opacity, isFocusMode]);

  useEffect(() => {
    if (!isTauri) return;
    const timer = setTimeout(async () => {
      const result = await checkForUpdates();
      if (result.kind === 'available') setAvailableUpdate(result.update);
    }, STARTUP_UPDATE_CHECK_DELAY_MS);
    return () => clearTimeout(timer);
  }, []);

  const handleCheckForUpdates = useCallback(async () => {
    haptics.playClick();
    if (!isTauri) {
      showToast('Updates apply to the Mac app only');
      return;
    }
    setCheckingUpdates(true);
    const result = await checkForUpdates();
    setCheckingUpdates(false);
    if (result.kind === 'available') {
      setAvailableUpdate(result.update);
      setUpdateDismissed(false);
      showToast(`Float ${result.update.version} is ready to install`);
    } else if (result.kind === 'up-to-date') {
      showToast(`You are on the latest version (${result.version})`);
    } else if (result.kind === 'error') {
      showToast(`Update check failed: ${result.message}`);
    }
  }, [showToast]);

  const handleInstallUpdate = useCallback(async () => {
    if (!availableUpdate) return;
    haptics.playClick();
    setUpdateProgress(0);
    try {
      await availableUpdate.install(setUpdateProgress);
    } catch (err) {
      setUpdateProgress(null);
      showToast(`Update failed: ${err instanceof Error ? err.message : String(err)}`);
    }
  }, [availableUpdate, showToast]);

  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    const win = windowShellRef.current;
    if (!win) return;
    const rect = win.getBoundingClientRect();
    win.style.setProperty('--mouse-x', `${e.clientX - rect.left}px`);
    win.style.setProperty('--mouse-y', `${e.clientY - rect.top}px`);
  }, []);

  const handleTogglePin = useCallback(async () => {
    const nextState = !isPinned;
    setIsPinned(nextState);
    haptics.playClick();
    try {
      const { invoke } = await import('@tauri-apps/api/core');
      await invoke('set_always_on_top', { alwaysOnTop: nextState });
    } catch {}
    showToast(nextState ? 'Pinned above other windows' : 'Unpinned');
  }, [isPinned, showToast]);

  const handleCloseWindow = useCallback(async () => {
    haptics.playClick();
    try {
      const { invoke } = await import('@tauri-apps/api/core');
      await invoke('hide_window');
    } catch {
      showToast('Close window (⌘W or Esc)');
    }
  }, [showToast]);

  const handleMinimizeWindow = useCallback(async () => {
    haptics.playClick();
    try {
      const { invoke } = await import('@tauri-apps/api/core');
      await invoke('minimize_window');
    } catch {
      showToast('Minimise window (⌘M)');
    }
  }, [showToast]);

  const persistOpacity = (next: number) => {
    try {
      localStorage.setItem(OPACITY_STORAGE_KEY, String(next));
    } catch {}
  };

  const handleAdjustOpacity = useCallback(
    (delta: number) => {
      requirePro('ghost', () => {
        haptics.playClick();
        setOpacity(prev => {
          const next = Math.max(0.4, Math.min(1.0, Number((prev + delta).toFixed(2))));
          persistOpacity(next);
          showToast(`Ghost mode: ${Math.round(next * 100)}% opacity`);
          return next;
        });
      });
    },
    [requirePro, showToast]
  );

  const handleCycleOpacity = useCallback(() => {
    requirePro('ghost', () => {
      haptics.playClick();
      setOpacity(prev => {
        let next = 1.0;
        if (prev >= 0.95) next = 0.85;
        else if (prev >= 0.8) next = 0.7;
        else if (prev >= 0.65) next = 0.5;
        persistOpacity(next);
        showToast(`Ghost mode: ${Math.round(next * 100)}% opacity`);
        return next;
      });
    });
  }, [requirePro, showToast]);

  const handleSetOpacity = useCallback(
    (val: number) => {
      requirePro('ghost', () => {
        const clamped = Math.max(0.4, Math.min(1.0, val));
        setOpacity(clamped);
        persistOpacity(clamped);
      });
    },
    [requirePro]
  );

  const handleToggleFocusMode = useCallback(() => {
    requirePro('zen', () => {
      haptics.playClick();
      setIsFocusMode(prev => {
        showToast(prev ? 'Zen mode off' : 'Zen mode on');
        return !prev;
      });
    });
  }, [requirePro, showToast]);

  const handleOpenImageExport = useCallback(() => {
    requirePro('image-cards', () => {
      haptics.playClick();
      setImageExportOpen(true);
    });
  }, [requirePro]);

  const handleToggleDictation = useCallback(() => {
    requirePro('dictation', () => {
      haptics.playClick();
      if (!speechEngine.isSupported()) {
        showToast('Speech recognition is not available on this system');
        return;
      }
      if (isDictating) {
        speechEngine.stop();
        setIsDictating(false);
        showToast('Dictation stopped');
        return;
      }
      const started = speechEngine.start(
        text => {
          if (!text) return;
          const currentContent = activeNoteRef.current.content;
          const sep = currentContent.endsWith('\n') || !currentContent ? '' : '\n';
          updateActiveNoteContent(`${currentContent}${sep}${text}`);
        },
        listening => setIsDictating(listening)
      );
      if (started) {
        setIsDictating(true);
        showToast('Listening');
      } else {
        showToast('Could not access the microphone');
      }
    });
  }, [requirePro, isDictating, showToast, updateActiveNoteContent]);

  const handleCreateNote = useCallback(() => {
    if (!isPro && notes.length >= FREE_NOTE_LIMIT) {
      openLicense('notes');
      return;
    }
    haptics.playClick();
    createNote();
    showToast('New note');
  }, [isPro, notes.length, openLicense, createNote, showToast]);

  const handleSelectTheme = useCallback(
    (next: ThemeId) => {
      if (!isThemeUnlocked(next, isPro)) {
        openLicense('themes');
        return;
      }
      haptics.playClick();
      setTheme(next);
    },
    [isPro, openLicense, setTheme]
  );

  const handleToggleSounds = useCallback(() => {
    const next = !haptics.enabled;
    haptics.setProfile(next ? 'thock' : 'silent');
    setSoundsOn(next);
    showToast(next ? 'Sounds on' : 'Sounds off');
  }, [showToast]);

  const handleCopyNote = useCallback(async () => {
    haptics.playClick();
    try {
      if (navigator.clipboard) await navigator.clipboard.writeText(activeNote.content);
      showToast('Copied as Markdown');
    } catch (e) {
      console.error('Clipboard copy error:', e);
      showToast('Could not copy to the clipboard');
    }
  }, [activeNote.content, showToast]);

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
      showToast(`Exported ${filename}`);
    } catch (e) {
      console.error('Export error:', e);
      showToast('Could not export the note');
    }
  }, [activeNote, showToast]);

  useEffect(() => {
    const handleGlobalKeyDown = (e: KeyboardEvent) => {
      const mod = e.metaKey || e.ctrlKey;
      const key = e.key.toLowerCase();

      if (mod && e.shiftKey && key === 'e') {
        e.preventDefault();
        handleOpenImageExport();
        return;
      }
      if (e.altKey && key === 'd') {
        e.preventDefault();
        handleToggleDictation();
        return;
      }
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
      if (mod && e.shiftKey && key === 'f') {
        e.preventDefault();
        handleToggleFocusMode();
        return;
      }
      if (mod && e.key === ',') {
        e.preventDefault();
        haptics.playClick();
        setSettingsModalOpen(prev => !prev);
        return;
      }
      if (mod && (key === 'k' || key === 'o')) {
        e.preventDefault();
        haptics.playClick();
        setActionsPaletteOpen(prev => !prev);
        return;
      }
      if (e.altKey && key === 'p') {
        e.preventDefault();
        handleTogglePin();
        return;
      }
      if (mod && (key === 'n' || key === 't')) {
        e.preventDefault();
        handleCreateNote();
        return;
      }
      if (mod && key === 'w') {
        e.preventDefault();
        haptics.playClick();
        closeActiveNote();
        showToast('Closed note');
        return;
      }
      if (mod && (e.key === ']' || (e.shiftKey && e.key === '}'))) {
        e.preventDefault();
        haptics.playClick();
        switchToNextNote();
        return;
      }
      if (mod && (e.key === '[' || (e.shiftKey && e.key === '{'))) {
        e.preventDefault();
        haptics.playClick();
        switchToPrevNote();
        return;
      }
      if (mod && /^[1-9]$/.test(e.key)) {
        const index = parseInt(e.key, 10) - 1;
        if (notes[index]) {
          e.preventDefault();
          haptics.playClick();
          setActiveNoteId(notes[index].id);
        }
        return;
      }

      if (e.key === 'Escape') {
        const closers: Array<[boolean, () => void]> = [
          [imageExportOpen, () => setImageExportOpen(false)],
          [settingsModalOpen, () => setSettingsModalOpen(false)],
          [licenseModalOpen, () => setLicenseModalOpen(false)],
          [actionsPaletteOpen, () => setActionsPaletteOpen(false)],
          [isFocusMode, () => { setIsFocusMode(false); showToast('Zen mode off'); }],
        ];
        const open = closers.find(([isOpen]) => isOpen);
        if (open) {
          e.preventDefault();
          haptics.playClick();
          open[1]();
          return;
        }
        if (isTauri) {
          if (document.querySelector('.slash-popover, .bubble-popover')) return;
          const activeTag = document.activeElement?.tagName?.toLowerCase();
          if (activeTag === 'textarea' || activeTag === 'input') {
            (document.activeElement as HTMLElement)?.blur();
            return;
          }
          e.preventDefault();
          handleCloseWindow();
        }
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
    handleCreateNote,
    closeActiveNote,
    switchToNextNote,
    switchToPrevNote,
    notes,
    setActiveNoteId,
    showToast,
    handleToggleDictation,
    handleAdjustOpacity,
    handleToggleFocusMode,
    handleOpenImageExport,
  ]);

  const openActions = () => {
    haptics.playClick();
    setActionsPaletteOpen(true);
  };
  const openSettings = () => {
    haptics.playClick();
    setSettingsModalOpen(true);
  };

  return (
    <div className={`theme-${theme} w-full h-full flex flex-col overflow-hidden bg-transparent`}>
      <div
        ref={windowShellRef}
        onMouseMove={handleMouseMove}
        style={{ opacity }}
        className="window-shell w-full h-full rounded-2xl flex flex-col overflow-hidden relative transition-opacity duration-150"
      >
        <div className="specular-glow" />
        <ParticleBurstCanvas ref={particleCanvasRef} />

        {!isFocusMode ? (
          <WindowHeader
            notes={notes}
            activeNoteId={activeNoteId}
            onSelectNote={id => {
              haptics.playClick();
              setActiveNoteId(id);
            }}
            onCreateNote={handleCreateNote}
            isPinned={isPinned}
            onTogglePin={handleTogglePin}
            currentTheme={themeConfig}
            onToggleThemeMode={() => {
              haptics.playClick();
              toggleLightDark();
            }}
            onOpenActions={openActions}
            onOpenSettings={openSettings}
            onCloseWindow={handleCloseWindow}
            onMinimizeWindow={handleMinimizeWindow}
            isPro={isPro}
            onOpenLicense={() => openLicense(null)}
          />
        ) : (
          <button
            onClick={handleToggleFocusMode}
            className="absolute top-3 right-3 z-30 px-2.5 py-1 rounded-lg bg-black/60 hover:bg-black/90 text-white/50 hover:text-white border border-white/15 text-[10px] font-mono transition-all flex items-center gap-1 shadow-lg cursor-pointer"
            title="Exit Zen mode (Esc or ⌘⇧F)"
          >
            <span>Exit Zen (Esc)</span>
          </button>
        )}

        {availableUpdate && !updateDismissed && !isFocusMode && (
          <UpdateBanner
            version={availableUpdate.version}
            progress={updateProgress}
            onInstall={handleInstallUpdate}
            onDismiss={() => setUpdateDismissed(true)}
          />
        )}

        <NoteEditor
          content={activeNote.content}
          onChange={updateActiveNoteContent}
          onOpenActions={openActions}
          onTaskCheckBurst={(x, y) => {
            particleCanvasRef.current?.burst(x, y, [themeConfig.accent, '#FFFFFF', '#38BDF8', '#F59E0B']);
          }}
        />

        {!isFocusMode && (
          <ActionBar
            content={activeNote.content}
            onOpenActions={openActions}
            onOpenImageExport={handleOpenImageExport}
            isDictating={isDictating}
            onToggleDictation={handleToggleDictation}
            opacity={opacity}
            onCycleOpacity={handleCycleOpacity}
            isPro={isPro}
          />
        )}

        <CommandPaletteModal
          isOpen={actionsPaletteOpen}
          onClose={() => setActionsPaletteOpen(false)}
          onCopyNote={handleCopyNote}
          isPinned={isPinned}
          onTogglePin={handleTogglePin}
          currentTheme={theme}
          onSelectTheme={handleSelectTheme}
          onCreateNote={handleCreateNote}
          onDeleteNote={() => {
            haptics.playClick();
            deleteActiveNote();
            showToast('Deleted note');
          }}
          onExportNote={handleExportNote}
          isPro={isPro}
          onOpenLicense={() => openLicense(null)}
          onOpenSettings={openSettings}
          onOpenImageExport={handleOpenImageExport}
          isDictating={isDictating}
          onToggleDictation={handleToggleDictation}
          opacity={opacity}
          onCycleOpacity={handleCycleOpacity}
          isFocusMode={isFocusMode}
          onToggleFocusMode={handleToggleFocusMode}
          soundsOn={soundsOn}
          onToggleSounds={handleToggleSounds}
          onCheckForUpdates={handleCheckForUpdates}
        />

        <ImageExportModal
          isOpen={imageExportOpen}
          onClose={() => setImageExportOpen(false)}
          note={activeNote}
          themeConfig={themeConfig}
          onShowToast={showToast}
        />

        <SettingsModal
          isOpen={settingsModalOpen}
          onClose={() => setSettingsModalOpen(false)}
          currentTheme={theme}
          onSelectTheme={handleSelectTheme}
          licenseStatus={licenseStatus}
          onLicenseChanged={applyLicense}
          onRequirePro={feature => openLicense(feature)}
          onShowToast={showToast}
          opacity={opacity}
          onChangeOpacity={handleSetOpacity}
          onCheckForUpdates={handleCheckForUpdates}
          checkingUpdates={checkingUpdates}
        />

        <LicenseModal
          isOpen={licenseModalOpen}
          onClose={() => setLicenseModalOpen(false)}
          licenseStatus={licenseStatus}
          onLicenseChanged={applyLicense}
          lockedFeature={lockedFeature}
        />

        {toastMessage && (
          <div className="absolute bottom-12 left-1/2 -translate-x-1/2 z-50 px-3.5 py-1.5 rounded-xl bg-black/90 text-white border border-white/20 text-xs font-medium shadow-2xl pointer-events-none animate-fadeIn">
            {toastMessage}
          </div>
        )}
      </div>
    </div>
  );
};

export default App;
