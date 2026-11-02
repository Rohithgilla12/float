import React from 'react';
import { ArrowDownToLine, X } from 'lucide-react';

interface UpdateBannerProps {
  version: string;
  progress: number | null;
  onInstall: () => void;
  onDismiss: () => void;
}

export const UpdateBanner: React.FC<UpdateBannerProps> = ({ version, progress, onInstall, onDismiss }) => {
  const installing = progress !== null;
  return (
    <div className="relative shrink-0 px-3.5 py-2 border-b border-[var(--border-subtle)] bg-[var(--accent-glow)] text-[12px] text-[var(--text-primary)] flex items-center gap-3 overflow-hidden">
      {installing && (
        <div
          className="absolute inset-y-0 left-0 bg-[var(--accent-color)]/15 transition-[width] duration-200"
          style={{ width: `${Math.round(progress * 100)}%` }}
        />
      )}
      <ArrowDownToLine className="relative w-3.5 h-3.5 text-[var(--accent-color)] shrink-0" />
      <span className="relative flex-1 truncate">
        {installing
          ? progress >= 1
            ? 'Installed. Relaunching…'
            : `Downloading Float ${version}… ${Math.round(progress * 100)}%`
          : `Float ${version} is ready.`}
      </span>
      {!installing && (
        <>
          <button
            onClick={onInstall}
            className="relative btn-press px-2.5 py-1 rounded-md bg-[var(--accent-color)] text-white font-semibold text-[11px]"
          >
            Install and relaunch
          </button>
          <button
            onClick={onDismiss}
            title="Later"
            className="relative p-1 rounded-md text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-surface-hover)]"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </>
      )}
    </div>
  );
};
