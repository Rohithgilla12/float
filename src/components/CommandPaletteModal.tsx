import React, { useState, useEffect, useRef } from 'react';
import {
  Copy,
  Pin,
  Palette,
  Plus,
  Trash2,
  FileDown,
  Search,
  Sparkles,
  Key,
  Settings,
  Image as ImageIcon,
  Mic,
  Eye,
  Maximize2,
  Lock,
  Volume2,
  VolumeX,
  ArrowDownToLine,
} from 'lucide-react';
import { isThemeUnlocked, PRO_PRICE } from '../utils/license';
import { ThemeId, THEMES } from '../types/theme';
import { haptics } from '../utils/audioHaptics';

interface CommandPaletteModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCopyNote: () => void;
  isPinned: boolean;
  onTogglePin: () => void;
  currentTheme: ThemeId;
  onSelectTheme: (theme: ThemeId) => void;
  onCreateNote: () => void;
  onDeleteNote: () => void;
  onExportNote: () => void;
  isPro?: boolean;
  onOpenLicense?: () => void;
  onOpenSettings?: () => void;
  onOpenImageExport?: () => void;
  isDictating?: boolean;
  onToggleDictation?: () => void;
  opacity?: number;
  onCycleOpacity?: () => void;
  isFocusMode?: boolean;
  onToggleFocusMode?: () => void;
  soundsOn?: boolean;
  onToggleSounds?: () => void;
  onCheckForUpdates?: () => void;
}

interface ActionItem {
  id: string;
  label: string;
  description: string;
  shortcut?: string;
  icon: React.ReactNode;
  category: string;
  action: () => void;
}

