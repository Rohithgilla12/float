import React from 'react';
import { Sparkles, Mic, Image as ImageIcon, Eye, Lock } from 'lucide-react';

interface ActionBarProps {
  content: string;
  onOpenActions: () => void;
  onToggleSlashMenu?: () => void;
  onOpenImageExport?: () => void;
  isDictating?: boolean;
  onToggleDictation?: () => void;
  opacity?: number;
  onCycleOpacity?: () => void;
  isPro?: boolean;
}

export const ActionBar: React.FC<ActionBarProps> = ({
  content,
  onOpenActions,
  onToggleSlashMenu,
  onOpenImageExport,
  isDictating = false,
  onToggleDictation,
  opacity = 1.0,
  onCycleOpacity,
  isPro = true,
}) => {
  const proMark = isPro ? null : <Lock className="w-2.5 h-2.5 text-amber-400" />;
  const words = content.trim() ? content.trim().split(/\s+/).length : 0;
  const chars = content.length;

  return (
    <div className="h-10 px-3.5 border-t border-[var(--border-subtle)] bg-[var(--bg-surface)] flex items-center justify-between text-xs select-none shrink-0 transition-colors">
      {/* Left: Metadata & Live Status */}
      <div className="flex items-center gap-3 text-[var(--text-muted)]">
        {isDictating ? (
          <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-rose-500/15 border border-rose-500/30 text-rose-400 font-mono text-[10px] animate-pulse">
            <span className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-ping" />
            <span className="font-semibold">Listening</span>
          </div>
        ) : (
          <span className="flex items-center gap-1.5 font-mono text-[11px]">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            <span>Synced</span>
          </span>
        )}
        <span className="text-[var(--border-subtle)]">&bull;</span>
        <span className="font-mono text-[11px]">{words} words</span>
        <span className="text-[var(--border-subtle)]">&bull;</span>
        <span className="font-mono text-[11px]">{chars} chars</span>
      </div>

      {/* Right: Quick Action Buttons */}
      <div className="flex items-center gap-1.5">
        {/* Ghost Mode Opacity Toggle */}
        {onCycleOpacity && (
          <button
            onClick={onCycleOpacity}
            title={isPro ? `Ghost mode (${Math.round(opacity * 100)}%, ⌥[ / ⌥])` : 'Ghost mode (Pro)'}
            className="btn-press px-1.5 py-1 rounded-lg bg-[var(--kbd-bg)] hover:bg-[var(--bg-surface-hover)] border border-[var(--kbd-border)] text-[var(--text-secondary)] hover:text-cyan-400 font-mono text-[10px] transition-colors flex items-center gap-1"
          >
            <Eye className="w-3 h-3" />
            {isPro ? <span>{Math.round(opacity * 100)}%</span> : proMark}
          </button>
        )}

        {/* Voice Dictation (⌥D) */}
        {onToggleDictation && (
          <button
            onClick={onToggleDictation}
            title={!isPro ? 'Voice dictation (Pro)' : isDictating ? 'Stop dictation (⌥D)' : 'Dictate (⌥D)'}
            className={`btn-press p-1.5 rounded-lg border transition-colors flex items-center gap-1 ${
              isDictating
                ? 'bg-rose-500/20 border-rose-500/40 text-rose-400 shadow-sm animate-pulse'
                : 'bg-[var(--kbd-bg)] hover:bg-[var(--bg-surface-hover)] border-[var(--kbd-border)] text-[var(--text-secondary)] hover:text-rose-400'
            }`}
          >
            <Mic className="w-3.5 h-3.5" />
            {proMark}
          </button>
        )}

        {/* Ray.so / Carbon Image Card Export (⌘⇧E) */}
        {onOpenImageExport && (
          <button
            onClick={onOpenImageExport}
            title={isPro ? 'Export as image card (⌘⇧E)' : 'Image cards (Pro)'}
            className="btn-press p-1.5 rounded-lg bg-[var(--kbd-bg)] hover:bg-[var(--bg-surface-hover)] border border-[var(--kbd-border)] text-[var(--text-secondary)] hover:text-pink-400 transition-colors flex items-center gap-1"
          >
            <ImageIcon className="w-3.5 h-3.5" />
            {proMark}
          </button>
        )}

        {/* Slash Command Hint */}
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

        {/* Actions Palette (⌘K) */}
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
