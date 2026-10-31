# ⚡ FloatNotes

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
- **Raycast-Style Slash Commands (`/`)**:
  - Type `/` anywhere to reveal the fuzzy-searchable command menu.
  - Insert:
    - `/todo` &bull; Clickable interactive checkbox checklist
    - `/h1`, `/h2`, `/h3` &bull; Headings
    - `/code` &bull; Syntax-highlighted code block
    - `/callout` &bull; Visual callout note
    - `/quote` &bull; Markdown blockquote
    - `/bullet` &bull; Bullet list
    - `/divider` &bull; Horizontal rule
    - `/timestamp` &bull; Insert date & time
- **Raycast Action Bar & Palette (`⌘K`)**:
  - Bottom status footer showing sync status, word count, character count.
  - Full `⌘K` command center:
    - Copy Markdown (`⌘C`)
    - Pin / Unpin Float (`⌥P`)
    - Switch Theme (`⌥T`)
    - Create New Note (`⌘N`)
    - Export Note to `.md` File (`⌘E`)
    - Delete Note (`⌘⌫`)
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
- **Auto-Persistence**:
  - Changes are auto-saved to disk immediately.

---

## ⌨️ Keyboard Shortcuts

| Shortcut | Action |
| :--- | :--- |
| `⌥ + Space` | Summon / Dismiss Floating Note anywhere on system |
| `/` | Trigger Raycast Slash Command Menu |
| `⌘K` | Open Raycast Actions Command Center |
| `⌥P` | Toggle Pin on Desktop (Always on Top) |
| `⌘N` | Create a New Note |
| `⌘1` .. `⌘9` | Quick-switch between open notes |
| `⌘C` | Copy Note Markdown to Clipboard |
| `⌘E` | Export Note to `.md` File |
| `Esc` | Dismiss palette or close menu |

---

## 🛠️ Development & Running

### Prerequisites
- Node.js (v18+)
- Rust & Cargo (1.80+)

### Start Desktop App (Tauri v2)
```bash
npm run tauri dev
```

### Start Web Preview Only
```bash
npm run dev
```

### Build Production Desktop Binary
```bash
npm run tauri build
```

---

## 🎨 Design System & Interactive Explorer

Explore the design system and live interactive simulator in your browser:
- [`DESIGN_SYSTEM.md`](DESIGN_SYSTEM.md)
- [`PRODUCT.md`](PRODUCT.md)
