import React from 'react';
import { ArrowRight } from 'lucide-react';
import { Sale } from '../data/sale';
import { CopyCodeButton } from './CopyCodeButton';

export const SaleBanner: React.FC<{ sale: Sale }> = ({ sale }) => (
  <div className="relative z-10 bg-amber-400/[0.08] border-b border-amber-500/20 text-[13px] text-white/75">
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-2 flex flex-wrap items-center justify-center gap-x-3 gap-y-1.5 text-center">
      <span>
        <span className="font-semibold text-amber-300">Black Friday:</span> Float Pro {sale.percentOff}% off with code
      </span>
      <CopyCodeButton code={sale.code} placement="banner" />
      <a
        href="#pricing"
        data-umami-event="sale-see-pricing"
        className="inline-flex items-center gap-1 text-amber-300 hover:text-amber-200 transition-colors"
      >
        See pricing <ArrowRight className="w-3.5 h-3.5" />
      </a>
      <span aria-hidden className="hidden sm:inline text-white/20">·</span>
      <span className="text-white/50">
        <a
          href={sale.sisterUrl}
          data-umami-event="sale-sister"
          className="underline underline-offset-4 decoration-white/25 hover:text-white hover:decoration-white/60 transition-colors"
        >
          data-peek Pro is {sale.percentOff}% off too
        </a>{' '}
        with <span className="font-mono text-white/65">{sale.sisterCode}</span>
      </span>
    </div>
  </div>
);
