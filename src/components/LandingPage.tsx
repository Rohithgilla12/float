import React, { useEffect, useState } from 'react';
import {
  Download,
  Github,
  Pin,
  Play,
  ArrowRight,
  Check,
  Menu,
  X,
  FileText,
  Keyboard,
  Star,
  ChevronDown,
} from 'lucide-react';
import App from '../App';
import { BLOG_POSTS } from '../data/blogPosts';
import { DODO_CHECKOUT_URL, PRO_FEATURES, PRO_PRICE, FREE_NOTE_LIMIT, openExternalLink } from '../utils/license';

const INTRO_VIDEO_URL = 'https://float.gilla.fun/float-intro.mp4';
const GITHUB_URL = 'https://github.com/Rohithgilla12/float';
const LATEST_RELEASE_URL = `${GITHUB_URL}/releases/latest`;
const PRICE = PRO_PRICE;

const NAV_LINKS = [
  { href: '#features', label: 'Features' },
  { href: '#shortcuts', label: 'Shortcuts' },
  { href: '#pricing', label: 'Pro' },
  { href: '#faq', label: 'FAQ' },
];

const SHORTCUTS: Array<[string, string, string]> = [
  ['Summon or dismiss', '⌥ Space', 'Works from any app, system-wide'],
  ['Pin on top', '⌥ P', 'Stay above full-screen windows'],
  ['Slash commands', '/', 'Todo, headings, code, quote, callout'],
  ['Command palette', '⌘ K', 'Copy, export, theme, settings'],
  ['New note', '⌘ N', 'Fresh tab, cursor ready'],
  ['Switch note', '⌘ 1 – 9', 'Jump straight to a tab'],
  ['Image card', '⌘⇧ E', 'Share a note as a 2x PNG'],
  ['Ghost mode', '⌥ [  ⌥ ]', 'Lower or raise window opacity'],
  ['Text size', '⌘ +  ⌘ −', 'Make note text bigger or smaller'],
  ['Zen mode', '⌘⇧ F', 'Hide every bit of chrome'],
  ['Inline maths', '=', 'Type 15% of 850 = and get the answer'],
  ['Close', 'Esc', 'Closes a menu first, then the window'],
];

const EXTRAS: Array<[string, boolean]> = [
  ['Inline maths: 45 * 12 = answers itself', false],
  ['⌘ K palette for everything else', false],
  [`Up to ${FREE_NOTE_LIMIT} note tabs, unlimited with Pro`, false],
  ['Two themes free, all six with Pro', false],
  ['Ghost mode: see through the window', true],
  ['Shareable image cards in one keystroke', true],
  ['Zen mode hides every control', true],
  ['Custom notes folder, such as an Obsidian vault', true],
];

const FAQ: Array<[string, string]> = [
  [
    'Which Macs does Float run on?',
    'Apple Silicon Macs (M1 or later) on macOS 11 Big Sur or newer. There is no Intel build yet. If you need one, open an issue on GitHub and I will prioritise it by demand.',
  ],
  [
    'Is the app signed?',
    'Yes. Releases are signed with my Apple Developer ID (Rohith Gilla) and submitted to Apple for notarisation as part of the release pipeline, so macOS opens them without a warning.',
  ],
  [
    'Where are my notes stored?',
    'As plain .md files in ~/Documents/Float, or any folder you choose in Settings. No account, no sync server, nothing leaves your Mac. Open the same files in Obsidian, VS Code, or iA Writer.',
  ],
  [
    'What is free and what is Pro?',
    `Free gives you the whole writing experience: summon, pin, live Markdown, slash commands, inline maths, ⌘K, plain-file storage, and ${FREE_NOTE_LIMIT} note tabs. Pro adds unlimited tabs, all six themes, image cards, ghost mode, zen mode, and a custom notes folder. One payment, every Mac you own.`,
  ],
  [
    'Can I build it myself?',
    'Yes. The whole app is MIT-licensed on GitHub. Clone it and build with Rust, Node, and Xcode. The licence check is in the source too, so do with it what you like; buying Pro is how you support the project.',
  ],
  [
    'Is Pro a subscription?',
    'No. One payment, one licence, yours for good, including updates. Dodo Payments handles checkout and tax as merchant of record.',
  ],
  [
    'What if Pro is not for me?',
    'Ask within 14 days of purchase and you get a full refund, no questions asked. See the refund policy in the footer.',
  ],
];

