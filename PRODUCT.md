# Product

<!-- impeccable:product-schema 1 -->

## Platform
adaptive (macOS, Windows, Linux desktop via Tauri v2)

## Stack
Tauri v2 (Rust) + React 19 + TypeScript + Tailwind CSS + Framer Motion / Motion + TipTap (ProseMirror rich markdown with slash commands) + Lucide Icons

## Users
Power users, software engineers, designers, researchers, and knowledge workers who want instantaneous, low-friction desktop notes floating on top of their workspaces, accessible via a muscle-memory global shortcut.

## Product Purpose
Deliver the fastest, most beautiful, keyboard-first desktop floating note companion inspired by Raycast Floating Notes. Eliminate the friction of context-switching to heavy note apps for fleeting thoughts, meeting snippets, scratchpads, and quick checklists.

## Positioning
Unlike full-blown workspace apps (Notion, Obsidian) or primitive sticky notes (macOS Stickies), FloatNotes is an ultra-fast, visually stunning, HUD-style floating scratchpad that lives on a hotkey, pins seamlessly over any full-screen app, supports rich slash-command markdown editing, and looks like a native piece of high-craft software.

## Operating Context
- Summoned instantly via a system-wide global shortcut (`⌥ + Space` or `⌘ + ⇧ + Space`).
- Floats over full-screen editors, browsers, Figma, IDEs, and video calls.
- Lives in the system tray and menu bar.
- Rapid capture: user types immediately without touching the mouse.
- Dismissed via `Esc` or hotkey without losing unsaved state (auto-persisted to local disk SQLite or JSON).

## Capabilities and Constraints
- **Floating & Pinning**: Borderless glass window, toggleable "Always on Top" (pinned state), draggable top handle (`data-tauri-drag-region`), visible across all desktop workspaces.
- **Raycast-Style Slash Commands**: Triggered by typing `/` on an empty line or space; interactive fuzzy-filterable command menu (`/todo`, `/h1`, `/h2`, `/bullet`, `/code`, `/callout`, `/divider`, `/quote`, `/timestamp`).
- **Rich Markdown Engine**: Headings, clickable task checkboxes (`[ ]` / `[x]`), inline code syntax, blockquotes, keyboard formatting shortcuts (`⌘B`, `⌘I`, `⌘K`).
- **Raycast Action Bar**: Bottom utility footer featuring `⌘K` command palette, action triggers (Copy Markdown, Export, Clear, Trash, Pin), word count, and last-saved timestamp.
- **Multi-Note Switcher**: Quick switching between multiple scratchpad notes (`⌘1..9` or note pill carousel).
- **Zero-Latency Keyboard Ergonomics**: 0ms opening delay; instant keystroke-to-screen feedback following Emil Kowalski's craft guidelines.

## Brand Commitments
- Name: **FloatNotes** (or Float Note)
- Aesthetic: Raycast-grade craftsmanship, Apple fluid physics, micro-interactions with custom spring physics, sub-pixel glass borders, translucent vibrancy.

## Product Principles
1. **Speed is the Ultimate Feature**: Never make the user wait. No launch delays, no modal transition lag.
2. **Invisible Polish**: Unseen details compound — sub-pixel borders, spring-damped drag releases, instant focus on summon.
3. **Keyboard First, Mouse Friendly**: Everything must be executable with single keystrokes (`⌘K`, `/`, `⌘↵`, `Esc`, `⌘P`).
4. **Residency Without Intrusion**: Sits unobtrusively on the screen when pinned, tucks away cleanly when dismissed.
