import React, { useState } from 'react';
import {
  Sparkles,
  Download,
  Github,
  CheckCircle2,
  Pin,
  Command,
  Palette,
  ShieldCheck,
  Maximize2,
  Play,
  Monitor,
  Volume2,
  VolumeX,
  ExternalLink,
  BookOpen,
  ArrowRight,
} from 'lucide-react';
import App from '../App';
import { BLOG_POSTS } from '../data/blogPosts';
import { DODO_CHECKOUT_URL, openExternalLink } from '../utils/license';

const R2_VIDEO_URL = 'https://pub-f69e073835364d8883ded4ff1d09e386.r2.dev/float-intro.mp4';

interface LandingPageProps {
  onOpenAppFullscreen: () => void;
  onOpenBlog?: () => void;
  onSelectBlogPost?: (slug: string) => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({
  onOpenAppFullscreen,
  onOpenBlog,
  onSelectBlogPost,
}) => {
  const [heroView, setHeroView] = useState<'sandbox' | 'video'>('sandbox');
  const [isVideoMuted, setIsVideoMuted] = useState(true);

  const handleBuy = () => {
    openExternalLink(DODO_CHECKOUT_URL);
  };

  const handleGitHub = () => {
    openExternalLink('https://github.com/Rohithgilla12/float');
  };

  return (
    <div className="min-h-screen bg-[#0C0D0E] text-[#ECEFF4] font-sans antialiased selection:bg-amber-500/30 selection:text-amber-200">
      
      {/* Background Ambient Glows */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
        <div className="absolute -top-40 left-1/2 -translate-x-1/2 w-[900px] h-[500px] bg-gradient-to-b from-amber-500/10 via-purple-500/5 to-transparent blur-3xl opacity-70" />
        <div className="absolute top-[600px] -left-40 w-[600px] h-[600px] bg-blue-500/5 blur-3xl rounded-full" />
        <div className="absolute top-[800px] -right-40 w-[600px] h-[600px] bg-emerald-500/5 blur-3xl rounded-full" />
      </div>

      {/* Navigation Header */}
      <header className="sticky top-0 z-40 backdrop-blur-md bg-[#0C0D0E]/80 border-b border-white/5">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img
              src="/favicon.png"
              alt="Float App Icon"
              className="w-8 h-8 rounded-xl shadow-lg shadow-amber-500/20 border border-white/10"
            />
            <div className="flex items-center gap-2">
              <span className="font-bold text-base tracking-tight text-white">Float</span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-white/5 border border-white/10 text-white/60">
                v0.1.0
              </span>
            </div>
          </div>

          <nav className="hidden md:flex items-center gap-6 text-xs text-white/70">
            <a href="#demo" className="hover:text-white transition-colors">
              Live Demo
            </a>
            <a href="#features" className="hover:text-white transition-colors">
              Features
            </a>
            <a href="#film" className="hover:text-white transition-colors">
              Film
            </a>
            <a href="#shortcuts" className="hover:text-white transition-colors">
              Shortcuts
            </a>
            <a href="#pricing" className="hover:text-white transition-colors">
              Pricing ($4.99)
            </a>
            {onOpenBlog && (
              <button
                onClick={onOpenBlog}
                className="hover:text-amber-400 font-medium transition-colors cursor-pointer"
              >
                Blog
              </button>
            )}
          </nav>

          <div className="flex items-center gap-3">
            <button
              onClick={handleGitHub}
              title="View on GitHub"
              className="p-2 rounded-xl text-white/70 hover:text-white hover:bg-white/5 transition-colors border border-transparent hover:border-white/10"
            >
              <Github className="w-4 h-4" />
            </button>

            <button
              onClick={onOpenAppFullscreen}
              className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium text-white/80 hover:text-white bg-white/5 hover:bg-white/10 border border-white/10 transition-colors"
            >
              <Maximize2 className="w-3.5 h-3.5" />
              <span>Full App</span>
            </button>

            <button
              onClick={handleBuy}
              className="flex items-center gap-1.5 px-4 py-1.5 rounded-xl text-xs font-semibold bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-black shadow-md shadow-amber-500/20 transition-all transform active:scale-95"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Get for Mac &bull; $4.99</span>
            </button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative z-10 pt-16 pb-12 px-6 max-w-5xl mx-auto text-center">
        {/* Pill Badge */}
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-xs text-white/80 mb-6 backdrop-blur-sm">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <span>Now available for macOS &bull; Built for speed &amp; focus</span>
        </div>

        <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight text-white max-w-3xl mx-auto leading-[1.12]">
          The floating desktop scratchpad{' '}
          <span className="bg-gradient-to-r from-amber-400 via-amber-200 to-white bg-clip-text text-transparent">
            you won't want to close.
          </span>
        </h1>

        <p className="mt-5 text-base sm:text-lg text-white/60 max-w-2xl mx-auto leading-relaxed">
          Summon instantly with <kbd className="px-2 py-0.5 rounded bg-white/10 border border-white/15 text-white/90 font-mono text-xs">⌥ Space</kbd>. Pin above full-screen editors, write in pure live WYSIWYG markdown, and trigger slash commands with instant sensory micro-haptics.
        </p>

        {/* CTA Button Group */}
        <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
          <button
            onClick={handleBuy}
            className="flex items-center gap-2.5 px-6 py-3 rounded-2xl bg-gradient-to-r from-amber-500 via-amber-400 to-amber-500 text-black font-bold text-sm shadow-xl shadow-amber-500/25 hover:shadow-amber-500/40 hover:scale-[1.02] active:scale-[0.98] transition-all"
          >
            <Download className="w-4 h-4" />
            <span>Download for macOS &bull; $4.99</span>
          </button>

          <button
            onClick={handleGitHub}
            className="flex items-center gap-2 px-5 py-3 rounded-2xl bg-white/5 hover:bg-white/10 text-white border border-white/10 text-sm font-medium hover:border-white/20 transition-all"
          >
            <Github className="w-4 h-4" />
            <span>Star on GitHub (MIT)</span>
          </button>
        </div>

        <p className="mt-3 text-xs text-white/40 font-mono">
          One-time payment &bull; Free lifetime updates &bull; Apple Notarized DMG &bull; Powered by Dodo Payments
        </p>

        {/* Interactive Live App Demo or Video Teaser */}
        <div id="demo" className="mt-14 relative mx-auto max-w-2xl">
          {/* Segmented View Switcher */}
          <div className="flex items-center justify-center gap-2 mb-4">
            <button
              onClick={() => setHeroView('sandbox')}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
                heroView === 'sandbox'
                  ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 shadow-sm'
                  : 'bg-white/5 text-white/60 hover:text-white border border-transparent hover:border-white/10'
              }`}
            >
              <Monitor className="w-3.5 h-3.5" />
              <span>Interactive Sandbox</span>
            </button>

            <button
              onClick={() => setHeroView('video')}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
                heroView === 'video'
                  ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 shadow-sm'
                  : 'bg-white/5 text-white/60 hover:text-white border border-transparent hover:border-white/10'
              }`}
            >
              <Play className="w-3.5 h-3.5 fill-current" />
              <span>Watch 15s Launch Teaser</span>
            </button>
          </div>

          {/* Glowing Shadow Frame */}
          <div className="absolute -inset-1 bg-gradient-to-r from-amber-500/30 via-purple-500/20 to-blue-500/30 rounded-3xl blur-xl opacity-70 transition duration-1000" />
          
          {/* Floating Mockup Window Wrapper */}
          <div className="relative rounded-2xl border border-white/20 shadow-2xl bg-[#141517] overflow-hidden text-left h-[460px]">
            {heroView === 'sandbox' ? (
              /* Embedded Live React Float App */
              <App />
            ) : (
              /* 15s HyperFrames Rendered Video streaming from Cloudflare R2 */
              <div className="w-full h-full flex flex-col items-center justify-center bg-black relative group">
                <video
                  src={R2_VIDEO_URL}
                  autoPlay
                  loop
                  muted={isVideoMuted}
                  playsInline
                  controls
                  className="w-full h-full object-cover rounded-2xl"
                />
                <button
                  onClick={() => setIsVideoMuted(!isVideoMuted)}
                  className="absolute bottom-4 right-4 z-20 px-3 py-1.5 rounded-xl bg-black/80 hover:bg-black text-white text-xs font-semibold backdrop-blur-md border border-white/20 flex items-center gap-1.5 shadow-xl transition-all cursor-pointer"
                >
                  {isVideoMuted ? <VolumeX className="w-3.5 h-3.5 text-amber-400" /> : <Volume2 className="w-3.5 h-3.5 text-amber-400" />}
                  <span>{isVideoMuted ? 'Unmute Sound' : 'Mute'}</span>
                </button>
              </div>
            )}
          </div>

          <div className="mt-3 flex items-center justify-between text-xs text-white/50 px-2 font-mono">
            <span>
              {heroView === 'sandbox'
                ? '👆 Live interactive sandbox — click checkboxes, type, or press /'
                : '🎬 15s Launch Film rendered with HyperFrames • Streamed globally via Cloudflare R2'}
            </span>
            {heroView === 'sandbox' ? (
              <button
                onClick={onOpenAppFullscreen}
                className="hover:text-amber-400 flex items-center gap-1 transition-colors cursor-pointer"
              >
                <span>Full Screen</span>
                <Maximize2 className="w-3 h-3" />
              </button>
            ) : (
              <a
                href={R2_VIDEO_URL}
                target="_blank"
                rel="noreferrer"
                className="hover:text-amber-400 flex items-center gap-1 transition-colors"
              >
                <span>Direct 1080p Stream</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            )}
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section id="features" className="py-20 px-6 max-w-5xl mx-auto border-t border-white/5">
        <div className="text-center mb-16">
          <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-white">
            Designed for Speed, Engineered for Craft.
          </h2>
          <p className="mt-2 text-sm text-white/60">
            Every interaction is calibrated against zero-latency desktop standards.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Card 1 */}
          <div className="p-6 rounded-2xl bg-white/[0.02] border border-white/10 hover:border-amber-500/30 transition-colors space-y-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400 flex items-center justify-center">
              <Command className="w-5 h-5" />
            </div>
            <h3 className="font-semibold text-white text-base">0ms Global Hotkey</h3>
            <p className="text-xs text-white/60 leading-relaxed">
              Summon or dismiss your floating pad anywhere on macOS with <kbd className="px-1.5 py-0.5 rounded bg-white/10 font-mono text-[11px] text-white">⌥ Space</kbd>. Zero animations on summon ensure instant keyboard readiness.
            </p>
          </div>

