import React from 'react';
import { Pin, Plus, Moon, Sun, MoreHorizontal } from 'lucide-react';
import { Note } from '../types/note';
import { ThemeConfig } from '../types/theme';

interface WindowHeaderProps {
  notes: Note[];
  activeNoteId: string;
  onSelectNote: (id: string) => void;
  onCreateNote: () => void;
  isPinned: boolean;
  onTogglePin: () => void;
  currentTheme: ThemeConfig;
  onToggleThemeMode: () => void;
  onOpenActions: () => void;
  onCloseWindow?: () => void;
  onMinimizeWindow?: () => void;
}

export const WindowHeader: React.FC<WindowHeaderProps> = ({
  notes,
  activeNoteId,
  onSelectNote,
  onCreateNote,
  isPinned,
  onTogglePin,
  currentTheme,
  onToggleThemeMode,
  onOpenActions,
  onCloseWindow,
  onMinimizeWindow,
}) => {
  return (
    <div
      data-tauri-drag-region
      className="h-11 px-3.5 border-b border-[var(--border-subtle)] flex items-center justify-between select-none cursor-grab active:cursor-grabbing bg-[var(--bg-surface)] shrink-0 transition-colors"
    >
      {/* Left: Traffic Lights */}
      <div className="flex items-center gap-2" data-tauri-drag-region>
        <button
          onClick={onCloseWindow}
          title="Close (⌘W or Esc)"
          className="mac-dot bg-[#FF5F56] border border-[#E0443E]/50 hover:opacity-80 active:opacity-60 cursor-pointer"
        />
        <button
          onClick={onMinimizeWindow}
          title="Minimize (⌘M)"
          className="mac-dot bg-[#FFBD2E] border border-[#DEA123]/50 hover:opacity-80 active:opacity-60 cursor-pointer"
        />
        <button
          title="Float Mode"
          className="mac-dot bg-[#27C93F] border border-[#1AAB29]/50 hover:opacity-80 active:opacity-60 cursor-pointer"
        />
      </div>

      {/* Center: Note Switcher Tabs */}
      <div className="flex items-center gap-1 bg-black/10 dark:bg-white/5 p-0.5 rounded-lg border border-[var(--border-subtle)] max-w-[260px] overflow-x-auto scrollbar-none">
        {notes.slice(0, 4).map((note, idx) => {
          const isActive = note.id === activeNoteId;
          return (
            <button
              key={note.id}
              onClick={() => onSelectNote(note.id)}
              className={`px-2 py-1 text-xs rounded-md font-medium transition-all flex items-center gap-1 truncate max-w-[90px] btn-press ${
                isActive
                  ? 'bg-[var(--bg-surface-active)] text-[var(--text-primary)] shadow-sm font-semibold'
                  : 'text-[var(--text-muted)] hover:text-[var(--text-secondary)] hover:bg-[var(--bg-surface-hover)]'
              }`}
              title={`${note.title} (⌘${idx + 1})`}
            >
              <span className="truncate">{note.title.replace(/^[#\s]+/, '')}</span>
            </button>
          );
        })}

        {/* Add Note Button */}
        <button
          onClick={onCreateNote}
          title="New Note (⌘N)"
          className="w-5 h-5 flex items-center justify-center rounded text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-surface-hover)] transition-colors btn-press text-xs shrink-0"
        >
          <Plus className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Right: Actions & Pin State */}
      <div className="flex items-center gap-1.5">
        {/* Quick Light/Dark Toggle */}
        <button
          onClick={onToggleThemeMode}
          title={currentTheme.isDark ? 'Switch to Light Mode (Catppuccin Latte)' : 'Switch to Dark Mode (Raycast Obsidian)'}
          className="btn-press p-1.5 rounded-md text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-surface-hover)] transition-colors"
        >
          {currentTheme.isDark ? <Sun className="w-3.5 h-3.5" /> : <Moon className="w-3.5 h-3.5" />}
        </button>

        {/* Always on Top Pin Button */}
        <button
          onClick={onTogglePin}
          title={isPinned ? 'Note is Pinned (Always on Top) - ⌥P' : 'Pin Note to Desktop - ⌥P'}
          className={`btn-press px-2 py-1 rounded-md text-[11px] font-mono flex items-center gap-1 border transition-all ${
            isPinned
              ? 'bg-[var(--accent-glow)] text-[var(--accent-color)] border-[var(--accent-color)]/30 font-semibold shadow-sm'
              : 'border-transparent text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-surface-hover)]'
          }`}
        >
          <Pin className={`w-3 h-3 ${isPinned ? 'fill-current' : ''}`} />
          <span>{isPinned ? 'PINNED' : 'FLOAT'}</span>
        </button>

        {/* More Actions Menu */}
        <button
          onClick={onOpenActions}
          title="Actions Palette (⌘K)"
          className="btn-press p-1.5 rounded-md text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-surface-hover)] transition-colors"
        >
          <MoreHorizontal className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
};
