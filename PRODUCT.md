# Product

<!-- impeccable:product-schema 1 -->

## Platform
macOS (Tauri v2 native desktop binary + Web preview)

## Stack
Tauri v2 (Rust) + React 18 + TypeScript + Tailwind CSS + Lucide Icons + Web Audio API

## Users
Power users, software engineers, designers, researchers, and knowledge workers who want instantaneous, low-friction desktop notes floating on top of their workspaces, accessible via a muscle-memory global shortcut.

## Product Purpose
Deliver the fastest, most beautiful, keyboard-first desktop floating note companion. Eliminate the friction of context-switching to heavy note apps for fleeting thoughts, meeting snippets, scratchpads, and quick checklists.

## Positioning
Unlike full-blown workspace apps (Notion, Obsidian) or primitive sticky notes (macOS Stickies), Float is an ultra-fast, visually stunning, HUD-style floating scratchpad that lives on a hotkey, pins seamlessly over any full-screen app, supports rich slash-command markdown editing, and saves directly to local markdown files on disk.

## Operating Context
- Summoned instantly via a system-wide global shortcut (`⌥ + Space`).
- Floats over full-screen editors, browsers, Figma, IDEs, and video calls.
- Auto-saves plain `.md` files directly to disk (`~/Documents/Float`).
- Rapid capture: user types immediately without touching the mouse.
- Dismissed via `Esc` or hotkey without losing state.

## Capabilities and Constraints
- **Floating & Pinning**: Borderless glass window, toggleable "Always on Top" (pinned state), draggable top handle (`data-tauri-drag-region`), visible across all desktop workspaces.
- **Instant Slash Commands**: Triggered by typing `/` on an empty line or space; interactive fuzzy-filterable command menu (`/todo`, `/h1`, `/h2`, `/bullet`, `/code`, `/callout`, `/divider`, `/quote`, `/timestamp`).
- **Rich Markdown Engine**: Headings, clickable task checkboxes (`[ ]` / `[x]`), inline code syntax, blockquotes, keyboard formatting shortcuts (`⌘B`, `⌘I`, `⌘K`).
- **Action Command Palette**: `⌘K` command palette for copying markdown, pin toggle, theme switching, export, and settings.
- **Settings & Shortcuts Customization**: `⌘,` settings modal to manage disk storage folder, shortcuts, license, and appearance.
- **Multi-Tab Note Switcher**: Quick switching between multiple scratchpad notes (`⌘1..9`, `⌘[` / `⌘]`, or header tabs).
- **Zero-Latency Keyboard Ergonomics**: 0ms opening delay; instant keystroke-to-screen feedback.

## Brand Commitments
- Name: **Float**
- Aesthetic: Modern macOS HUD aesthetic, fluid physics, micro-interactions with custom spring physics, sub-pixel specular glass borders, translucent vibrancy.

## Product Principles
1. **Speed is the Ultimate Feature**: Never make the user wait. No launch delays, no modal transition lag.
2. **Invisible Polish**: Unseen details compound — sub-pixel borders, spring-damped interactions, instant focus on summon.
3. **Keyboard First, Mouse Friendly**: Everything must be executable with single keystrokes (`⌘K`, `⌘,`, `/`, `⌘N`, `⌘W`, `⌥P`, `Esc`).
4. **Residency Without Intrusion**: Sits unobtrusively on the screen when pinned, tucks away cleanly when dismissed.
