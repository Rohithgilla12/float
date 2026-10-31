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
} from 'lucide-react';
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
}) => {
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
    ? isPro
      ? [
          {
            id: 'license-active',
            label: 'Float Pro (Active)',
            description: 'Manage your lifetime license or view activation status',
            shortcut: 'PRO',
            icon: <Sparkles className="w-4 h-4 fill-current text-amber-400" />,
            category: 'Pro & Licensing',
            action: () => {
              onClose();
              onOpenLicense();
            },
          },
        ]
      : [
          {
            id: 'upgrade-pro',
            label: 'Upgrade to Float Pro ($4.99)',
            description: 'Get Apple notarized binaries, auto-updates via Dodo Payments',
            shortcut: '$4.99',
            icon: <Sparkles className="w-4 h-4 text-amber-400" />,
            category: 'Pro & Licensing',
            action: () => {
              onClose();
              onOpenLicense();
            },
          },
          {
            id: 'enter-license',
            label: 'Enter License Key...',
            description: 'Activate your Dodo Payments purchase',
            shortcut: '🔑',
            icon: <Key className="w-4 h-4 text-amber-300" />,
            category: 'Pro & Licensing',
            action: () => {
              onClose();
              onOpenLicense();
            },
          },
        ]
    : [];

  const mainActions: ActionItem[] = [
    ...licensingActions,
    {
      id: 'copy',
      label: 'Copy Markdown',
      description: 'Copy entire note markdown to clipboard',
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
      label: isPinned ? 'Unpin from Desktop' : 'Pin on Desktop (Always on Top)',
      description: 'Keep note floating above all windows and fullscreen apps',
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
      label: 'Change Theme...',
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
            label: 'Settings & Keybinds',
            description: 'Storage folder, custom keyboard shortcuts, license & themes',
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
      label: 'Create New Note',
      description: 'Spawn a fresh blank floating scratchpad',
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
      label: 'Export to File',
      description: 'Download note as .md file to disk',
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
      label: 'Delete Note',
      description: 'Remove this note permanently',
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
    description: `${t.isDark ? '🌙 Dark' : '☀️ Light'} - ${t.tagline}`,
    shortcut: t.id === currentTheme ? 'Active' : undefined,
    icon: (
      <span
        className="w-3.5 h-3.5 rounded-full border border-white/30"
        style={{ backgroundColor: t.accent }}
      />
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
            placeholder={viewingThemes ? 'Search themes (Latte, Mocha, Obsidian...)...' : 'Type a command or search...'}
            className="bg-transparent text-sm text-[var(--text-primary)] placeholder-[var(--text-muted)] outline-none w-full font-sans"
          />
          <kbd className="px-1.5 py-0.5 rounded bg-[var(--kbd-bg)] border border-[var(--kbd-border)] text-[10px] font-mono text-[var(--text-muted)]">
            ESC
          </kbd>
        </div>

        {/* Breadcrumb if in theme picker */}
        {viewingThemes && (
          <div className="px-4 py-1.5 bg-black/5 dark:bg-white/5 border-b border-[var(--border-subtle)] text-[11px] font-mono text-[var(--text-muted)] flex items-center justify-between">
            <span>Themes &bull; Select a built-in theme</span>
            <button
              onClick={() => setViewingThemes(false)}
              className="text-[var(--accent-color)] hover:underline"
            >
              &larr; Back to Actions
            </button>
          </div>
        )}

        {/* List of Actions */}
        <div className="max-h-72 overflow-y-auto p-1.5 space-y-0.5">
          {filteredActions.length === 0 ? (
            <div className="py-6 text-center text-xs text-[var(--text-muted)] font-mono">
              No matching actions found
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