          {/* Card 2 */}
          <div className="p-6 rounded-2xl bg-white/[0.02] border border-white/10 hover:border-amber-500/30 transition-colors space-y-3">
            <div className="w-10 h-10 rounded-xl bg-blue-500/10 border border-blue-500/20 text-blue-400 flex items-center justify-center">
              <Pin className="w-5 h-5" />
            </div>
            <h3 className="font-semibold text-white text-base">Always on Top Pinning</h3>
            <p className="text-xs text-white/60 leading-relaxed">
              Float permanently over full-screen Xcode, VS Code, Figma, or your browser. Multi-workspace ubiquity lets Float travel with you across virtual spaces.
            </p>
          </div>

          {/* Card 3 */}
          <div className="p-6 rounded-2xl bg-white/[0.02] border border-white/10 hover:border-amber-500/30 transition-colors space-y-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center">
              <CheckCircle2 className="w-5 h-5" />
            </div>
            <h3 className="font-semibold text-white text-base">Unified Live WYSIWYG</h3>
            <p className="text-xs text-white/60 leading-relaxed">
              Never flip between edit and preview mode again. Click checkboxes directly in preview mode with fluid spring feedback and instant strikethrough.
            </p>
          </div>

          {/* Card 4 */}
          <div className="p-6 rounded-2xl bg-white/[0.02] border border-white/10 hover:border-amber-500/30 transition-colors space-y-3">
            <div className="w-10 h-10 rounded-xl bg-purple-500/10 border border-purple-500/20 text-purple-400 flex items-center justify-center">
              <Sparkles className="w-5 h-5" />
            </div>
            <h3 className="font-semibold text-white text-base">Sensory Micro-Haptics</h3>
            <p className="text-xs text-white/60 leading-relaxed">
              Synthesized Web Audio clicks give physical weight to checkbox taps. Sub-pixel cursor-following specular border shaders reflect subtle light as you move.
            </p>
          </div>

