import React, { useState, useRef } from 'react';
import { Note } from '../types/note';
import { ThemeConfig } from '../types/theme';
import { X, Copy, Download, Check, Image as ImageIcon } from 'lucide-react';
import { haptics } from '../utils/audioHaptics';

interface ImageExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  note: Note;
  themeConfig: ThemeConfig;
  onShowToast: (msg: string) => void;
}

type BackdropTheme = 'obsidian' | 'sunset' | 'aurora' | 'sonoma';

export const ImageExportModal: React.FC<ImageExportModalProps> = ({
  isOpen,
  onClose,
  note,
  themeConfig,
  onShowToast,
}) => {
  const [backdrop, setBackdrop] = useState<BackdropTheme>('sunset');
  const [showTrafficLights, setShowTrafficLights] = useState(true);
  const [showWatermark, setShowWatermark] = useState(true);
  const [exporting, setExporting] = useState(false);
  const [copied, setCopied] = useState(false);

  const cardRef = useRef<HTMLDivElement>(null);

  if (!isOpen) return null;

  const backdrops: Record<BackdropTheme, { name: string; bg: string }> = {
    sunset: {
      name: 'Amber Sunset',
      bg: 'linear-gradient(135deg, #FF6B4A 0%, #F59E0B 50%, #EC4899 100%)',
    },
    aurora: {
      name: 'Cyber Aurora',
      bg: 'linear-gradient(135deg, #6366F1 0%, #A855F7 50%, #EC4899 100%)',
    },
    obsidian: {
      name: 'Obsidian Noir',
      bg: 'linear-gradient(135deg, #18191E 0%, #0F1012 100%)',
    },
    sonoma: {
      name: 'Sonoma Sky',
      bg: 'linear-gradient(135deg, #38BDF8 0%, #3B82F6 50%, #1D4ED8 100%)',
    },
  };

  const renderCardToBlob = async (): Promise<Blob | null> => {
    const cardEl = cardRef.current;
    if (!cardEl) return null;

    const width = cardEl.offsetWidth;
    const height = cardEl.offsetHeight;
    const scale = 2; // 2x Retina resolution

    const canvas = document.createElement('canvas');
    canvas.width = width * scale;
    canvas.height = height * scale;
    const ctx = canvas.getContext('2d');
    if (!ctx) return null;

    ctx.scale(scale, scale);

    // Draw background gradient
    const grad = ctx.createLinearGradient(0, 0, width, height);
    if (backdrop === 'sunset') {
      grad.addColorStop(0, '#FF6B4A');
      grad.addColorStop(0.5, '#F59E0B');
      grad.addColorStop(1, '#EC4899');
    } else if (backdrop === 'aurora') {
      grad.addColorStop(0, '#6366F1');
      grad.addColorStop(0.5, '#A855F7');
      grad.addColorStop(1, '#EC4899');
    } else if (backdrop === 'sonoma') {
      grad.addColorStop(0, '#38BDF8');
      grad.addColorStop(0.5, '#3B82F6');
      grad.addColorStop(1, '#1D4ED8');
    } else {
      grad.addColorStop(0, '#1E2024');
      grad.addColorStop(1, '#0F1012');
    }

    // Outer rounded container
    ctx.fillStyle = grad;
    ctx.roundRect(0, 0, width, height, 24);
    ctx.fill();

    // Inner window padding
    const pad = 36;
    const winW = width - pad * 2;
    const winH = height - pad * 2;
    const winX = pad;
    const winY = pad;

    // Window shadow
    ctx.shadowColor = 'rgba(0, 0, 0, 0.45)';
    ctx.shadowBlur = 35;
    ctx.shadowOffsetY = 15;

    // Window body
    ctx.fillStyle = themeConfig.isDark ? '#141517' : '#FFFFFF';
    ctx.roundRect(winX, winY, winW, winH, 16);
    ctx.fill();

    // Reset shadow
    ctx.shadowColor = 'transparent';
    ctx.shadowBlur = 0;
    ctx.shadowOffsetY = 0;

    // 1px Window border
    ctx.strokeStyle = themeConfig.isDark ? 'rgba(255, 255, 255, 0.12)' : 'rgba(0, 0, 0, 0.08)';
    ctx.lineWidth = 1;
    ctx.stroke();

    // Header traffic lights
    if (showTrafficLights) {
      const dotY = winY + 22;
      [
        { color: '#FF5F56', x: winX + 22 },
        { color: '#FFBD2E', x: winX + 38 },
        { color: '#27C93F', x: winX + 54 },
      ].forEach(d => {
        ctx.beginPath();
        ctx.arc(d.x, dotY, 5, 0, Math.PI * 2);
        ctx.fillStyle = d.color;
        ctx.fill();
      });
    }

    // Window Title / Note Title
    ctx.fillStyle = themeConfig.isDark ? '#FFFFFF' : '#111827';
    ctx.font = 'bold 20px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
    ctx.fillText(note.title || 'Untitled Note', winX + 22, winY + 65);

    // Note Body Lines
    ctx.font = '14px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
    ctx.fillStyle = themeConfig.isDark ? '#9CA3AF' : '#4B5563';

    const lines = note.content
      .split('\n')
      .filter(l => l.trim().length > 0 && !l.startsWith('# '))
      .slice(0, 10);

    let curY = winY + 100;
    lines.forEach(line => {
      let text = line.replace(/^[-*]\s+\[[ xX]\]\s*/, '☑️ ');
      text = text.replace(/^[-*]\s+/, '• ');
      text = text.replace(/^#+\s+/, '');
      if (text.length > 55) text = text.slice(0, 52) + '...';
      ctx.fillText(text, winX + 22, curY);
      curY += 26;
    });

    // Watermark
    if (showWatermark) {
      ctx.font = '11px -apple-system, BlinkMacSystemFont, monospace';
      ctx.fillStyle = themeConfig.isDark ? 'rgba(255, 255, 255, 0.4)' : 'rgba(0, 0, 0, 0.4)';
      ctx.fillText('Float • The Floating Desktop Scratchpad', winX + 22, winY + winH - 18);
    }

    return new Promise(resolve => canvas.toBlob(resolve, 'image/png'));
  };

  const handleDownload = async () => {
    haptics.playClick();
    setExporting(true);
    try {
      const blob = await renderCardToBlob();
      if (!blob) throw new Error('Render failed');
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${(note.title || 'note').replace(/[^a-zA-Z0-9_-]/g, '_')}-card.png`;
      a.click();
      URL.revokeObjectURL(url);
      haptics.playSuccess();
      onShowToast('🖼️ Downloaded high-res PNG card!');
    } catch {
      onShowToast('Failed to export image');
    } finally {
      setExporting(false);
    }
  };

  const handleCopyToClipboard = async () => {
    haptics.playClick();
    setExporting(true);
    try {
      const blob = await renderCardToBlob();
      if (!blob) throw new Error('Render failed');
      if (navigator.clipboard && 'ClipboardItem' in window) {
        // eslint-disable-next-line no-undef
        await navigator.clipboard.write([new ClipboardItem({ 'image/png': blob })]);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
        haptics.playSuccess();
        onShowToast('📋 Copied visual card to clipboard!');
      } else {
        throw new Error('Clipboard API not supported');
      }
    } catch {
      onShowToast('Clipboard copy not supported on this browser');
    } finally {
      setExporting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md animate-fadeIn">
      <div className="w-full max-w-xl rounded-2xl bg-[#141517] border border-white/15 shadow-2xl flex flex-col overflow-hidden text-[#ECEFF4] font-sans">
        
        {/* Header */}
        <div className="px-5 py-4 border-b border-white/10 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ImageIcon className="w-4 h-4 text-amber-400" />
            <h2 className="font-bold text-sm text-white">Export Note as Image Card</h2>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-white/50 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Live Preview Area */}
        <div className="p-6 flex items-center justify-center bg-black/40 overflow-hidden">
          <div
            ref={cardRef}
            style={{ background: backdrops[backdrop].bg }}
            className="w-full max-w-[460px] p-8 rounded-2xl shadow-2xl transition-all select-none"
          >
            {/* Window Container */}
            <div
              className={`rounded-xl border shadow-xl p-5 ${
                themeConfig.isDark
                  ? 'bg-[#141517] border-white/15 text-white'
                  : 'bg-white border-black/10 text-black'
              }`}
            >
              {/* Traffic Lights */}
              {showTrafficLights && (
                <div className="flex items-center gap-1.5 mb-4">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#FF5F56]" />
                  <span className="w-2.5 h-2.5 rounded-full bg-[#FFBD2E]" />
                  <span className="w-2.5 h-2.5 rounded-full bg-[#27C93F]" />
                </div>
              )}

              {/* Title */}
              <h3 className="font-bold text-base tracking-tight mb-3">
                {note.title || 'Untitled Note'}
              </h3>

              {/* Content Preview */}
              <div className={`text-xs space-y-2 leading-relaxed ${themeConfig.isDark ? 'text-white/70' : 'text-black/70'}`}>
                {note.content
                  .split('\n')
                  .filter(l => l.trim().length > 0 && !l.startsWith('# '))
                  .slice(0, 6)
                  .map((l, i) => (
                    <div key={i} className="truncate">
                      {l.replace(/^[-*]\s+\[[ xX]\]\s*/, '☑️ ').replace(/^[-*]\s+/, '• ')}
                    </div>
                  ))}
              </div>

              {/* Watermark */}
              {showWatermark && (
                <div className="mt-5 pt-3 border-t border-white/10 flex items-center justify-between text-[10px] font-mono opacity-50">
                  <span>Float • ⌥Space</span>
                  <span>float.gilla.fun</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Controls */}
        <div className="p-5 border-t border-white/10 space-y-4 text-xs">
          {/* Backdrop Picker */}
          <div>
            <label className="text-white/60 font-mono block mb-2">Backdrop Gradient</label>
            <div className="grid grid-cols-4 gap-2">
              {(Object.keys(backdrops) as BackdropTheme[]).map(key => (
                <button
                  key={key}
                  onClick={() => setBackdrop(key)}
                  className={`p-2 rounded-xl border text-center transition-all cursor-pointer flex flex-col items-center gap-1.5 ${
                    backdrop === key
                      ? 'border-amber-400 bg-amber-500/10 text-white font-semibold'
                      : 'border-white/10 hover:border-white/20 bg-white/5 text-white/70'
                  }`}
                >
                  <span
                    style={{ background: backdrops[key].bg }}
                    className="w-6 h-6 rounded-full border border-white/20 shadow-sm"
                  />
                  <span className="text-[11px] truncate">{backdrops[key].name}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Toggles */}
          <div className="flex items-center justify-between text-white/70">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={showTrafficLights}
                onChange={e => setShowTrafficLights(e.target.checked)}
                className="rounded accent-amber-400"
              />
              <span>macOS Traffic Lights</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={showWatermark}
                onChange={e => setShowWatermark(e.target.checked)}
                className="rounded accent-amber-400"
              />
              <span>Float Footer Watermark</span>
            </label>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="p-5 border-t border-white/10 bg-black/20 flex items-center justify-end gap-2.5">
          <button
            onClick={onClose}
            className="px-3.5 py-2 rounded-xl text-xs text-white/70 hover:text-white hover:bg-white/5 transition-colors cursor-pointer"
          >
            Cancel
          </button>

          <button
            onClick={handleCopyToClipboard}
            disabled={exporting}
            className="px-4 py-2 rounded-xl border border-white/15 hover:bg-white/10 text-white text-xs font-medium transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copied ? 'Copied!' : 'Copy Image'}</span>
          </button>

          <button
            onClick={handleDownload}
            disabled={exporting}
            className="px-4 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-black font-bold text-xs shadow-md shadow-amber-500/20 transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Download PNG</span>
          </button>
        </div>

      </div>
    </div>
  );
};
