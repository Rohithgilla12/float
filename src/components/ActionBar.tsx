import React from 'react';
import { Sparkles } from 'lucide-react';

interface ActionBarProps {
  content: string;
  onOpenActions: () => void;
  onToggleSlashMenu?: () => void;
}

export const ActionBar: React.FC<ActionBarProps> = ({
  content,
  onOpenActions,
  onToggleSlashMenu,
}) => {
  const words = content.trim() ? content.trim().split(/\s+/).length : 0;
  const chars = content.length;

  return (
    <div className="h-10 px-3.5 border-t border-[var(--border-subtle)] bg-[var(--bg-surface)] flex items-center justify-between text-xs select-none shrink-0 transition-colors">
      {/* Left: Metadata */}
      <div className="flex items-center gap-3 text-[var(--text-muted)]">
        <span className="flex items-center gap-1.5 font-mono text-[11px]">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
          <span>Synced</span>
        </span>
        <span className="text-[var(--border-subtle)]">&bull;</span>
        <span className="font-mono text-[11px]">{words} words</span>
        <span className="text-[var(--border-subtle)]">&bull;</span>
        <span className="font-mono text-[11px]">{chars} chars</span>
      </div>

      {/* Right: Actions Button */}
      <div className="flex items-center gap-2">
        {onToggleSlashMenu && (
          <button
            onClick={onToggleSlashMenu}
            title="Open Slash Commands Menu (/)"
            className="btn-press px-2 py-0.5 rounded bg-[var(--kbd-bg)] hover:bg-[var(--bg-surface-hover)] border border-[var(--kbd-border)] text-[var(--text-secondary)] font-mono text-[11px] flex items-center gap-1 transition-colors"
          >
            <Sparkles className="w-3 h-3 text-[var(--accent-color)]" />
            <kbd className="text-[var(--text-primary)] font-semibold">/</kbd>
          </button>
        )}

        <button
          onClick={onOpenActions}
          title="Actions Palette (⌘K)"
          className="btn-press px-2.5 py-1 rounded-lg bg-[var(--accent-glow)] text-[var(--accent-color)] border border-[var(--accent-color)]/30 font-semibold flex items-center gap-1.5 shadow-sm transition-all"
        >
          <span>Actions</span>
          <kbd className="px-1 rounded bg-black/20 font-mono text-[10px] font-bold">
            ⌘K
          </kbd>
        </button>
      </div>
    </div>
  );
};
