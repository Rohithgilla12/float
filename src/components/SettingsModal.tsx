import React, { useState, useEffect } from 'react';
import {
  Folder,
  Keyboard,
  Sparkles,
  Palette,
  ExternalLink,
  FolderOpen,
  Check,
  RefreshCw,
  LogOut,
  X,
} from 'lucide-react';
import { ThemeId, THEMES } from '../types/theme';
import { LicenseStatus, activateDodoLicense, deactivateDodoLicense, openExternalLink, DODO_CHECKOUT_URL } from '../utils/license';
import {
  getStoredSettings,
  saveStoredSettings,
  pickStorageFolder,
  revealStorageInFinder,
  initStorageDirectory,
} from '../utils/storage';
import { getKeybindSettings, saveKeybindSettings, KeybindSettings } from '../utils/keybinds';
import { haptics } from '../utils/audioHaptics';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentTheme: ThemeId;
  onSelectTheme: (theme: ThemeId) => void;
  licenseStatus: LicenseStatus;
  onLicenseChanged: (status: LicenseStatus) => void;
  onShowToast: (msg: string) => void;
}

type SettingsTab = 'storage' | 'shortcuts' | 'license' | 'appearance';

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  currentTheme,
  onSelectTheme,
  licenseStatus,
  onLicenseChanged,
  onShowToast,
}) => {
  const [activeTab, setActiveTab] = useState<SettingsTab>('storage');
  const [storageSettings, setStorageSettings] = useState(getStoredSettings);
  const [keybinds, setKeybinds] = useState<KeybindSettings>(getKeybindSettings);
  const [licenseInput, setLicenseInput] = useState('');
  const [licenseLoading, setLicenseLoading] = useState(false);
  const [licenseMsg, setLicenseMsg] = useState<{ text: string; isError: boolean } | null>(null);

  useEffect(() => {
    if (isOpen) {
      setStorageSettings(getStoredSettings());
      setKeybinds(getKeybindSettings());
      setLicenseMsg(null);
      initStorageDirectory().then(dir => {
        if (dir) {
          setStorageSettings(prev => ({ ...prev, notesDir: dir }));
        }
      });
    }
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        e.stopPropagation();
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handlePickFolder = async () => {
    haptics.playClick();
    const picked = await pickStorageFolder();
    if (picked) {
      const updated = { ...storageSettings, notesDir: picked };
      setStorageSettings(updated);
      saveStoredSettings(updated);
      onShowToast(`📁 Saved storage directory: ${picked}`);
    }
  };

  const handleRevealFinder = () => {
    haptics.playClick();
    revealStorageInFinder(storageSettings.notesDir);
  };

  const handleToggleAutoSave = () => {
    haptics.playClick();
    const updated = { ...storageSettings, autoSaveToDisk: !storageSettings.autoSaveToDisk };
    setStorageSettings(updated);
    saveStoredSettings(updated);
  };

  const handleUpdateKeybind = <K extends keyof KeybindSettings>(key: K, value: KeybindSettings[K]) => {
    haptics.playClick();
    const updated = { ...keybinds, [key]: value };
    setKeybinds(updated);
    saveKeybindSettings(updated);
    onShowToast(`⌨️ Updated shortcut for ${key}`);
  };

  const handleActivateLicense = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!licenseInput.trim()) return;
    setLicenseLoading(true);
    setLicenseMsg(null);
    haptics.playClick();

    const res = await activateDodoLicense(licenseInput);
    setLicenseLoading(false);
    if (res.success) {
      haptics.playSuccess();
      onLicenseChanged(res.status);
      setLicenseMsg({ text: res.message, isError: false });
    } else {
      setLicenseMsg({ text: res.message, isError: true });
    }
  };

  const handleDeactivate = async () => {
    if (!confirm('Deactivate your Float Pro license on this device?')) return;
    haptics.playClick();
    setLicenseLoading(true);
    await deactivateDodoLicense();
    setLicenseLoading(false);
    onLicenseChanged({ isPro: false, licenseKey: null, activatedAt: null });
    setLicenseMsg({ text: 'License deactivated.', isError: false });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
      <div className="absolute inset-0" onClick={onClose} />

      <div className="relative w-full max-w-xl rounded-2xl bg-[var(--bg-window-solid)] border border-[var(--border-highlight)] shadow-2xl overflow-hidden flex flex-col z-10 text-[var(--text-primary)]">
        {/* Header */}
        <div className="h-14 px-6 border-b border-[var(--border-subtle)] flex items-center justify-between bg-[var(--bg-surface)]">
          <div className="flex items-center gap-2">
            <span className="font-bold text-sm tracking-tight">Preferences &amp; Settings</span>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-[var(--kbd-bg)] border border-[var(--kbd-border)] text-[var(--text-muted)]">
              Float
            </span>
          </div>

          <button
            onClick={onClose}
            className="p-1 rounded-lg text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-surface-hover)] transition-colors cursor-pointer"
            title="Close Settings (Esc)"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center gap-1 px-6 py-2 border-b border-[var(--border-subtle)] bg-black/10 text-xs">
          <button
            onClick={() => {
              haptics.playClick();
              setActiveTab('storage');
            }}
            className={`px-3 py-1.5 rounded-lg flex items-center gap-1.5 font-medium transition-all cursor-pointer ${
              activeTab === 'storage'
                ? 'bg-[var(--bg-surface-active)] text-[var(--text-primary)] shadow-sm'
                : 'text-[var(--text-muted)] hover:text-[var(--text-secondary)] hover:bg-[var(--bg-surface-hover)]'
            }`}
          >
            <Folder className="w-3.5 h-3.5" />
            <span>Storage &amp; Files</span>
          </button>

          <button
            onClick={() => {
              haptics.playClick();
              setActiveTab('shortcuts');
            }}
            className={`px-3 py-1.5 rounded-lg flex items-center gap-1.5 font-medium transition-all cursor-pointer ${
              activeTab === 'shortcuts'
                ? 'bg-[var(--bg-surface-active)] text-[var(--text-primary)] shadow-sm'
                : 'text-[var(--text-muted)] hover:text-[var(--text-secondary)] hover:bg-[var(--bg-surface-hover)]'
            }`}
          >
            <Keyboard className="w-3.5 h-3.5" />
            <span>Shortcuts</span>
          </button>

          <button
            onClick={() => {
              haptics.playClick();
              setActiveTab('license');
            }}
            className={`px-3 py-1.5 rounded-lg flex items-center gap-1.5 font-medium transition-all cursor-pointer ${
              activeTab === 'license'
                ? 'bg-[var(--bg-surface-active)] text-[var(--text-primary)] shadow-sm'
                : 'text-[var(--text-muted)] hover:text-[var(--text-secondary)] hover:bg-[var(--bg-surface-hover)]'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span>License &amp; Pro</span>
          </button>

          <button
            onClick={() => {
              haptics.playClick();
              setActiveTab('appearance');
            }}
            className={`px-3 py-1.5 rounded-lg flex items-center gap-1.5 font-medium transition-all cursor-pointer ${
              activeTab === 'appearance'
                ? 'bg-[var(--bg-surface-active)] text-[var(--text-primary)] shadow-sm'
                : 'text-[var(--text-muted)] hover:text-[var(--text-secondary)] hover:bg-[var(--bg-surface-hover)]'
            }`}
          >
            <Palette className="w-3.5 h-3.5" />
            <span>Appearance</span>
          </button>
        </div>

        {/* Tab Body */}
        <div className="p-6 max-h-[460px] overflow-y-auto space-y-6">
          {/* TAB 1: STORAGE */}
          {activeTab === 'storage' && (
            <div className="space-y-5">
              <div>
                <h3 className="text-sm font-semibold">Notes Folder Location</h3>
                <p className="text-xs text-[var(--text-muted)] mt-1">
                  Float automatically writes each note as a raw, portable Markdown file (<code className="font-mono text-[11px]">.md</code>) to this directory.
                </p>

                <div className="mt-3 p-3 rounded-xl bg-black/20 border border-[var(--border-subtle)] flex items-center justify-between gap-3 font-mono text-xs text-[var(--text-secondary)]">
                  <span className="truncate">{storageSettings.notesDir}</span>
                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      onClick={handlePickFolder}
                      className="px-2.5 py-1 rounded-lg bg-[var(--kbd-bg)] hover:bg-[var(--bg-surface-hover)] border border-[var(--kbd-border)] text-xs font-sans font-medium text-[var(--text-primary)] transition-all cursor-pointer"
                    >
                      Change...
                    </button>
                    <button
                      onClick={handleRevealFinder}
                      title="Reveal in Finder"
                      className="p-1 rounded-lg hover:bg-[var(--bg-surface-hover)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors cursor-pointer"
                    >
                      <FolderOpen className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>

              <div className="pt-4 border-t border-[var(--border-subtle)] flex items-center justify-between">
                <div>
                  <h4 className="text-xs font-semibold">Auto-Save Markdown Files</h4>
                  <p className="text-[11px] text-[var(--text-muted)] mt-0.5">
                    Sync changes instantly to disk so your notes are accessible in Obsidian, VS Code, or Finder.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={handleToggleAutoSave}
                  className={`w-10 h-5 rounded-full transition-colors relative cursor-pointer ${
                    storageSettings.autoSaveToDisk ? 'bg-amber-500' : 'bg-white/10'
                  }`}
                >
                  <span
                    className={`absolute top-0.5 w-4 h-4 rounded-full bg-white transition-transform ${
                      storageSettings.autoSaveToDisk ? 'left-5' : 'left-0.5'
                    }`}
                  />
                </button>
              </div>

              <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-xs text-emerald-400 flex items-center gap-2">
                <Check className="w-4 h-4 shrink-0" />
                <span>Zero proprietary formats. You own all your data in plain text.</span>
              </div>
            </div>
          )}

          {/* TAB 2: KEYBOARD SHORTCUTS */}
          {activeTab === 'shortcuts' && (
            <div className="space-y-4">
              <p className="text-xs text-[var(--text-muted)] mb-2">
                Configure your keybinds for high-speed scratchpad workflows:
              </p>

              {/* New Tab Shortcut */}
              <div className="flex items-center justify-between p-3 rounded-xl bg-black/10 border border-[var(--border-subtle)]">
                <div>
                  <div className="text-xs font-semibold">New Note / Tab</div>
                  <div className="text-[11px] text-[var(--text-muted)]">Spawn a fresh blank note tab</div>
                </div>
                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => handleUpdateKeybind('newNoteKey', 'mod+n')}
                    className={`px-2.5 py-1 rounded-lg text-xs font-mono font-semibold transition-all cursor-pointer ${
                      keybinds.newNoteKey === 'mod+n'
                        ? 'bg-[var(--accent-glow)] text-[var(--accent-color)] border border-[var(--accent-color)]/40 shadow-sm'
                        : 'bg-[var(--kbd-bg)] text-[var(--text-muted)] border border-[var(--kbd-border)] hover:text-white'
                    }`}
                  >
                    ⌘N
                  </button>
                  <button
                    onClick={() => handleUpdateKeybind('newNoteKey', 'mod+t')}
                    className={`px-2.5 py-1 rounded-lg text-xs font-mono font-semibold transition-all cursor-pointer ${
                      keybinds.newNoteKey === 'mod+t'
                        ? 'bg-[var(--accent-glow)] text-[var(--accent-color)] border border-[var(--accent-color)]/40 shadow-sm'
                        : 'bg-[var(--kbd-bg)] text-[var(--text-muted)] border border-[var(--kbd-border)] hover:text-white'
                    }`}
                  >
                    ⌘T
                  </button>
                </div>
              </div>

              {/* Close Tab Shortcut */}
              <div className="flex items-center justify-between p-3 rounded-xl bg-black/10 border border-[var(--border-subtle)]">
                <div>
                  <div className="text-xs font-semibold">Close Active Note / Tab</div>
                  <div className="text-[11px] text-[var(--text-muted)]">Close current tab and switch to adjacent</div>
                </div>
                <span className="px-2.5 py-1 rounded-lg bg-[var(--kbd-bg)] border border-[var(--kbd-border)] text-xs font-mono font-semibold text-[var(--text-primary)]">
                  ⌘W
                </span>
              </div>

              {/* Quick Switcher / Palette */}
              <div className="flex items-center justify-between p-3 rounded-xl bg-black/10 border border-[var(--border-subtle)]">
                <div>
                  <div className="text-xs font-semibold">Command Palette &amp; Search</div>
                  <div className="text-[11px] text-[var(--text-muted)]">Search notes, actions, and themes</div>
                </div>
                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => handleUpdateKeybind('openPaletteKey', 'mod+k')}
                    className={`px-2.5 py-1 rounded-lg text-xs font-mono font-semibold transition-all cursor-pointer ${
                      keybinds.openPaletteKey === 'mod+k'
                        ? 'bg-[var(--accent-glow)] text-[var(--accent-color)] border border-[var(--accent-color)]/40 shadow-sm'
                        : 'bg-[var(--kbd-bg)] text-[var(--text-muted)] border border-[var(--kbd-border)] hover:text-white'
                    }`}
                  >
                    ⌘K
                  </button>
                  <button
                    onClick={() => handleUpdateKeybind('openPaletteKey', 'mod+o')}
                    className={`px-2.5 py-1 rounded-lg text-xs font-mono font-semibold transition-all cursor-pointer ${
                      keybinds.openPaletteKey === 'mod+o'
                        ? 'bg-[var(--accent-glow)] text-[var(--accent-color)] border border-[var(--accent-color)]/40 shadow-sm'
                        : 'bg-[var(--kbd-bg)] text-[var(--text-muted)] border border-[var(--kbd-border)] hover:text-white'
                    }`}
                  >
                    ⌘O
                  </button>
                </div>
              </div>

              {/* Pin Window */}
              <div className="flex items-center justify-between p-3 rounded-xl bg-black/10 border border-[var(--border-subtle)]">
                <div>
                  <div className="text-xs font-semibold">Toggle Always on Top</div>
                  <div className="text-[11px] text-[var(--text-muted)]">Pin float window above fullscreen editors</div>
                </div>
                <span className="px-2.5 py-1 rounded-lg bg-[var(--kbd-bg)] border border-[var(--kbd-border)] text-xs font-mono font-semibold text-[var(--text-primary)]">
                  ⌥P
                </span>
              </div>

              {/* Settings Shortcut */}
              <div className="flex items-center justify-between p-3 rounded-xl bg-black/10 border border-[var(--border-subtle)]">
                <div>
                  <div className="text-xs font-semibold">Preferences / Settings</div>
                  <div className="text-[11px] text-[var(--text-muted)]">Open this settings modal</div>
                </div>
                <span className="px-2.5 py-1 rounded-lg bg-[var(--kbd-bg)] border border-[var(--kbd-border)] text-xs font-mono font-semibold text-[var(--text-primary)]">
                  ⌘,
                </span>
              </div>

              {/* Quick Jump 1..9 */}
              <div className="flex items-center justify-between p-3 rounded-xl bg-black/10 border border-[var(--border-subtle)]">
                <div>
                  <div className="text-xs font-semibold">Switch Tabs by Number</div>
                  <div className="text-[11px] text-[var(--text-muted)]">Jump directly to tab 1 through 9</div>
                </div>
                <span className="px-2.5 py-1 rounded-lg bg-[var(--kbd-bg)] border border-[var(--kbd-border)] text-xs font-mono font-semibold text-[var(--text-primary)]">
                  ⌘1 .. 9
                </span>
              </div>

              {/* Global Hotkey */}
              <div className="flex items-center justify-between p-3 rounded-xl bg-black/10 border border-[var(--border-subtle)]">
                <div>
                  <div className="text-xs font-semibold">Global Window Summon (System-wide)</div>
                  <div className="text-[11px] text-[var(--text-muted)]">Summon Float over any running desktop app</div>
                </div>
                <span className="px-2.5 py-1 rounded-lg bg-amber-500/15 border border-amber-500/30 text-xs font-mono font-bold text-amber-400">
                  ⌥Space
                </span>
              </div>
            </div>
          )}

          {/* TAB 3: LICENSE & PRO */}
          {activeTab === 'license' && (
            <div className="space-y-5">
              <div className="p-4 rounded-xl bg-gradient-to-br from-amber-500/15 via-transparent to-transparent border border-amber-500/30 flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-bold">Float Pro License</span>
                    <span className={`text-[10px] font-mono px-2 py-0.5 rounded-full font-bold ${
                      licenseStatus.isPro ? 'bg-amber-500 text-black' : 'bg-white/10 text-white/60'
                    }`}>
                      {licenseStatus.isPro ? 'ACTIVE' : 'FREE'}
                    </span>
                  </div>
                  <p className="text-xs text-[var(--text-muted)] mt-1">
                    {licenseStatus.isPro
                      ? `Activated license: ${licenseStatus.licenseKey || 'Lifetime Pro'}`
                      : 'Lifetime license • One-time $4.99 • Powered by Dodo Payments'}
                  </p>
                </div>

                {!licenseStatus.isPro && (
                  <button
                    onClick={() => openExternalLink(DODO_CHECKOUT_URL)}
                    className="px-4 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-amber-400 text-black font-bold text-xs shadow-lg shadow-amber-500/20 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center gap-1.5 cursor-pointer"
                  >
                    <span>Buy Pro &bull; $4.99</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>

              <div>
                <label className="block text-xs font-semibold mb-1.5">Enter License Key</label>
                <form onSubmit={handleActivateLicense} className="flex gap-2">
                  <input
                    type="text"
                    value={licenseInput}
                    onChange={e => setLicenseInput(e.target.value)}
                    placeholder="FLOAT-PRO-XXXX-XXXX-XXXX"
                    className="flex-1 px-3 py-2 rounded-xl bg-black/20 border border-[var(--border-subtle)] text-xs font-mono outline-none focus:border-amber-500 text-[var(--text-primary)]"
                  />
                  <button
                    type="submit"
                    disabled={licenseLoading || !licenseInput.trim()}
                    className="px-4 py-2 rounded-xl bg-[var(--kbd-bg)] hover:bg-[var(--bg-surface-hover)] border border-[var(--kbd-border)] text-xs font-semibold disabled:opacity-50 transition-all cursor-pointer"
                  >
                    {licenseLoading ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : 'Activate'}
                  </button>
                </form>

                {licenseMsg && (
                  <p className={`text-xs mt-2 font-mono ${licenseMsg.isError ? 'text-rose-400' : 'text-emerald-400'}`}>
                    {licenseMsg.text}
                  </p>
                )}
              </div>

              {licenseStatus.isPro && (
                <div className="pt-4 border-t border-[var(--border-subtle)] flex items-center justify-between">
                  <span className="text-xs text-[var(--text-muted)]">Want to transfer this license to another Mac?</span>
                  <button
                    onClick={handleDeactivate}
                    className="text-xs text-rose-400 hover:text-rose-300 font-medium flex items-center gap-1 cursor-pointer"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                    <span>Deactivate Device</span>
                  </button>
                </div>
              )}
            </div>
          )}

          {/* TAB 4: APPEARANCE */}
          {activeTab === 'appearance' && (
            <div className="space-y-4">
              <h3 className="text-xs font-semibold">Select Desktop Theme</h3>
              <div className="grid grid-cols-2 gap-2.5">
                {Object.values(THEMES).map(theme => {
                  const isActive = theme.id === currentTheme;
                  return (
                    <button
                      key={theme.id}
                      onClick={() => {
                        haptics.playClick();
                        onSelectTheme(theme.id);
                      }}
                      className={`p-3 rounded-xl border text-left transition-all cursor-pointer flex flex-col justify-between h-20 ${
                        isActive
                          ? 'border-amber-500/50 bg-amber-500/10 shadow-sm'
                          : 'border-[var(--border-subtle)] bg-black/10 hover:border-white/20'
                      }`}
                    >
                      <div className="flex items-center justify-between w-full">
                        <span className="text-xs font-bold text-white">{theme.name}</span>
                        <span
                          className="w-3.5 h-3.5 rounded-full border border-white/20"
                          style={{ backgroundColor: theme.accent }}
                        />
                      </div>
                      <span className="text-[10px] text-[var(--text-muted)] font-mono">
                        {theme.isDark ? '🌙 Dark' : '☀️ Light'} &bull; {theme.tagline}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