          {/* Card 5 */}
          <div className="p-6 rounded-2xl bg-white/[0.02] border border-white/10 hover:border-amber-500/30 transition-colors space-y-3">
            <div className="w-10 h-10 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 flex items-center justify-center">
              <Palette className="w-5 h-5" />
            </div>
            <h3 className="font-semibold text-white text-base">First-Class Light Mode</h3>
            <p className="text-xs text-white/60 leading-relaxed">
              Catppuccin Latte and Editorial Paper light themes are built with high-contrast slate typography and zero glare. Switch effortlessly between daylight and dusk.
            </p>
          </div>

          {/* Card 6 */}
          <div className="p-6 rounded-2xl bg-white/[0.02] border border-white/10 hover:border-amber-500/30 transition-colors space-y-3">
            <div className="w-10 h-10 rounded-xl bg-sky-500/10 border border-sky-500/20 text-sky-400 flex items-center justify-center">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <h3 className="font-semibold text-white text-base">Apple Signed & Notarized</h3>
            <p className="text-xs text-white/60 leading-relaxed">
              Certified by Apple Gatekeeper with Hardened Runtime entitlements. Seamless 1-click installation with zero security warnings or overrides.
            </p>
          </div>
        </div>
      </section>

      {/* Keyboard Shortcuts Table */}
      <section id="shortcuts" className="py-20 px-6 max-w-4xl mx-auto border-t border-white/5">
        <div className="text-center mb-12">
          <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-white">
            Keyboard-First Muscle Memory
          </h2>
          <p className="mt-2 text-sm text-white/60">
            Keep your hands on the keyboard for everything.
          </p>
        </div>