export const CommandPaletteModal: React.FC<CommandPaletteModalProps> = ({
  isOpen,
  onClose,
  onCopyNote,
  isPinned,
  onTogglePin,
  currentTheme,
  onSelectTheme,
  onCreateNote,
  onDeleteNote,
  onExportNote,
  isPro,
  onOpenLicense,
  onOpenSettings,
  onOpenImageExport,
  isDictating,
  onToggleDictation,
  opacity = 1.0,
  onCycleOpacity,
  isFocusMode,
  onToggleFocusMode,
  soundsOn = true,
  onToggleSounds,
  onCheckForUpdates,
}) => {
  const proTag = isPro ? undefined : 'Pro';
  const [search, setSearch] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [viewingThemes, setViewingThemes] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      setSearch('');
      setSelectedIndex(0);
      setViewingThemes(false);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [isOpen]);

  const licensingActions: ActionItem[] = onOpenLicense
    ? [
        isPro
          ? {
              id: 'license-active',
              label: 'Float Pro',
              description: 'Licensed on this Mac. Manage or release the key.',
              shortcut: 'PRO',
              icon: <Sparkles className="w-4 h-4 fill-current text-amber-400" />,
              category: 'Float Pro',
              action: () => {
                onClose();
                onOpenLicense();
              },
            }
          : {
              id: 'upgrade-pro',
              label: `Unlock Float Pro (${PRO_PRICE})`,
              description: 'All themes, unlimited notes, image cards, dictation, ghost and zen modes',
              icon: <Key className="w-4 h-4 text-amber-400" />,
              category: 'Float Pro',
              action: () => {
                onClose();
                onOpenLicense();
              },
            },
      ]
    : [];

  const mainActions: ActionItem[] = [
    ...licensingActions,
    ...(onOpenImageExport
      ? [
          {
            id: 'export-image',
            label: 'Export as image card',
            description: 'A 2x PNG of this note for sharing',
            shortcut: proTag ?? '⌘⇧E',
            icon: <ImageIcon className="w-4 h-4 text-pink-400" />,
            category: 'Primary Actions',
            action: () => {
              onClose();
              onOpenImageExport();
            },
          },
        ]
      : []),
    ...(onToggleDictation
      ? [
          {
            id: 'dictate',
            label: isDictating ? 'Stop dictation' : 'Voice dictation',
            description: 'Speak and Float types',
            shortcut: proTag ?? '⌥D',
            icon: <Mic className={`w-4 h-4 ${isDictating ? 'text-rose-400 animate-pulse' : 'text-amber-400'}`} />,
            category: 'Primary Actions',
            action: () => {
              onClose();
              onToggleDictation();
            },
          },
        ]
      : []),
    ...(onCycleOpacity
      ? [
          {
            id: 'ghost-mode',
            label: isPro ? `Ghost mode (${Math.round(opacity * 100)}% opacity)` : 'Ghost mode',
            description: 'See through the window to what is behind it',
            shortcut: proTag ?? '⌥[ / ⌥]',
            icon: <Eye className="w-4 h-4 text-cyan-400" />,
            category: 'Preferences',
            action: () => {
              onCycleOpacity();
            },
          },
        ]
      : []),
    ...(onToggleFocusMode
      ? [
          {
            id: 'focus-mode',
            label: isFocusMode ? 'Exit zen mode' : 'Zen mode',
            description: 'Hide every control and keep only the page',
            shortcut: proTag ?? '⌘⇧F',
            icon: <Maximize2 className="w-4 h-4 text-indigo-400" />,
            category: 'Preferences',
            action: () => {
              onClose();
              onToggleFocusMode();
            },
          },
        ]
      : []),
    ...(onToggleSounds
      ? [
          {
            id: 'sounds',
            label: soundsOn ? 'Turn sounds off' : 'Turn sounds on',
            description: 'Click and tick sounds for keys and checkboxes',
            icon: soundsOn ? <Volume2 className="w-4 h-4 text-teal-400" /> : <VolumeX className="w-4 h-4 text-teal-400" />,
            category: 'Preferences',
            action: () => {
              onToggleSounds();
            },
          },
        ]
      : []),
    ...(onCheckForUpdates
      ? [
          {
            id: 'updates',
            label: 'Check for updates',
            description: 'Fetch the latest Float release',
            icon: <ArrowDownToLine className="w-4 h-4 text-sky-400" />,
            category: 'Preferences',
            action: () => {
              onClose();
              onCheckForUpdates();
            },
          },
        ]
      : []),
    {
      id: 'copy',
      label: 'Copy as Markdown',
      description: 'Copy the whole note to the clipboard',
      shortcut: '⌘C',
      icon: <Copy className="w-4 h-4 text-emerald-400" />,
      category: 'Primary Actions',
      action: () => {
        onCopyNote();
        onClose();
      },
    },
    {
      id: 'pin',
      label: isPinned ? 'Unpin' : 'Pin above other windows',
      description: 'Stay on top of full-screen apps',
      shortcut: '⌥P',
      icon: <Pin className={`w-4 h-4 ${isPinned ? 'fill-current text-amber-400' : 'text-amber-400'}`} />,
      category: 'Primary Actions',
      action: () => {
        onTogglePin();
        onClose();
      },
    },
    {
      id: 'theme',
      label: 'Change theme',
      description: `Current: ${THEMES[currentTheme].name}`,
      shortcut: '⌥T',
      icon: <Palette className="w-4 h-4 text-purple-400" />,
      category: 'Preferences',
      action: () => {
        setViewingThemes(true);
        setSearch('');
        setSelectedIndex(0);
      },
    },
    ...(onOpenSettings
      ? [
          {
            id: 'settings',
            label: 'Settings',
            description: 'Notes folder, shortcuts, licence, appearance',
            shortcut: '⌘,',
            icon: <Settings className="w-4 h-4 text-cyan-400" />,
            category: 'Preferences',
            action: () => {
              onClose();
              onOpenSettings();
            },
          },
        ]
      : []),
    {
      id: 'new',
      label: 'New note',
      description: 'Open a fresh tab',
      shortcut: '⌘N',
      icon: <Plus className="w-4 h-4 text-blue-400" />,
      category: 'Note Management',
      action: () => {
        onCreateNote();
        onClose();
      },
    },
    {
      id: 'export',
      label: 'Export as .md',
      description: 'Save this note as a Markdown file',
      shortcut: '⌘E',
      icon: <FileDown className="w-4 h-4 text-sky-400" />,
      category: 'Note Management',
      action: () => {
        onExportNote();
        onClose();
      },
    },
    {
      id: 'delete',
      label: 'Delete note',
      description: 'Remove this note and its file',
      shortcut: '⌘⌫',
      icon: <Trash2 className="w-4 h-4 text-rose-400" />,
      category: 'Danger',
      action: () => {
        onDeleteNote();
        onClose();
      },
    },
  ];

  const themeActions: ActionItem[] = Object.values(THEMES).map(t => ({
    id: t.id,
    label: t.name,
    description: `${t.isDark ? 'Dark' : 'Light'}. ${t.tagline}`,
    shortcut: t.id === currentTheme ? 'Active' : isThemeUnlocked(t.id, !!isPro) ? undefined : 'Pro',
    icon: isThemeUnlocked(t.id, !!isPro) ? (
      <span
        className="w-3.5 h-3.5 rounded-full border border-white/30"
        style={{ backgroundColor: t.accent }}
      />
    ) : (
      <Lock className="w-3.5 h-3.5 text-amber-400" />
    ),
    category: t.isDark ? 'Dark Themes' : 'Light Themes',
    action: () => {
      onSelectTheme(t.id);
      setViewingThemes(false);
      onClose();
    },
  }));

  const activeList = viewingThemes ? themeActions : mainActions;
  const filteredActions = activeList.filter(
    a =>
      a.label.toLowerCase().includes(search.toLowerCase()) ||
      a.description.toLowerCase().includes(search.toLowerCase())
  );

  useEffect(() => {
    setSelectedIndex(0);
  }, [search, viewingThemes]);

  // Keyboard navigation
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setSelectedIndex(prev => (prev + 1) % (filteredActions.length || 1));
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setSelectedIndex(prev => (prev - 1 + filteredActions.length) % (filteredActions.length || 1));
      } else if (e.key === 'Enter') {
        e.preventDefault();
        if (filteredActions[selectedIndex]) {
          haptics.playClick();
          filteredActions[selectedIndex].action();
        }
      } else if (e.key === 'Escape') {
        e.preventDefault();
        e.stopPropagation();
        if (viewingThemes) {
          setViewingThemes(false);
        } else {
          onClose();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, filteredActions, selectedIndex, viewingThemes, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-14 bg-black/60 backdrop-blur-sm p-4 animate-fadeIn">
      {/* Click outside to dismiss */}
      <div className="absolute inset-0" onClick={onClose} />

      <div className="morph-palette-container relative w-full max-w-md rounded-2xl bg-[var(--bg-window-solid)] border border-[var(--border-highlight)] shadow-2xl overflow-hidden flex flex-col z-10">
        
        {/* Search Header */}
        <div className="px-4 py-3 border-b border-[var(--border-subtle)] flex items-center gap-3">
          <Search className="w-4 h-4 text-[var(--accent-color)]" />
          <input
            ref={inputRef}
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder={viewingThemes ? 'Search themes' : 'Type a command'}
            className="bg-transparent text-sm text-[var(--text-primary)] placeholder-[var(--text-muted)] outline-none w-full font-sans"
          />
          <kbd className="px-1.5 py-0.5 rounded bg-[var(--kbd-bg)] border border-[var(--kbd-border)] text-[10px] font-mono text-[var(--text-muted)]">
            ESC
          </kbd>
        </div>

        {/* Breadcrumb if in theme picker */}
        {viewingThemes && (
          <div className="px-4 py-1.5 bg-black/5 dark:bg-white/5 border-b border-[var(--border-subtle)] text-[11px] font-mono text-[var(--text-muted)] flex items-center justify-between">
            <span>Themes</span>
            <button
              onClick={() => setViewingThemes(false)}
              className="text-[var(--accent-color)] hover:underline"
            >
              &larr; Back
            </button>
          </div>
        )}

        {/* List of Actions */}
        <div className="max-h-72 overflow-y-auto p-1.5 space-y-0.5">
          {filteredActions.length === 0 ? (
            <div className="py-6 text-center text-xs text-[var(--text-muted)] font-mono">
              Nothing matches
            </div>
          ) : (
            filteredActions.map((item, idx) => {
              const isSelected = idx === selectedIndex;
              return (
                <div
                  key={item.id}
                  onClick={() => {
                    haptics.playClick();
                    item.action();
                  }}
                  onMouseEnter={() => setSelectedIndex(idx)}
                  className={`flex items-center justify-between px-3 py-2 rounded-xl cursor-pointer transition-colors ${
                    isSelected
                      ? 'bg-[var(--accent-glow)] text-[var(--text-primary)] border border-[var(--accent-color)]/30 font-medium'
                      : 'hover:bg-[var(--bg-surface-hover)] text-[var(--text-secondary)] border border-transparent'
                  }`}
                >
                  <div className="flex items-center gap-3 truncate">
                    <span
                      className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 ${
                        isSelected
                          ? 'bg-[var(--accent-color)]/20'
                          : 'bg-black/5 dark:bg-white/5'
                      }`}
                    >
                      {item.icon}
                    </span>
                    <div className="truncate">
                      <div className="text-xs truncate">{item.label}</div>
                      <div className="text-[11px] text-[var(--text-muted)] truncate">
                        {item.description}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5 shrink-0 pl-2">
                    {item.shortcut && (
                      <kbd className="px-1.5 py-0.5 rounded bg-[var(--kbd-bg)] border border-[var(--kbd-border)] text-[10px] font-mono text-[var(--text-muted)]">
                        {item.shortcut}
                      </kbd>
                    )}
                    {isSelected && (
                      <span className="text-xs font-mono text-[var(--accent-color)]">
                        ↵
                      </span>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer Shortcut Helper */}
        <div className="px-4 py-2 border-t border-[var(--border-subtle)] bg-[var(--bg-surface)] text-[11px] font-mono text-[var(--text-muted)] flex items-center justify-between">
          <span>Navigate with <kbd>↑</kbd> <kbd>↓</kbd></span>
          <span>Execute <kbd>↵</kbd></span>
        </div>
      </div>
    </div>
  );
};