interface LandingPageProps {
  onOpenAppFullscreen: () => void;
  onOpenBlog?: () => void;
  onSelectBlogPost?: (slug: string) => void;
}

const routeClick = (handler?: () => void) => (e: React.MouseEvent) => {
  if (handler && !e.metaKey && !e.ctrlKey && e.button === 0) {
    e.preventDefault();
    handler();
  }
};

const Kbd: React.FC<{ children: React.ReactNode; className?: string }> = ({ children, className = '' }) => (
  <kbd className={`inline-flex items-center px-1.5 py-0.5 rounded-md bg-white/10 border border-white/15 font-mono text-[12px] leading-none text-white ${className}`}>
    {children}
  </kbd>
);

const SectionLabel: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <p className="text-[11px] font-mono uppercase tracking-[0.18em] text-amber-400/90">{children}</p>
);

function useGitHubStars(repo: string) {
  const [stars, setStars] = useState<number | null>(null);
  useEffect(() => {
    let cancelled = false;
    fetch(`https://api.github.com/repos/${repo}`)
      .then(r => (r.ok ? r.json() : null))
      .then(data => {
        if (!cancelled && data && typeof data.stargazers_count === 'number' && data.stargazers_count >= 10) {
          setStars(data.stargazers_count);
        }
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, [repo]);
  return stars;
}

function useLatestDmg() {
  const [url, setUrl] = useState(LATEST_RELEASE_URL);
  useEffect(() => {
    let cancelled = false;
    fetch('https://api.github.com/repos/Rohithgilla12/float/releases/latest')
      .then(r => (r.ok ? r.json() : null))
      .then(data => {
        const asset = data?.assets?.find((a: { name: string }) => /\.dmg$/i.test(a.name));
        if (!cancelled && asset?.browser_download_url) setUrl(asset.browser_download_url);
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, []);
  return url;
}

const DesktopBackdrop: React.FC = () => (
  <div aria-hidden className="absolute inset-0 overflow-hidden rounded-3xl bg-[#101216] border border-white/10">
    <div className="h-7 flex items-center gap-4 px-4 text-[11px] text-white/45 bg-black/40 border-b border-white/5 font-medium">
      <span className="text-white/80"></span>
      <span className="text-white/80">Xcode</span>
      <span>File</span>
      <span>Edit</span>
      <span>View</span>
      <span>Navigate</span>
      <span className="ml-auto font-mono">⌥ Space</span>
    </div>
    <div className="absolute left-6 top-12 right-6 bottom-0 rounded-t-xl bg-[#15171c] border border-white/[0.07] border-b-0 overflow-hidden">
      <div className="h-8 flex items-center gap-2 px-3 border-b border-white/5">
        <span className="w-2.5 h-2.5 rounded-full bg-white/10" />
        <span className="w-2.5 h-2.5 rounded-full bg-white/10" />
        <span className="w-2.5 h-2.5 rounded-full bg-white/10" />
        <span className="ml-3 text-[11px] text-white/35 font-mono">ContentView.swift</span>
      </div>
      <div className="p-4 space-y-2.5 font-mono text-[11px] text-white/25 leading-none">
        {[52, 70, 38, 62, 44, 80, 30, 66, 48, 58, 36, 72, 42, 64, 50].map((w, i) => (
          <div key={i} className="flex items-center gap-3">
            <span className="w-4 text-right text-white/15">{i + 12}</span>
            <span className="h-2 rounded-sm bg-white/[0.07]" style={{ width: `${w}%`, marginLeft: i % 4 === 0 ? 0 : 16 }} />
          </div>
        ))}
      </div>
    </div>
  </div>
);

const NotePreview: React.FC = () => (
  <div className="rounded-2xl border border-white/10 bg-[#0d0f12] shadow-2xl overflow-hidden text-left">
    <div className="h-9 flex items-center gap-1.5 px-3 border-b border-white/5">
      <span className="w-2.5 h-2.5 rounded-full bg-[#ff5f57]" />
      <span className="w-2.5 h-2.5 rounded-full bg-[#febc2e]" />
      <span className="w-2.5 h-2.5 rounded-full bg-[#28c840]" />
      <span className="ml-3 text-[11px] text-white/40 font-mono">Standup</span>
    </div>
    <div className="p-5 space-y-3 text-[13px] text-white/80">
      <p className="text-lg font-bold text-white"># Tuesday standup</p>
      <p className="flex items-center gap-2 text-white/40 line-through">
        <span className="w-4 h-4 rounded bg-amber-500 text-black grid place-items-center"><Check className="w-3 h-3" /></span>
        Review the auth PR
      </p>
      <p className="flex items-center gap-2">
        <span className="w-4 h-4 rounded border border-white/25" />
        Ship the release notes
      </p>
      <p className="text-white/70">
        Budget left: <span className="font-mono text-white/50">1200 - 15% of 1200 =</span>{' '}
        <span className="font-mono text-amber-300">1020</span>
      </p>
      <div className="relative pt-1">
        <p className="text-white/50 font-mono">/</p>
        <div className="absolute left-0 top-7 w-48 rounded-xl border border-white/10 bg-[#15181e] shadow-xl p-1.5 text-[12px]">
          <div className="px-2.5 py-1.5 rounded-lg bg-amber-500/15 text-amber-200 flex justify-between"><span>Todo</span><span className="text-white/30 font-mono">/todo</span></div>
          <div className="px-2.5 py-1.5 text-white/60 flex justify-between"><span>Heading</span><span className="text-white/30 font-mono">/h1</span></div>
          <div className="px-2.5 py-1.5 text-white/60 flex justify-between"><span>Code</span><span className="text-white/30 font-mono">/code</span></div>
        </div>
      </div>
      <div className="h-24" />
    </div>
  </div>
);

const FilesPreview: React.FC = () => (
  <div className="rounded-2xl border border-white/10 bg-[#101216] shadow-2xl overflow-hidden text-left">
    <div className="h-9 flex items-center px-3 border-b border-white/5 gap-2 text-[11px] text-white/45">
      <span className="font-medium text-white/70">Finder</span>
      <span>›</span>
      <span>Documents</span>
      <span>›</span>
      <span className="text-white/80">Float</span>
    </div>
    <ul className="p-2 text-[13px] divide-y divide-white/5">
      {[
        ['standup.md', 'Today, 09:12', '1 KB'],
        ['release-checklist.md', 'Today, 08:40', '2 KB'],
        ['ideas.md', 'Yesterday', '6 KB'],
        ['architecture-notes.md', 'Mon', '14 KB'],
      ].map(([name, when, size]) => (
        <li key={name} className="flex items-center gap-3 px-2 py-2 text-white/70">
          <FileText className="w-4 h-4 text-amber-400/80 shrink-0" />
          <span className="font-mono text-white/85">{name}</span>
          <span className="ml-auto text-white/35 text-[11px]">{when}</span>
          <span className="w-12 text-right text-white/35 text-[11px]">{size}</span>
        </li>
      ))}
    </ul>
    <div className="px-4 py-2.5 border-t border-white/5 text-[11px] text-white/40">
      Opens in Obsidian, VS Code, iA Writer, or anything that reads Markdown.
    </div>
  </div>
);

const StackPreview: React.FC = () => (
  <div className="relative h-72 text-left">
    <div className="absolute inset-x-0 top-0 h-56 rounded-2xl bg-[#13161b] border border-white/[0.08] p-4">
      <div className="flex gap-1.5 mb-4">
        <span className="w-2.5 h-2.5 rounded-full bg-white/10" />
        <span className="w-2.5 h-2.5 rounded-full bg-white/10" />
        <span className="w-2.5 h-2.5 rounded-full bg-white/10" />
        <span className="ml-3 text-[11px] text-white/30">Figma — Onboarding v3</span>
      </div>
      <div className="grid grid-cols-3 gap-3">
        <div className="h-20 rounded-lg bg-white/[0.04]" />
        <div className="h-20 rounded-lg bg-white/[0.04]" />
        <div className="h-20 rounded-lg bg-white/[0.04]" />
      </div>
    </div>
    <div className="absolute right-4 top-16 w-64 rounded-2xl bg-[#0d0f12] border border-white/15 shadow-[0_30px_60px_-15px_rgba(0,0,0,0.9)] p-4">
      <div className="flex items-center justify-between mb-3">
        <span className="text-[11px] text-white/40 font-mono">Design review</span>
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-amber-500/15 border border-amber-500/30 text-amber-300 text-[10px] font-bold">
          <Pin className="w-3 h-3" /> PINNED
        </span>
      </div>
      <div className="space-y-2 text-[12px] text-white/75">
        <p className="flex items-center gap-2"><span className="w-3.5 h-3.5 rounded border border-white/25" />Button radius 12 → 10</p>
        <p className="flex items-center gap-2"><span className="w-3.5 h-3.5 rounded border border-white/25" />Ask about empty state</p>
        <p className="flex items-center gap-2 text-white/35 line-through"><span className="w-3.5 h-3.5 rounded bg-amber-500" />Check contrast on CTA</p>
      </div>
    </div>
  </div>
);

export const LandingPage: React.FC<LandingPageProps> = ({
  onOpenAppFullscreen,
  onOpenBlog,
  onSelectBlogPost,
}) => {
  const [menuOpen, setMenuOpen] = useState(false);
  const stars = useGitHubStars('Rohithgilla12/float');
  const dmgUrl = useLatestDmg();

  const handleBuy = () => openExternalLink(DODO_CHECKOUT_URL);
  const handleGitHub = () => openExternalLink(GITHUB_URL);
  const scrollToFilm = () => document.getElementById('film')?.scrollIntoView({ behavior: 'smooth' });

  const downloadButton = (placement: string, extra = '') => (
    <a
      href={dmgUrl}
      data-umami-event="download"
      data-umami-event-placement={placement}
      className={`inline-flex items-center justify-center gap-2 rounded-2xl bg-amber-400 hover:bg-amber-300 text-black font-semibold shadow-[0_10px_30px_-10px_rgba(245,158,11,0.6)] transition-all active:scale-[0.98] cursor-pointer no-underline ${extra}`}
    >
      <Download className="w-4 h-4" />
      <span>Download for Mac</span>
    </a>
  );

  const proButton = (placement: string, extra = '') => (
    <button
      onClick={handleBuy}
      data-umami-event="buy-pro"
      data-umami-event-placement={placement}
      className={`inline-flex items-center justify-center gap-2 rounded-2xl bg-amber-400 hover:bg-amber-300 text-black font-semibold transition-all active:scale-[0.98] cursor-pointer ${extra}`}
    >
      <span>Unlock Pro · {PRICE}</span>
    </button>
  );

  return (
    <div className="min-h-screen bg-[#0C0D0E] text-[#ECEFF4] font-sans antialiased selection:bg-amber-500/30 selection:text-amber-200">
      <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
        <div className="absolute -top-48 left-1/2 -translate-x-1/2 w-[1000px] h-[520px] bg-gradient-to-b from-amber-500/10 to-transparent blur-3xl" />
      </div>

      <header className="sticky top-0 z-40 backdrop-blur-md bg-[#0C0D0E]/80 border-b border-white/5">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-3">
          <a href="/" className="flex items-center gap-2.5">
            <img src="/favicon.png" alt="" className="w-8 h-8 rounded-xl border border-white/10" />
            <span className="font-bold text-base tracking-tight text-white">Float</span>
          </a>

          <nav className="hidden md:flex items-center gap-7 text-[13px] text-white/65">
            {NAV_LINKS.map(l => (
              <a key={l.href} href={l.href} className="hover:text-white transition-colors">{l.label}</a>
            ))}
            {onOpenBlog && (
              <a href="/blog" onClick={routeClick(onOpenBlog)} className="hover:text-white transition-colors">Blog</a>
            )}
            <a href={GITHUB_URL} onClick={e => { e.preventDefault(); handleGitHub(); }} className="hover:text-white transition-colors inline-flex items-center gap-1.5">
              <Github className="w-3.5 h-3.5" />
              <span>{stars !== null ? stars.toLocaleString() : 'GitHub'}</span>
            </a>
          </nav>

          <div className="flex items-center gap-2">
            <a
              href={dmgUrl}
              data-umami-event="download"
              data-umami-event-placement="nav"
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-[13px] font-semibold bg-amber-400 hover:bg-amber-300 text-black transition-colors active:scale-95 no-underline"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Download</span>
            </a>
            <button
              onClick={() => setMenuOpen(v => !v)}
              aria-label="Menu"
              className="md:hidden p-2 rounded-xl text-white/70 hover:text-white hover:bg-white/5"
            >
              {menuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
        {menuOpen && (
          <nav className="md:hidden border-t border-white/5 bg-[#0C0D0E] px-4 py-3 flex flex-col text-sm text-white/80">
            {NAV_LINKS.map(l => (
              <a key={l.href} href={l.href} onClick={() => setMenuOpen(false)} className="py-2.5">{l.label}</a>
            ))}
            {onOpenBlog && <a href="/blog" onClick={routeClick(() => { setMenuOpen(false); onOpenBlog(); })} className="py-2.5">Blog</a>}
            <a href={GITHUB_URL} className="py-2.5">GitHub</a>
          </nav>
        )}
      </header>

      <section className="relative z-10 pt-16 sm:pt-24 pb-10 px-6 max-w-6xl mx-auto">
        <div className="max-w-3xl mx-auto text-center">
          <h1 className="text-[2.6rem] leading-[1.05] sm:text-6xl font-extrabold tracking-tight text-white">
            A scratchpad that stays on top of whatever you're doing.
          </h1>
          <p className="mt-6 text-lg sm:text-xl text-white/65 leading-relaxed">
            Press <Kbd className="text-[13px] mx-0.5">⌥ Space</Kbd> from any app and start typing. Float sits above full-screen editors, browsers, and calls, and saves every note as a plain Markdown file on your Mac.
          </p>

          <div className="mt-9 flex flex-col sm:flex-row items-center justify-center gap-3">
            {downloadButton('hero', 'px-7 py-3.5 text-[15px]')}
            <button
              onClick={scrollToFilm}
              className="inline-flex items-center gap-2 px-5 py-3.5 rounded-2xl text-white/80 hover:text-white text-[15px] font-medium hover:bg-white/5 transition-colors cursor-pointer"
            >
              <Play className="w-4 h-4 fill-current" />
              <span>Watch the 15-second film</span>
            </button>
          </div>
          <p className="mt-4 text-[13px] text-white/40">
            Free to use · Pro unlock {PRICE}, once · macOS 11+ · Open source (MIT)
          </p>
        </div>

        <div id="demo" className="relative mt-16 mx-auto max-w-5xl">
          <div className="hidden md:block relative h-[600px]">
            <DesktopBackdrop />
            <div className="absolute right-10 top-16 w-[560px] h-[460px] rounded-2xl shadow-[0_40px_90px_-20px_rgba(0,0,0,0.95),0_0_0_1px_rgba(255,255,255,0.12)] overflow-hidden text-left">
              <App />
            </div>
            <div className="absolute left-10 bottom-8 max-w-xs text-left">
              <p className="text-sm text-white/80 font-medium">This one is live.</p>
              <p className="text-[13px] text-white/45 mt-1">Click a checkbox, type a line, press <Kbd>/</Kbd>. It is the real app running in your browser.</p>
              <button onClick={onOpenAppFullscreen} className="mt-3 text-[13px] text-amber-400 hover:text-amber-300 inline-flex items-center gap-1 cursor-pointer">
                Open full screen <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          <div className="md:hidden rounded-2xl overflow-hidden border border-white/10 bg-black shadow-2xl">
            <video
              src={INTRO_VIDEO_URL}
              poster="/assets/preview-poster.jpg"
              controls
              playsInline
              preload="metadata"
              className="w-full aspect-video object-cover"
            />
          </div>
        </div>
      </section>

      <section id="features" className="relative z-10 py-24 px-6 max-w-6xl mx-auto space-y-24 sm:space-y-32">
        <div className="grid md:grid-cols-2 gap-10 md:gap-16 items-center">
          <div>
            <SectionLabel>Always on top</SectionLabel>
            <h2 className="mt-3 text-3xl sm:text-4xl font-bold tracking-tight text-white leading-tight">
              Stop alt-tabbing to take a note.
            </h2>
            <p className="mt-4 text-[15px] sm:text-base text-white/60 leading-relaxed">
              Pin Float with <Kbd>⌥ P</Kbd> and it floats above full-screen Xcode, Figma, your browser, or a video call. It follows you across Spaces and monitors, and gets out of the way with <Kbd>Esc</Kbd>.
            </p>
          </div>
          <StackPreview />
        </div>

        <div className="grid md:grid-cols-2 gap-10 md:gap-16 items-center">
          <div className="md:order-2">
            <SectionLabel>Type, don't format</SectionLabel>
            <h2 className="mt-3 text-3xl sm:text-4xl font-bold tracking-tight text-white leading-tight">
              Markdown that renders as you write.
            </h2>
            <p className="mt-4 text-[15px] sm:text-base text-white/60 leading-relaxed">
              No edit and preview toggle. Headings, checklists, and code render live in the same line you are typing in. Press <Kbd>/</Kbd> for todos, headings, callouts, and code blocks; finish a sum with <Kbd>=</Kbd> and Float answers it inline.
            </p>
          </div>
          <div className="md:order-1"><NotePreview /></div>
        </div>

        <div className="grid md:grid-cols-2 gap-10 md:gap-16 items-center">
          <div>
            <SectionLabel>Plain files, no lock-in</SectionLabel>
            <h2 className="mt-3 text-3xl sm:text-4xl font-bold tracking-tight text-white leading-tight">
              Your notes are .md files in a folder you choose.
            </h2>
            <p className="mt-4 text-[15px] sm:text-base text-white/60 leading-relaxed">
              Float writes to <span className="font-mono text-white/80 text-[14px]">~/Documents/Float</span> by default, or point it at your Obsidian vault. No account, no sync server, nothing leaves your Mac. Delete the app and your notes are still there.
            </p>
          </div>
          <FilesPreview />
        </div>

        <div className="rounded-3xl border border-white/10 bg-white/[0.02] p-8 sm:p-10">
          <div className="sm:flex items-end justify-between gap-6">
            <div>
              <SectionLabel>Also in the box</SectionLabel>
              <h2 className="mt-3 text-2xl sm:text-3xl font-bold tracking-tight text-white">The small things, done properly.</h2>
            </div>
            <p className="mt-3 sm:mt-0 text-[13px] text-white/45 max-w-xs">
              Summon has no animation on purpose. For something you open 100 times a day, a fade is lag.
            </p>
          </div>
          <ul className="mt-8 grid sm:grid-cols-2 gap-x-10 gap-y-3 text-[15px] text-white/75">
            {EXTRAS.map(([item, pro]) => (
              <li key={item} className="flex items-start gap-3">
                <Check className="w-4 h-4 mt-1 text-amber-400 shrink-0" />
                <span>
                  {item}
                  {pro && <span className="ml-2 align-middle text-[10px] font-mono uppercase tracking-wider px-1.5 py-0.5 rounded bg-amber-400/15 text-amber-300">Pro</span>}
                </span>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section id="shortcuts" className="relative z-10 py-20 px-6 max-w-4xl mx-auto">
        <div className="flex items-end justify-between gap-6 mb-10">
          <div>
            <SectionLabel>Shortcuts</SectionLabel>
            <h2 className="mt-3 text-3xl sm:text-4xl font-bold tracking-tight text-white">Hands stay on the keyboard.</h2>
          </div>
          <Keyboard className="hidden sm:block w-8 h-8 text-white/20" />
        </div>
        <div className="rounded-2xl border border-white/10 overflow-hidden">
          <table className="w-full text-left text-[14px]">
            <tbody className="divide-y divide-white/5">
              {SHORTCUTS.map(([action, keys, note]) => (
                <tr key={action} className="hover:bg-white/[0.02]">
                  <td className="py-3.5 px-5 font-medium text-white whitespace-nowrap">{action}</td>
                  <td className="py-3.5 px-5"><Kbd className="text-amber-300 text-[13px]">{keys}</Kbd></td>
                  <td className="py-3.5 px-5 text-white/50 hidden sm:table-cell">{note}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section id="film" className="relative z-10 py-20 px-6 max-w-5xl mx-auto">
        <div className="text-center mb-10">
          <SectionLabel>15 seconds</SectionLabel>
          <h2 className="mt-3 text-3xl sm:text-4xl font-bold tracking-tight text-white">Summon, write, pin, done.</h2>
          <p className="mt-3 text-[15px] text-white/55 max-w-md mx-auto">
            Sound on. The clicks you hear are the ones the app makes.
          </p>
        </div>
        <div className="rounded-3xl border border-white/10 overflow-hidden shadow-2xl bg-black">
          <video
            src={INTRO_VIDEO_URL}
            controls
            playsInline
            preload="metadata"
            poster="/assets/preview-poster.jpg"
            className="w-full aspect-video object-cover"
          />
        </div>
      </section>

      <section id="pricing" className="relative z-10 py-24 px-6 max-w-4xl mx-auto">
        <div className="text-center mb-12">
          <SectionLabel>Pricing</SectionLabel>
          <h2 className="mt-3 text-3xl sm:text-4xl font-bold tracking-tight text-white">Free to use. {PRICE} to unlock Pro.</h2>
          <p className="mt-3 text-[15px] text-white/55">One payment, no subscription, every Mac you own. The code is MIT-licensed on GitHub.</p>
        </div>

        <div className="grid md:grid-cols-5 gap-6 items-stretch">
          <div className="md:col-span-2 p-8 rounded-3xl bg-white/[0.02] border border-white/10 flex flex-col">
            <div className="flex items-baseline justify-between">
              <h3 className="font-bold text-xl text-white">Float</h3>
              <span className="text-4xl font-extrabold text-white">$0</span>
            </div>
            <ul className="mt-7 space-y-3 text-[14px] text-white/70 flex-1">
              {[
                '⌥ Space summon and pin on top',
                'Live Markdown and slash commands',
                'Inline maths and ⌘ K palette',
                'Plain .md files in ~/Documents/Float',
                `${FREE_NOTE_LIMIT} note tabs, two themes`,
                'Signed, notarised, auto-updating',
              ].map(line => (
                <li key={line} className="flex items-start gap-3">
                  <Check className="w-4 h-4 mt-0.5 text-white/40 shrink-0" />
                  <span>{line}</span>
                </li>
              ))}
            </ul>
            <a
              href={dmgUrl}
              data-umami-event="download"
              data-umami-event-placement="pricing"
              className="mt-8 w-full py-3 rounded-2xl border border-white/15 hover:bg-white/5 text-white text-[14px] font-medium transition-colors inline-flex items-center justify-center gap-2 no-underline"
            >
              <Download className="w-4 h-4" />
              <span>Download for Mac</span>
            </a>
          </div>

          <div className="md:col-span-3 p-8 rounded-3xl bg-gradient-to-b from-amber-500/[0.09] to-transparent border border-amber-500/30 flex flex-col">
            <div className="flex items-baseline justify-between">
              <h3 className="font-bold text-xl text-white">Float Pro</h3>
              <div className="flex items-baseline gap-1.5">
                <span className="text-4xl font-extrabold text-white">{PRICE}</span>
                <span className="text-[13px] text-white/45">once</span>
              </div>
            </div>
            <ul className="mt-7 grid sm:grid-cols-2 gap-x-6 gap-y-3 text-[14px] text-white/80 flex-1">
              {Object.values(PRO_FEATURES).map(f => (
                <li key={f.title} className="flex items-start gap-3">
                  <Check className="w-4 h-4 mt-0.5 text-amber-400 shrink-0" />
                  <span>{f.title}</span>
                </li>
              ))}
              <li className="flex items-start gap-3">
                <Check className="w-4 h-4 mt-0.5 text-amber-400 shrink-0" />
                <span>14-day refund, no questions</span>
              </li>
            </ul>
            <div className="mt-8">{proButton('pricing', 'w-full py-3.5 text-[15px]')}</div>
            <p className="mt-3 text-center text-[12px] text-white/35">Key arrives by email. Paste it in the app under Settings. Checkout and tax by Dodo Payments.</p>
          </div>
        </div>
      </section>

      <section id="faq" className="relative z-10 py-20 px-6 max-w-3xl mx-auto">
        <SectionLabel>Questions</SectionLabel>
        <h2 className="mt-3 mb-8 text-3xl sm:text-4xl font-bold tracking-tight text-white">Before you buy.</h2>
        <div className="divide-y divide-white/10 border-y border-white/10">
          {FAQ.map(([q, a]) => (
            <details key={q} className="group py-5">
              <summary className="flex items-center justify-between gap-4 cursor-pointer list-none text-[16px] font-medium text-white">
                <span>{q}</span>
                <ChevronDown className="w-4 h-4 text-white/40 transition-transform group-open:rotate-180 shrink-0" />
              </summary>
              <p className="mt-3 text-[15px] text-white/60 leading-relaxed">{a}</p>
            </details>
          ))}
        </div>
      </section>

      <section className="relative z-10 py-16 px-6 max-w-3xl mx-auto">
        <div className="rounded-3xl border border-white/10 bg-white/[0.02] p-8 sm:flex items-center gap-6">
          <img src="/icon.png" alt="" className="w-16 h-16 rounded-2xl border border-white/10 shrink-0 mb-4 sm:mb-0" />
          <div className="flex-1">
            <p className="text-[15px] text-white/80 leading-relaxed">
              Float is built and maintained by <a href="https://gilla.fun" className="text-white underline underline-offset-4 decoration-white/30 hover:decoration-white">Rohith Gilla</a>, a software engineer who got tired of losing meeting notes to the wrong window. Every line of it is in the open.
            </p>
            <div className="mt-4 flex flex-wrap items-center gap-3 text-[13px]">
              <a href={GITHUB_URL} onClick={e => { e.preventDefault(); handleGitHub(); }} className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-white/10 hover:bg-white/5 text-white/80 cursor-pointer">
                <Star className="w-3.5 h-3.5 text-amber-400" />
                <span>{stars !== null ? `${stars.toLocaleString()} stars on GitHub` : 'Star on GitHub'}</span>
              </a>
              <a href={`${GITHUB_URL}/issues`} className="text-white/50 hover:text-white">Report a bug</a>
            </div>
          </div>
        </div>
      </section>

      <section id="blog-preview" className="relative z-10 py-20 px-6 max-w-6xl mx-auto border-t border-white/5">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-10 gap-4">
          <div>
            <SectionLabel>From the blog</SectionLabel>
            <h2 className="mt-3 text-3xl font-bold tracking-tight text-white">Guides for Mac note-takers.</h2>
          </div>
          {onOpenBlog && (
            <a href="/blog" onClick={routeClick(onOpenBlog)} className="text-[14px] text-amber-400 hover:text-amber-300 inline-flex items-center gap-1.5 cursor-pointer">
              All articles <ArrowRight className="w-4 h-4" />
            </a>
          )}
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {BLOG_POSTS.slice(0, 3).map(post => (
            <a
              key={post.slug}
              href={`/blog/${post.slug}`}
              onClick={routeClick(() => (onSelectBlogPost ? onSelectBlogPost(post.slug) : onOpenBlog?.()))}
              className="p-6 rounded-2xl border border-white/10 hover:border-white/20 hover:bg-white/[0.03] transition-colors flex flex-col group no-underline text-inherit"
            >
              <div className="flex items-center justify-between text-[12px] text-white/40 mb-4">
                <span className="text-amber-400/90">{post.category}</span>
                <span>{post.readTime}</span>
              </div>
              <h3 className="font-semibold text-white text-[17px] leading-snug group-hover:text-amber-200 transition-colors">{post.title}</h3>
              <p className="mt-3 text-[14px] text-white/55 leading-relaxed line-clamp-3">{post.description}</p>
            </a>
          ))}
        </div>
      </section>

      <section className="relative z-10 py-24 px-6 text-center">
        <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-white">Ready when you are. <span className="text-white/40">⌥ Space.</span></h2>
        <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3">
          {downloadButton('closing', 'px-7 py-3.5 text-[15px]')}
          <button onClick={handleBuy} data-umami-event="buy-pro" data-umami-event-placement="closing" className="px-5 py-3.5 text-[15px] text-white/70 hover:text-white cursor-pointer">Or unlock Pro · {PRICE}</button>
        </div>
      </section>

      <footer className="relative z-10 py-10 px-6 border-t border-white/5 text-[13px] text-white/45">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <p>© {new Date().getFullYear()} Rohith Gilla. Payments by Dodo Payments Inc., merchant of record.</p>
          <nav className="flex flex-wrap items-center justify-center gap-x-5 gap-y-2">
            {onOpenBlog && <a href="/blog" onClick={routeClick(onOpenBlog)} className="hover:text-white cursor-pointer">Blog</a>}
            <a href={GITHUB_URL} className="hover:text-white">GitHub</a>
            <a href="/legal#privacy" className="hover:text-white">Privacy</a>
            <a href="/legal#terms" className="hover:text-white">Terms</a>
            <a href="/legal#refunds" className="hover:text-white">Refunds</a>
            <a href="https://gilla.fun" className="hover:text-white">gilla.fun</a>
          </nav>
        </div>
      </footer>
    </div>
  );
};
