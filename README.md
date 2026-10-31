# ⚡ FloatNotes

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![Tauri v2](https://img.shields.io/badge/Tauri-v2-FFC131?logo=tauri&logoColor=white)](https://v2.tauri.app/)
[![React 19](https://img.shields.io/badge/React-19-61DAFB?logo=react&logoColor=black)](https://react.dev/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-3.4-38B2AC?logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)
[![Craft: Emil Kowalski](https://img.shields.io/badge/Design_Craft-Emil_Kowalski-FF6363)](https://skills.sh/emilkowalski/skills)

> **The fastest, most beautiful cross-platform floating desktop notes app, inspired by Raycast Floating Notes.**  
> Crafted with **Tauri v2 (Rust)**, **React 19 + TypeScript**, **Tailwind CSS**, and **Emil Kowalski's design engineering principles**.

---

## ✨ Key Features

- **Desktop Floating & Pinning**: 
  - Borderless translucent floating glass panel.
  - Toggleable **"Always on Top"** desktop pinning (`⌥P`), keeping your scratchpad floating above full-screen editors, Figma, or browsers.
  - Multi-workspace ubiquity on macOS (`set_visible_on_all_workspaces(true)`).
  - Smooth window dragging via `data-tauri-drag-region`.
- **Global Hotkey Summoning**:
  - Press `⌥ + Space` (Option+Space or Alt+Space) anywhere on your system to instantly summon or dismiss your floating scratchpad.
  - **0ms keyboard latency:** No slow fade-in or scaling on summon.
- **Unified Live WYSIWYG Editor**:
  - Always in rendered preview mode—zero clunky "edit vs preview" toggle.
  - Interactive clickable checkboxes with fluid spring tick and strikethrough.
  - Auto-formatting as you type (`# `, `## `, `### `, `[] `, `- `, `> `).
- **Raycast-Style Slash Commands (`/`)**:
  - Type `/` anywhere to reveal the fuzzy-searchable command menu.
  - Insert `/todo`, `/h1`..`/h3`, `/code`, `/callout`, `/quote`, `/bullet`, `/divider`, `/timestamp`.
- **Overdrive Sensory Polish (A + B)**:
  - **Synthesized Web Audio Micro-Haptics:** Real-time tactile mechanical clicks for task checks, key presses, and shortcuts via `AudioContext`.
  - **Sub-Pixel Specular Glass Shader:** Real-time cursor coordinates track along the 1px border, casting a specular light sheen.
  - **Task Particle Bursts:** 60 FPS micro sparkles radiate when completing checklist items.
  - **Fluid Morphing Palette:** The `⌘K` command sheet springs smoothly from the trigger origin.
- **Raycast Action Bar & Palette (`⌘K`)**:
  - Bottom status footer showing sync status, word count, character count.
  - Full `⌘K` command center for copying markdown, pinning, theme switching, and exporting.
- **Multi-Theme Engine with First-Class Light Mode ☀️**:
  - **Raycast Obsidian** (Dark): Pitch-black HUD, sub-pixel glass borders, coral-red accent glow.
  - **Catppuccin Mocha** (Dark): Developer favorite soothing pastel dark theme.
  - **Catppuccin Latte** (Light): Warm daytime off-white paper canvas with lavender Mauve accents.
  - **Raycast Paper** (Light): High-contrast architectural office white with crisp slate typography.
  - **Spatial Sonoma** (Glass): Apple frosted acrylic glass with specular reflections.
  - **Linear Monastic** (Slate): Ultra-clean, distraction-free markdown retreat.
- **Multi-Note Switcher**:
  - Header note tabs with `+` button.
  - Switch notes with `⌘1` .. `⌘9`.

---

## ⌨️ Keyboard Shortcuts

| Shortcut | Action |
| :--- | :--- |
| `⌥ + Space` | Summon / Dismiss Floating Note anywhere on system |
| `Esc` | Dismiss open menus, or close/hide floating note |
| `/` | Trigger Raycast Slash Command Menu |
| `⌘K` | Open Raycast Actions Command Center |
| `⌥P` | Toggle Pin on Desktop (Always on Top) |
| `⌘N` | Create a New Note |
| `⌘1` .. `⌘9` | Quick-switch between open notes |
| `⌘C` | Copy Note Markdown to Clipboard |
| `⌘E` | Export Note to `.md` File |

---

## 🛠️ Development & Building

### Prerequisites
- Node.js (v18+)
- Rust & Cargo (1.80+)

### Start Desktop App in Development
```bash
npm run tauri dev
```

### Build Production Desktop Binary (.dmg / .app)
```bash
npm run tauri build
```

---

## 💰 Open Source & $4.99 Lifetime License

FloatNotes follows the open source commercial model popularized by indie macOS tools like **Maccy** and **Shottr**:
- The code is **100% Open Source** on GitHub under the [MIT License](LICENSE).
- Pre-built, signed, and Apple-notarized `.dmg` binaries with automatic updates are available for a **$4.99 one-time lifetime license** on Lemon Squeezy / Gumroad.

See [`MONETIZATION_AND_SIGNING.md`](MONETIZATION_AND_SIGNING.md) for the complete Apple signing, notarization, and monetization playbook.

---

## 🤝 Contributing

Contributions are welcome! Please read [`CONTRIBUTING.md`](CONTRIBUTING.md) before opening a pull request.