        <div className="rounded-2xl border border-white/10 overflow-hidden bg-white/[0.01]">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-white/10 bg-white/[0.02] text-white/50 font-mono">
                <th className="py-3 px-4">Action</th>
                <th className="py-3 px-4">Shortcut</th>
                <th className="py-3 px-4">Behavior</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5 font-sans">
              <tr>
                <td className="py-3 px-4 font-medium text-white">Summon / Dismiss</td>
                <td className="py-3 px-4"><kbd className="px-2 py-0.5 rounded bg-white/10 font-mono text-[11px] text-amber-300">⌥ Space</kbd></td>
                <td className="py-3 px-4 text-white/60">Global system-wide hotkey toggle</td>
              </tr>
              <tr>
                <td className="py-3 px-4 font-medium text-white">Always on Top (Pin)</td>
                <td className="py-3 px-4"><kbd className="px-2 py-0.5 rounded bg-white/10 font-mono text-[11px] text-amber-300">⌥ P</kbd></td>
                <td className="py-3 px-4 text-white/60">Float above all fullscreen apps</td>
              </tr>
              <tr>
                <td className="py-3 px-4 font-medium text-white">Slash Commands Menu</td>
                <td className="py-3 px-4"><kbd className="px-2 py-0.5 rounded bg-white/10 font-mono text-[11px] text-amber-300">/</kbd></td>
                <td className="py-3 px-4 text-white/60">Insert todo, headings, code, quotes</td>
              </tr>
              <tr>
                <td className="py-3 px-4 font-medium text-white">Actions Command Palette</td>
                <td className="py-3 px-4"><kbd className="px-2 py-0.5 rounded bg-white/10 font-mono text-[11px] text-amber-300">⌘ K</kbd></td>
                <td className="py-3 px-4 text-white/60">Copy markdown, switch theme, export</td>
              </tr>
              <tr>
                <td className="py-3 px-4 font-medium text-white">New Scratchpad</td>
                <td className="py-3 px-4"><kbd className="px-2 py-0.5 rounded bg-white/10 font-mono text-[11px] text-amber-300">⌘ N</kbd></td>
                <td className="py-3 px-4 text-white/60">Spawn a fresh blank note tab</td>
              </tr>
              <tr>
                <td className="py-3 px-4 font-medium text-white">Switch Notes</td>
                <td className="py-3 px-4"><kbd className="px-2 py-0.5 rounded bg-white/10 font-mono text-[11px] text-amber-300">⌘ 1 .. 9</kbd></td>
                <td className="py-3 px-4 text-white/60">Instantly jump to note tab by index</td>
              </tr>
              <tr>
                <td className="py-3 px-4 font-medium text-white">Close / Dismiss</td>
                <td className="py-3 px-4"><kbd className="px-2 py-0.5 rounded bg-white/10 font-mono text-[11px] text-amber-300">Esc</kbd></td>
                <td className="py-3 px-4 text-white/60">Dismiss palette first, or hide window</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      {/* 15-Second Launch Film Showcase (Streamed from Cloudflare R2) */}
      <section id="film" className="py-20 px-6 max-w-5xl mx-auto border-t border-white/5">
        <div className="text-center mb-12">
          <span className="px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-xs text-amber-400 font-mono">
            15-SECOND PRODUCT FILM
          </span>
          <h2 className="text-2xl sm:text-4xl font-extrabold tracking-tight text-white mt-3">
            Pure flow. Zero friction.
          </h2>
          <p className="mt-2 text-sm text-white/60 max-w-xl mx-auto">
            Rendered at 1080p 60 FPS with custom synthesized audio, keyframe foley, and 35mm grain. Streamed globally with instant seeking via Cloudflare R2.
          </p>
        </div>

