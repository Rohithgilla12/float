import React, { useEffect, useState } from 'react';
import { Check, Copy } from 'lucide-react';

interface CopyCodeButtonProps {
  code: string;
  placement: string;
  className?: string;
}

export const CopyCodeButton: React.FC<CopyCodeButtonProps> = ({ code, placement, className = '' }) => {
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!copied) return;
    const timer = setTimeout(() => setCopied(false), 1600);
    return () => clearTimeout(timer);
  }, [copied]);

  const copy = () => {
    navigator.clipboard?.writeText(code).then(() => setCopied(true), () => {});
  };

  return (
    <button
      type="button"
      onClick={copy}
      data-umami-event="copy-sale-code"
      data-umami-event-placement={placement}
      aria-label={copied ? `Copied ${code}` : `Copy code ${code}`}
      className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-black/30 border border-amber-500/30 hover:border-amber-400/60 font-mono text-[12px] font-semibold tracking-wide text-amber-200 transition-colors active:scale-[0.97] cursor-pointer ${className}`}
    >
      <span>{code}</span>
      {copied ? <Check className="w-3 h-3 text-amber-300" /> : <Copy className="w-3 h-3 text-amber-300/70" />}
    </button>
  );
};
