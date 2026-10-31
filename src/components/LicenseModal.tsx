import React, { useState, useEffect, useRef } from 'react';
import { ShieldCheck, Sparkles, ExternalLink, Key, CheckCircle2, AlertCircle, RefreshCw, LogOut } from 'lucide-react';
import {
  LicenseStatus,
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
}

export const LicenseModal: React.FC<LicenseModalProps> = ({
  isOpen,
  onClose,
  licenseStatus,
  onLicenseChanged,
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

  const handleActivate = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!licenseInput.trim()) {
      setErrorMsg('Please enter a license key.');
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
      setTimeout(() => {
        onClose();
      }, 1500);
    } else {
      setErrorMsg(result.message);
    }
  };

  const handleDeactivate = async () => {
    if (!confirm('Are you sure you want to deactivate your license on this Mac?')) return;
    haptics.playClick();
    setLoading(true);
    await deactivateDodoLicense();
    setLoading(false);
    onLicenseChanged({ isPro: false, licenseKey: null, activatedAt: null });
    setSuccessMsg('License deactivated.');
  };

  const handleOpenCheckout = () => {
    haptics.playClick();
    openExternalLink(DODO_CHECKOUT_URL);
  };

  const maskKey = (key: string | null) => {
    if (!key) return '';
    if (key.length <= 8) return '••••••••';
    return key.slice(0, 4) + '-••••-••••-' + key.slice(-4);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/65 backdrop-blur-sm p-4 animate-fadeIn">
      {/* Click outside backdrop */}
      <div className="absolute inset-0" onClick={onClose} />

      <div className="relative w-full max-w-md rounded-2xl bg-[var(--bg-window-solid)] border border-[var(--border-highlight)] shadow-2xl overflow-hidden flex flex-col z-10">
        
        {/* Top Header */}
        <div className="px-5 py-4 border-b border-[var(--border-subtle)] flex items-center justify-between bg-black/5 dark:bg-white/5">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-amber-500 to-amber-300 flex items-center justify-center text-black font-bold shadow-sm">
              <Sparkles className="w-4 h-4 fill-current" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-semibold text-sm text-[var(--text-primary)]">Float Pro</h3>
                <span className="px-1.5 py-0.5 rounded text-[10px] font-mono font-bold bg-amber-500/20 text-amber-500 border border-amber-500/30">
                  {licenseStatus.isPro ? 'PRO ACTIVE' : '$4.99 LIFETIME'}
                </span>
              </div>
              <p className="text-[11px] text-[var(--text-muted)]">
                Powered by Dodo Payments Merchant of Record
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

        {/* Content Body */}
        <div className="p-5 space-y-4 text-xs">
          {licenseStatus.isPro ? (
            /* Active Pro State */
            <div className="space-y-4">
              <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-start gap-3">
                <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <div className="font-semibold text-[var(--text-primary)]">
                    Float Pro is Active!
                  </div>
                  <div className="text-[11px] text-[var(--text-secondary)]">
                    Thank you for supporting open source desktop craftsmanship.
                  </div>
                </div>
              </div>

              <div className="p-3 rounded-xl bg-black/5 dark:bg-white/5 border border-[var(--border-subtle)] space-y-2 font-mono text-[11px]">
                <div className="flex justify-between items-center text-[var(--text-muted)]">
                  <span>License Key</span>
                  <span className="text-[var(--text-primary)] font-semibold">{maskKey(licenseStatus.licenseKey)}</span>
                </div>
                {licenseStatus.activatedAt && (
                  <div className="flex justify-between items-center text-[var(--text-muted)]">
                    <span>Activated On</span>
                    <span className="text-[var(--text-primary)]">
                      {new Date(licenseStatus.activatedAt).toLocaleDateString()}
                    </span>
                  </div>
                )}
                <div className="flex justify-between items-center text-[var(--text-muted)]">
                  <span>Provider</span>
                  <span className="text-amber-400">Dodo Payments (Universal)</span>
                </div>
              </div>

              <div className="pt-2 flex items-center justify-between">
                <button
                  type="button"
                  onClick={handleDeactivate}
                  disabled={loading}
                  className="px-3 py-1.5 rounded-lg border border-rose-500/30 text-rose-400 hover:bg-rose-500/10 transition-colors flex items-center gap-1.5 text-xs"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span>Deactivate on this Mac</span>
                </button>

                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-1.5 rounded-lg bg-[var(--accent-color)] text-white font-medium hover:opacity-90 transition-opacity"
                >
                  Done
                </button>
              </div>
            </div>
          ) : (
            /* Non-Pro / Upgrade State */
            <div className="space-y-4">
              <div className="space-y-2 text-[var(--text-secondary)] leading-relaxed">
                <p>
                  Float is 100% open-source under MIT. Purchasing a Pro license gives you official pre-notarized Apple binaries, automatic background updates, and supports continuous engineering.
                </p>
                <div className="grid grid-cols-2 gap-2 pt-1 font-sans">
                  <div className="flex items-center gap-2 p-2 rounded-lg bg-black/5 dark:bg-white/5 border border-[var(--border-subtle)]">
                    <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span className="text-[11px]">Apple Notarized</span>
                  </div>
                  <div className="flex items-center gap-2 p-2 rounded-lg bg-black/5 dark:bg-white/5 border border-[var(--border-subtle)]">
                    <Sparkles className="w-4 h-4 text-amber-400 shrink-0" />
                    <span className="text-[11px]">Lifetime Updates</span>
                  </div>
                </div>
              </div>

              {/* Buy Button */}
              <button
                type="button"
                onClick={handleOpenCheckout}
                className="w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-black font-semibold shadow-md flex items-center justify-center gap-2 transition-all transform active:scale-[0.99]"
              >
                <span>Buy Lifetime License for $4.99</span>
                <ExternalLink className="w-4 h-4" />
              </button>

              <div className="flex items-center gap-2 my-2">
                <div className="h-px flex-1 bg-[var(--border-subtle)]" />
                <span className="text-[10px] uppercase font-mono text-[var(--text-muted)] tracking-wider">
                  Or enter key
                </span>
                <div className="h-px flex-1 bg-[var(--border-subtle)]" />
              </div>

              {/* Enter License Key Form */}
              <form onSubmit={handleActivate} className="space-y-3">
                <div>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-[var(--text-muted)]">
                      <Key className="w-3.5 h-3.5" />
                    </div>
                    <input
                      ref={inputRef}
                      type="text"
                      value={licenseInput}
                      onChange={e => setLicenseInput(e.target.value)}
                      placeholder="LK-XXXX-XXXX-XXXX-XXXX"
                      className="w-full pl-9 pr-3 py-2 rounded-xl bg-black/10 dark:bg-white/5 border border-[var(--border-subtle)] focus:border-[var(--accent-color)] text-[var(--text-primary)] font-mono text-xs outline-none transition-colors"
                    />
                  </div>
                  <p className="text-[10px] text-[var(--text-muted)] mt-1 ml-1 font-mono">
                    Check the confirmation email received from Dodo Payments.
                  </p>
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

                <div className="flex items-center justify-end gap-2 pt-1">
                  <button
                    type="button"
                    onClick={onClose}
                    className="px-3 py-1.5 rounded-lg text-[var(--text-secondary)] hover:bg-[var(--bg-surface-hover)] transition-colors"
                  >
                    Cancel
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

        {/* Footer */}
        <div className="px-5 py-2.5 border-t border-[var(--border-subtle)] bg-[var(--bg-surface)] text-[10px] font-mono text-[var(--text-muted)] flex items-center justify-between">
          <span>Merchant of Record: Dodo Payments Inc.</span>
          <span>Global Tax / VAT Automated</span>
        </div>

      </div>
    </div>
  );
};