        <div className="relative rounded-3xl border border-white/15 overflow-hidden shadow-2xl bg-black max-w-4xl mx-auto group">
          <div className="aspect-video w-full">
            <video
              src={R2_VIDEO_URL}
              controls
              playsInline
              preload="metadata"
              poster="/assets/preview-poster.jpg"
              className="w-full h-full object-cover"
            />
          </div>
          <div className="p-4 bg-white/[0.03] border-t border-white/10 flex items-center justify-between text-xs text-white/60 font-mono">
            <span>Float Launch Film &bull; 1080p H.264 &bull; 48kHz Stereo</span>
            <a
              href={R2_VIDEO_URL}
              target="_blank"
              rel="noreferrer"
              className="text-amber-400 hover:text-amber-300 flex items-center gap-1 transition-colors"
            >
              <span>Download Raw MP4</span>
              <ExternalLink className="w-3 h-3" />
            </a>
          </div>
        </div>
      </section>

      {/* Pricing Comparison Section */}
      <section id="pricing" className="py-20 px-6 max-w-4xl mx-auto border-t border-white/5">
        <div className="text-center mb-16">
          <span className="px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-xs text-amber-400 font-mono">
            SIMPLE, HONEST PRICING
          </span>
          <h2 className="text-2xl sm:text-4xl font-extrabold tracking-tight text-white mt-3">
            Open Source Code. $4.99 Official Binary.
          </h2>
          <p className="mt-2 text-sm text-white/60">
            No subscriptions. No recurring charges. Forever.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-stretch">
          {/* Free Open Source */}
          <div className="p-8 rounded-3xl bg-white/[0.02] border border-white/10 flex flex-col justify-between space-y-6">
            <div>
              <div className="flex justify-between items-center">
                <h3 className="font-bold text-lg text-white">Build From Source</h3>
                <span className="px-2 py-0.5 rounded-full bg-white/10 text-white/70 font-mono text-xs">MIT License</span>
              </div>
              <div className="mt-4 flex items-baseline gap-1">
                <span className="text-4xl font-extrabold text-white">$0</span>
                <span className="text-xs text-white/50">/ forever</span>
              </div>
              <p className="mt-2 text-xs text-white/60 leading-relaxed">
                For developers who prefer compiling with Cargo and Node.
              </p>

              <ul className="mt-6 space-y-3 text-xs text-white/70">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-white/40 shrink-0" />
                  <span>Full source code on GitHub</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-white/40 shrink-0" />
                  <span>All themes, shortcuts & features</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-white/40 shrink-0" />
                  <span>Manual builds via <code className="text-white/90">cargo build</code></span>
                </li>
              </ul>
            </div>

            <button
              onClick={handleGitHub}
              className="w-full py-2.5 rounded-xl border border-white/15 hover:bg-white/5 text-white font-medium text-xs transition-colors flex items-center justify-center gap-2"
            >
              <Github className="w-4 h-4" />
              <span>Clone on GitHub</span>
            </button>
          </div>

          {/* Paid Pro Binary */}
          <div className="p-8 rounded-3xl bg-gradient-to-b from-amber-500/10 via-amber-500/5 to-transparent border-2 border-amber-500/40 relative flex flex-col justify-between space-y-6 shadow-2xl shadow-amber-500/10">
            <div className="absolute -top-3 right-8 px-3 py-0.5 rounded-full bg-gradient-to-r from-amber-500 to-amber-400 text-black font-bold text-[10px] uppercase tracking-wider">
              Recommended
            </div>

            <div>
              <div className="flex justify-between items-center">
                <h3 className="font-bold text-lg text-white">Float Pro Lifetime</h3>
                <span className="px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-400 font-mono text-xs">Official .dmg</span>
              </div>
              <div className="mt-4 flex items-baseline gap-1">
                <span className="text-4xl font-extrabold text-white">$4.99</span>
                <span className="text-xs text-white/50">/ one-time license</span>
              </div>
              <p className="mt-2 text-xs text-white/60 leading-relaxed">
                Pre-built, signed, and notarized universal binary for macOS.
              </p>

