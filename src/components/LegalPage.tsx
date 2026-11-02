import React from 'react';
import { ArrowLeft } from 'lucide-react';

const LAST_UPDATED = '2026-11-02';
const CONTACT_URL = 'https://github.com/Rohithgilla12/float/issues';

interface LegalPageProps {
  onBackToHome: () => void;
}

const Section: React.FC<{ id: string; title: string; children: React.ReactNode }> = ({ id, title, children }) => (
  <section id={id} className="scroll-mt-24">
    <h2 className="text-2xl font-bold tracking-tight text-white">{title}</h2>
    <div className="mt-4 space-y-4 text-[15px] text-white/65 leading-relaxed">{children}</div>
  </section>
);

export const LegalPage: React.FC<LegalPageProps> = ({ onBackToHome }) => (
  <div className="min-h-screen bg-[#0C0D0E] text-[#ECEFF4] font-sans antialiased">
    <header className="sticky top-0 z-40 backdrop-blur-md bg-[#0C0D0E]/80 border-b border-white/5">
      <div className="max-w-3xl mx-auto px-6 h-16 flex items-center justify-between">
        <a
          href="/"
          onClick={e => {
            if (!e.metaKey && !e.ctrlKey && e.button === 0) {
              e.preventDefault();
              onBackToHome();
            }
          }}
          className="flex items-center gap-2.5"
        >
          <img src="/favicon.png" alt="" className="w-7 h-7 rounded-lg border border-white/10" />
          <span className="font-bold text-white">Float</span>
        </a>
        <a
          href="/"
          onClick={e => {
            if (!e.metaKey && !e.ctrlKey && e.button === 0) {
              e.preventDefault();
              onBackToHome();
            }
          }}
          className="text-[13px] text-white/60 hover:text-white inline-flex items-center gap-1.5"
        >
          <ArrowLeft className="w-3.5 h-3.5" /> Home
        </a>
      </div>
    </header>

    <main className="max-w-3xl mx-auto px-6 py-16 space-y-16">
      <div>
        <h1 className="text-4xl font-extrabold tracking-tight text-white">Privacy, terms, and refunds</h1>
        <p className="mt-3 text-[14px] text-white/40">Last updated {LAST_UPDATED}. Plain language on purpose.</p>
        <nav className="mt-6 flex gap-5 text-[14px] text-amber-400">
          <a href="#privacy">Privacy</a>
          <a href="#terms">Terms</a>
          <a href="#refunds">Refunds</a>
        </nav>
      </div>

      <Section id="privacy" title="Privacy">
        <p>Float has no accounts and no servers of its own. Your notes are written as Markdown files to a folder on your Mac that you choose. The app never uploads them anywhere.</p>
        <p>The app makes one kind of network request: validating a licence key against Dodo Payments when you activate it. That request contains the key and a device name, nothing from your notes.</p>
        <p>This website is static. It sets no tracking cookies. If you buy, Dodo Payments collects the details needed to take payment and issue a receipt under their own privacy policy, and shares your email and order with me so I can send the licence key and support you.</p>
      </Section>

      <Section id="terms" title="Terms">
        <p>Float is free to download and use. Buying Float Pro gives you a personal, non-transferable licence key that unlocks the Pro features on the Macs you own. Please buy a key per person for a team.</p>
        <p>The source code is available under the MIT licence on GitHub. Buying Pro supports the project and gets you the Pro features without building anything yourself.</p>
        <p>Float is provided as is. I work hard on it, but I cannot promise it is free of bugs, and I am not liable for lost notes. Your notes are plain files, so please back up the folder like any other documents.</p>
        <p>Dodo Payments Inc. is the merchant of record for all purchases and handles payment processing and tax.</p>
      </Section>

      <Section id="refunds" title="Refunds">
        <p>If Float Pro is not for you, ask within 14 days of purchase and you get a full refund, no questions asked.</p>
        <p>To request one, reply to your Dodo Payments receipt email or <a href={CONTACT_URL} className="text-amber-400 hover:text-amber-300">open an issue on GitHub</a> with your order number. Refunds are returned to the original payment method.</p>
      </Section>
    </main>
  </div>
);
