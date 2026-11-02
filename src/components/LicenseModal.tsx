import React, { useState, useEffect, useRef } from 'react';
import { Sparkles, ExternalLink, Key, CheckCircle2, AlertCircle, RefreshCw, LogOut, Lock } from 'lucide-react';
import {
  LicenseStatus,
  ProFeature,
  PRO_FEATURES,
  PRO_PRICE,
  FREE_LICENSE,
  activateDodoLicense,
  deactivateDodoLicense,
  openExternalLink,
  DODO_CHECKOUT_URL,
} from '../utils/license';
import { haptics } from '../utils/audioHaptics';

interface LicenseModalProps {
  isOpen: boolean;
  onClose: () => void;
  licenseStatus: LicenseStatus;
  onLicenseChanged: (status: LicenseStatus) => void;
  lockedFeature?: ProFeature | null;
}

const maskKey = (key: string | null) => {
  if (!key) return '';
  if (key.length <= 8) return '••••••••';
  return `${key.slice(0, 4)}…${key.slice(-4)}`;
};

export const LicenseModal: React.FC<LicenseModalProps> = ({
  isOpen,
  onClose,
  licenseStatus,
  onLicenseChanged,
  lockedFeature = null,
}) => {
  const [licenseInput, setLicenseInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      setLicenseInput('');
      setErrorMsg(null);
      setSuccessMsg(null);
      setTimeout(() => inputRef.current?.focus(), 80);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleActivate = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!licenseInput.trim()) {
      setErrorMsg('Enter your licence key.');
      return;
    }
    setLoading(true);
    setErrorMsg(null);
    setSuccessMsg(null);
    haptics.playClick();
    const result = await activateDodoLicense(licenseInput);
    setLoading(false);
    if (result.success) {
      haptics.playSuccess();
      setSuccessMsg(result.message);
      onLicenseChanged(result.status);
      setTimeout(onClose, 1200);
    } else {
      setErrorMsg(result.message);
    }
  };

  const handleDeactivate = async () => {
    if (!confirm('Release the licence from this Mac? You can activate it again later.')) return;
    haptics.playClick();
    setLoading(true);
    const result = await deactivateDodoLicense();
    setLoading(false);
    onLicenseChanged(FREE_LICENSE);
    setSuccessMsg(result.message);
  };

  const locked = lockedFeature ? PRO_FEATURES[lockedFeature] : null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/65 backdrop-blur-sm p-4 animate-fadeIn">
      <div className="absolute inset-0" onClick={onClose} />

      <div className="relative w-full max-w-md rounded-2xl bg-[var(--bg-window-solid)] border border-[var(--border-highlight)] shadow-2xl overflow-hidden flex flex-col z-10 text-[var(--text-primary)]">
        <div className="px-5 py-4 border-b border-[var(--border-subtle)] flex items-center justify-between bg-[var(--bg-surface)]">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-amber-400 flex items-center justify-center text-black">
              {locked ? <Lock className="w-4 h-4" /> : <Sparkles className="w-4 h-4 fill-current" />}
            </div>
            <div>
              <h3 className="font-semibold text-sm">{locked ? `${locked.title} is a Pro feature` : 'Float Pro'}</h3>
              <p className="text-[11px] text-[var(--text-muted)]">
                {licenseStatus.isPro ? 'Licensed on this Mac' : `${PRO_PRICE} once. No subscription.`}
              </p>
            </div>
          </div>
          <kbd
            onClick={onClose}
            className="px-2 py-0.5 rounded bg-[var(--kbd-bg)] border border-[var(--kbd-border)] text-[10px] font-mono text-[var(--text-muted)] cursor-pointer hover:bg-[var(--bg-surface-hover)]"
          >
            ESC
          </kbd>
        </div>

        <div className="p-5 space-y-4 text-xs">
          {licenseStatus.isPro ? (
            <div className="space-y-4">
              <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-start gap-3">
                <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
                <div>
                  <div className="font-semibold">Everything is unlocked.</div>
                  <div className="text-[11px] text-[var(--text-secondary)] mt-0.5">Thank you for supporting Float.</div>
                </div>
              </div>

              <div className="p-3 rounded-xl bg-[var(--bg-surface)] border border-[var(--border-subtle)] space-y-2 font-mono text-[11px]">
                <div className="flex justify-between text-[var(--text-muted)]">
                  <span>Key</span>
                  <span className="text-[var(--text-primary)]">{maskKey(licenseStatus.licenseKey)}</span>
                </div>
                {licenseStatus.activatedAt && (
                  <div className="flex justify-between text-[var(--text-muted)]">
                    <span>Activated</span>
                    <span className="text-[var(--text-primary)]">{new Date(licenseStatus.activatedAt).toLocaleDateString()}</span>
                  </div>
                )}
              </div>

              {successMsg && <p className="text-emerald-400 text-[11px]">{successMsg}</p>}

              <div className="pt-1 flex items-center justify-between">
                <button
                  type="button"
                  onClick={handleDeactivate}
                  disabled={loading}
                  className="px-3 py-1.5 rounded-lg border border-[var(--border-subtle)] text-[var(--text-secondary)] hover:text-rose-400 hover:border-rose-500/30 transition-colors flex items-center gap-1.5"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span>Release from this Mac</span>
                </button>
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-1.5 rounded-lg bg-[var(--accent-color)] text-white font-medium hover:opacity-90"
                >
                  Done
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              {locked && <p className="text-[var(--text-secondary)] leading-relaxed">{locked.detail}</p>}

              <ul className="grid grid-cols-2 gap-x-4 gap-y-1.5 text-[11px] text-[var(--text-secondary)]">
                {(Object.keys(PRO_FEATURES) as ProFeature[]).map(id => (
                  <li
                    key={id}
                    className={`flex items-center gap-1.5 ${id === lockedFeature ? 'text-[var(--text-primary)] font-semibold' : ''}`}
                  >
                    <CheckCircle2 className="w-3 h-3 text-amber-400 shrink-0" />
                    <span>{PRO_FEATURES[id].title}</span>
                  </li>
                ))}
              </ul>

              <button
                type="button"
                onClick={() => {
                  haptics.playClick();
                  openExternalLink(DODO_CHECKOUT_URL);
                }}
                className="w-full py-2.5 px-4 rounded-xl bg-amber-400 hover:bg-amber-300 text-black font-semibold flex items-center justify-center gap-2 transition-colors active:scale-[0.99]"
              >
                <span>Get Float Pro for {PRO_PRICE}</span>
                <ExternalLink className="w-4 h-4" />
              </button>

              <div className="flex items-center gap-2">
                <div className="h-px flex-1 bg-[var(--border-subtle)]" />
                <span className="text-[10px] uppercase font-mono text-[var(--text-muted)] tracking-wider">Already bought it?</span>
                <div className="h-px flex-1 bg-[var(--border-subtle)]" />
              </div>

              <form onSubmit={handleActivate} className="space-y-3">
                <div className="relative">
                  <Key className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[var(--text-muted)]" />
                  <input
                    ref={inputRef}
                    type="text"
                    value={licenseInput}
                    onChange={e => setLicenseInput(e.target.value)}
                    placeholder="Paste the key from your Dodo Payments email"
                    className="w-full pl-9 pr-3 py-2 rounded-xl bg-[var(--bg-surface)] border border-[var(--border-subtle)] focus:border-[var(--accent-color)] text-[var(--text-primary)] font-mono text-xs outline-none transition-colors"
                  />
                </div>

                {errorMsg && (
                  <div className="p-2.5 rounded-lg bg-rose-500/10 border border-rose-500/30 text-rose-400 text-[11px] flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 shrink-0" />
                    <span>{errorMsg}</span>
                  </div>
                )}
                {successMsg && (
                  <div className="p-2.5 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-[11px] flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 shrink-0" />
                    <span>{successMsg}</span>
                  </div>
                )}

                <div className="flex items-center justify-end gap-2">
                  <button
                    type="button"
                    onClick={onClose}
                    className="px-3 py-1.5 rounded-lg text-[var(--text-secondary)] hover:bg-[var(--bg-surface-hover)] transition-colors"
                  >
                    Not now
                  </button>
                  <button
                    type="submit"
                    disabled={loading || !licenseInput.trim()}
                    className="px-4 py-1.5 rounded-lg bg-[var(--accent-color)] text-white font-medium hover:opacity-90 disabled:opacity-50 transition-all flex items-center gap-1.5"
                  >
                    {loading && <RefreshCw className="w-3 h-3 animate-spin" />}
                    <span>Activate</span>
                  </button>
                </div>
              </form>
            </div>
          )}
        </div>

        <div className="px-5 py-2.5 border-t border-[var(--border-subtle)] bg-[var(--bg-surface)] text-[10px] font-mono text-[var(--text-muted)] flex items-center justify-between">
          <span>Dodo Payments Inc. is the merchant of record</span>
          <span>14-day refund</span>
        </div>
      </div>
    </div>
  );
};