              <ul className="mt-6 space-y-3 text-xs text-white/80">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-amber-400 shrink-0" />
                  <span className="font-semibold text-white">Apple Developer Signed & Notarized</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-amber-400 shrink-0" />
                  <span>Gatekeeper approved &bull; zero security warnings</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-amber-400 shrink-0" />
                  <span>Automatic background updates</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-amber-400 shrink-0" />
                  <span>Instant license key delivery via Dodo Payments</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-amber-400 shrink-0" />
                  <span>Supports independent open-source craftsmanship</span>
                </li>
              </ul>
            </div>

            <button
              onClick={handleBuy}
              className="w-full py-3 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-black font-bold text-xs shadow-lg shadow-amber-500/20 transition-all flex items-center justify-center gap-2 transform active:scale-98"
            >
              <Download className="w-4 h-4" />
              <span>Buy for macOS &bull; $4.99 via Dodo Payments</span>
            </button>
          </div>
        </div>
      </section>

      {/* From the Blog & Guides Section */}
      <section id="blog-preview" className="py-20 px-6 max-w-5xl mx-auto border-t border-white/5">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-12 gap-4">
          <div>
            <span className="px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-xs text-amber-400 font-mono">
              ESSAYS & GUIDES
            </span>
            <h2 className="text-2xl sm:text-4xl font-extrabold tracking-tight text-white mt-3">
              Deep-dives for macOS power users.
            </h2>
            <p className="mt-2 text-sm text-white/60">
              Architectural guides, comparisons, and workflows for keyboard-driven thinkers.
            </p>
          </div>

          {onOpenBlog && (
            <button
              onClick={onOpenBlog}
              className="px-4 py-2 rounded-xl border border-white/10 hover:border-white/20 bg-white/5 hover:bg-white/10 text-xs text-white/80 transition-colors flex items-center gap-1.5 self-start sm:self-auto cursor-pointer"
            >
              <BookOpen className="w-3.5 h-3.5 text-amber-400" />
              <span>View All Articles</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {BLOG_POSTS.slice(0, 3).map(post => (
            <article
              key={post.slug}
              onClick={() => onSelectBlogPost ? onSelectBlogPost(post.slug) : onOpenBlog?.()}
              className="p-6 rounded-2xl bg-white/[0.02] border border-white/10 hover:border-amber-500/30 hover:bg-white/[0.04] transition-all cursor-pointer flex flex-col justify-between group"
            >
              <div>
                <div className="flex items-center justify-between text-[11px] text-white/50 mb-3 font-mono">
                  <span className="px-2 py-0.5 rounded-full bg-white/5 border border-white/10 text-amber-400">
                    {post.category}
                  </span>
                  <span>{post.readTime}</span>
                </div>
                <h3 className="font-bold text-white text-base group-hover:text-amber-300 transition-colors leading-snug">
                  {post.title}
                </h3>
                <p className="mt-2.5 text-xs text-white/60 leading-relaxed line-clamp-3">
                  {post.description}
                </p>
              </div>

              <div className="mt-6 pt-4 border-t border-white/5 flex items-center justify-between text-xs text-amber-400 font-medium">
                <span>Read article</span>
                <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
              </div>
            </article>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-6 border-t border-white/5 text-center text-xs text-white/40 font-mono space-y-3">
        <div className="flex items-center justify-center gap-4 text-white/60">
          <a href="https://float.gilla.fun" className="hover:text-white transition-colors">
            float.gilla.fun
          </a>
          <span>&bull;</span>
          {onOpenBlog && (
            <>
              <button onClick={onOpenBlog} className="hover:text-white transition-colors cursor-pointer">
                Blog
              </button>
              <span>&bull;</span>
            </>
          )}
          <a href="https://github.com/Rohithgilla12/float" className="hover:text-white transition-colors">
            GitHub
          </a>
          <span>&bull;</span>
          <a href="https://gilla.fun" className="hover:text-white transition-colors">
            gilla.fun
          </a>
        </div>
        <p>
          Crafted by Rohith Gilla. Merchant of Record powered by Dodo Payments Inc.
        </p>
      </footer>

    </div>
  );
};
