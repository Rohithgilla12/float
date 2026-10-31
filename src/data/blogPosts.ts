export interface BlogPost {
  slug: string;
  title: string;
  metaTitle: string;
  description: string;
  date: string;
  readTime: string;
  category: 'Comparisons' | 'Guides' | 'Workflows';
  targetKeyword: string;
  secondaryKeywords: string[];
  author: {
    name: string;
    role: string;
    avatar: string;
  };
  content: string;
}

export const BLOG_POSTS: BlogPost[] = [
  {
    slug: 'best-floating-notes-apps-mac',
    title: 'The Best Floating Notes Apps for macOS in 2026 (Why Native Stickies Falls Short)',
    metaTitle: '5 Best Floating Notes Apps for Mac (2026 In-Depth Comparison)',
    description: 'Looking for a modern, always-on-top floating scratchpad for Mac? We compared Apple Stickies, Raycast Notes, Tot, SideNotes, and Float to find the fastest desktop note companion.',
    date: 'Oct 31, 2026',
    readTime: '6 min read',
    category: 'Comparisons',
    targetKeyword: 'best floating notes app mac',
    secondaryKeywords: ['stickies alternative mac', 'always on top notes mac', 'floating scratchpad mac', 'raycast floating notes alternative'],
    author: {
      name: 'Rohith Gilla',
      role: 'Creator of Float',
      avatar: '/favicon.png',
    },
    content: `
If you work on a Mac all day, you know the constant friction of fleeting thoughts. You're in a Zoom call, deep inside an Xcode build, or testing an API in Postman, and you need to jot down a quick URL, customer snippet, or to-do.

Opening a heavy electron app like Notion or Obsidian takes seconds and shatters your focus. Opening Apple's built-in **Stickies** app feels like stepping back into System 7 in 1994.

In this guide, we break down the top **floating notes apps for macOS** in 2026, comparing speed, window level behavior over full-screen apps, local file storage, and keyboard ergonomics.

---

### The Contenders at a Glance

| App | Summon Latency | Always on Top | Full-Screen Spaces Support | Local Plain \`.md\` Files | Price |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **Float** | **0ms (Native Rust/Tauri)** | **Yes (\`⌥P\`)** | **Yes (Multi-workspace)** | **Yes (\`~/Documents/Float\`)** | **Free OSS / $4.99 Pro** |
| **Apple Stickies** | ~400ms (App Launch) | Manual (Window menu) | ❌ **Hides in Full Screen** | ❌ Proprietary database | Free (Preinstalled) |
| **Raycast Notes** | ~200ms | Yes | Limited | ❌ SQLite internal DB | Free / $8/mo Pro |
| **Tot (Iconfactory)** | ~150ms | Yes (Detached) | ❌ Standard window level | ❌ Plain text / RTF (max 7) | $19.99 (iOS) / Free (Mac) |
| **SideNotes** | ~100ms | Docked edge | ❌ Hides on active space change | ❌ Proprietary DB | $19.99 (or Setapp) |

---

### 1. Float — The Fastest Standalone Floating Scratchpad

**Float** was built to solve the exact flaws that plague both traditional sticky notes and bloated workspace apps.

- **0ms Summon Latency:** Tap \`⌥ Space\` anywhere in macOS and a borderless, translucent floating glass window springs to focus instantly.
- **True Multi-Workspace & Full-Screen Pinning:** Unlike Apple Stickies, pressing \`⌥P\` elevates Float to native macOS status window levels (\`NSStatusWindowLevel\`) and enables ubiquity across all mission control virtual desktops (\`set_visible_on_all_workspaces(true)\`). You can pin Float directly on top of full-screen Figma or VS Code without it disappearing.
- **Zero Lock-In (\`.md\` Local Files):** Every note is saved in plain Markdown under \`~/Documents/Float\` (customizable in Settings \`⌘,\`). If you use Obsidian, your Float notes automatically live inside your vault.
- **Rich Live WYSIWYG & Slash Commands:** Type \`/\` for instant checklists, code snippets, callouts, and headings with tactile Web Audio micro-haptics.

*Verdict:* The ultimate choice for software engineers, designers, and keyboard-first power users who want speed without proprietary lock-in.

---

### 2. Apple Stickies — The 90s Classic That Time Forgot

Included with every Mac since Mac OS 7, Apple Stickies is the default tool most users reach for first.

**Where it succeeds:**
- Zero installation required.
- Colorful pastel backgrounds (yellow, blue, green, pink).
- Has a rudimentary "Float on Top" option in the Window menu.

**Where it fails in 2026:**
- **Disappears in Full-Screen:** As soon as you maximize any app or swipe to a separate macOS Space, your Stickies vanish behind the workspace curtain.
- **No Markdown Support:** You cannot format code blocks, create interactive clickable checkboxes, or use Markdown shortcuts.
- **No Global Summon Hotkey:** You must click the icon or search Spotlight to bring it forward.

---

### 3. Raycast Floating Notes — Great If You Already Live in Raycast

Raycast popularized the modern HUD floating note for developers.

**Where it succeeds:**
- Beautiful dark-mode typography.
- Single hotkey summoning from within the launcher.
- Clean floating window mode.

**Where it fails:**
- **Proprietary Internal Database:** Notes are trapped inside Raycast's internal SQLite storage. You cannot open them directly as raw files in Obsidian or VS Code without manually copying them.
- **Launcher Overhead:** If you only want a lightweight scratchpad, running the full Raycast background process can consume significant RAM and battery.

---

### 4. Tot by The Iconfactory — Constrained Simplicity

Tot takes an opinionated, minimalist stance: you get exactly **7 color-coded notes** and nothing more.

**Where it succeeds:**
- Eliminates digital hoarding by capping your notes at 7 tabs.
- Elegant Apple design language with native menu bar companion.

**Where it fails:**
- If you need project scratchpads, meeting snippets, or more than 7 topics, you are out of luck.
- iOS companion app costs a steep $19.99.

---

### Summary & Recommendation

- If you want a **free, open-source, ultra-fast floating scratchpad** that saves to plain \`.md\` files and **never disappears over full-screen apps**, get **[Float](https://float.gilla.fun)**.
- If you only need temporary snippets and want to force yourself to delete them, try **Tot**.
- If you already use Raycast for all window management and don't care about plain text files, use **Raycast Notes**.
`,
  },
  {
    slug: 'how-to-keep-notes-always-on-top-mac',
    title: 'How to Keep Sticky Notes Always on Top Over Full-Screen Apps on Mac',
    metaTitle: 'How to Keep Sticky Notes Always on Top in macOS (Full Screen Guide)',
    description: 'Learn why Apple Stickies "Float on Top" disappears in full-screen mode on macOS, and how to keep your notes permanently pinned above full-screen apps and video calls.',
    date: 'Oct 31, 2026',
    readTime: '5 min read',
    category: 'Guides',
    targetKeyword: 'always on top notes mac',
    secondaryKeywords: ['keep stickies on top full screen mac', 'pin note on mac screen', 'macos float on top fullscreen'],
    author: {
      name: 'Rohith Gilla',
      role: 'Creator of Float',
      avatar: '/favicon.png',
    },
    content: `
One of the most frustrating limitations in macOS is how the operating system handles **Full-Screen Apps and Spaces**.

You open Apple's built-in **Stickies** app, check **Window > Float on Top**, and think you're set. But the moment you click the green maximize button on Google Chrome, Xcode, or Figma, **your sticky note disappears.**

Why does this happen, and how can you keep a floating note pinned over full-screen apps on Mac? Let's dive in.

---

### Why Apple's "Float on Top" Fails in Full Screen

In macOS, when you turn an application full-screen, the OS does not simply resize the window. Instead, **macOS creates a dedicated virtual Space** (a separate desktop display space in Mission Control).

Apple's native Stickies window resides only on the primary desktop space (\`NSNormalWindowLevel\`). Even when set to "Float on Top", the window manager locks Stickies to Desktop 1. When you swipe over to a full-screen app, Stickies stays behind on the old desktop.

---

### The Solution: True Cocoa Window Levels & Multi-Space Ubiquity

To keep a window floating above full-screen apps in modern macOS (Sonoma, Sequoia, and beyond), an app must do two specific things in Cocoa / AppKit:

1. **Set Window Collection Behavior to Can Join All Spaces:**
   \`\`\`rust
   // Rust / Tauri v2 Window Configuration
   window.set_visible_on_all_workspaces(true)?;
   \`\`\`
2. **Elevate Window Level above Normal Applications:**
   The window level must be set to \`NSStatusWindowLevel\` or \`NSFloatingWindowLevel\`:
   \`\`\`rust
   window.set_always_on_top(true)?;
   \`\`\`

When both flags are active, the floating window ignores virtual desktop boundaries and hovers seamlessly across every monitor and full-screen space.

---

### Step-by-Step: Keeping Notes Always on Top with Float

**[Float](https://float.gilla.fun)** implements these native macOS window controls out of the box:

1. **Summon Float Anywhere:** Press \`⌥ + Space\` (Option + Space) on any screen.
2. **Toggle Desktop Pin:** Click the **PIN** button in the top right header, or press \`⌥P\`.
3. **Switch to Full Screen:** Maximize Xcode, VS Code, or start a Zoom screen share.
4. **Notice the Difference:** Float remains crisply floating above your editor, letting you reference meeting action items, copy terminal snippets, and check to-dos without ever leaving your IDE.

---

### Useful Keyboard Shortcuts in Float

| Shortcut | Action |
| :--- | :--- |
| \`⌥ Space\` | Instant summon / dismiss |
| \`⌥ P\` | Toggle Always on Top (Pin above fullscreen apps) |
| \`⌘ N\` / \`⌘ T\` | Create new note tab |
| \`⌘ W\` | Close active note tab |
| \`⌘ [\` / \`⌘ ]\` | Cycle previous / next note tab |
| \`⌘ ,\` | Open Settings (Custom storage folder & shortcuts) |

---

### Conclusion

You don't have to tolerate notes hiding behind fullscreen editors. By using an app engineered with native Cocoa multi-workspace support, your notes stay right where your eyes need them.
`,
  },
  {
    slug: 'obsidian-quick-capture-floating-scratchpad',
    title: 'Building the Ultimate Obsidian Quick-Capture Scratchpad on macOS',
    metaTitle: 'Obsidian Quick Capture on Mac: The Zero-Friction Floating Scratchpad',
    description: 'Stop waiting for Obsidian to load just to write a fleeting thought. Discover how to connect Float to your Obsidian vault for instantaneous, local-first markdown capture.',
    date: 'Oct 31, 2026',
    readTime: '4 min read',
    category: 'Workflows',
    targetKeyword: 'obsidian quick capture mac',
    secondaryKeywords: ['local markdown scratchpad mac', 'floating markdown editor mac', 'quick capture notes global hotkey'],
    author: {
      name: 'Rohith Gilla',
      role: 'Creator of Float',
      avatar: '/favicon.png',
    },
    content: `
Obsidian is arguably the finest personal knowledge base on the planet. But if there is one universal complaint among Obsidian power users, it's **quick capture speed**.

When inspiration strikes during a meeting or while reading an article, opening Obsidian, waiting for community plugins to initialize, and creating a new daily note file disrupts your flow state.

Many power users turn to floating companion apps, only to discover their notes are trapped inside closed proprietary cloud databases.

Here is how to create a **zero-latency quick-capture scratchpad** that saves directly into your Obsidian vault in plain \`.md\` files.

---

### The Architecture: Float + Obsidian Vault Sync

Unlike note utilities that rely on proprietary cloud synchronizers, **Float** saves every note as a clean, raw Markdown file on your local disk.

By pointing Float's storage directory to an inbox folder inside your Obsidian vault (for example: \`~/Documents/Vault/00_Inbox\`), you achieve the holy grail of note-taking:

1. **Instant Capture in Float (\`⌥Space\`):** 0ms keystroke response, interactive checkboxes, and live WYSIWYG formatting.
2. **Instant Sync in Obsidian:** Because Obsidian constantly watches your local file system, changes saved by Float appear instantly in your Obsidian file tree and graph view.
3. **Zero Lock-In:** You can open your notes in Finder, VS Code, iA Writer, or git version control at any moment.

---

### Step-by-Step Setup Guide

#### Step 1: Create an Inbox Folder in Obsidian
Inside your Obsidian vault, create a dedicated folder named \`Float Inbox\` or \`00_Scratchpad\`.

#### Step 2: Configure Float's Storage Directory
1. Open Float and press \`⌘,\` (or click the Settings gear icon in the header).
2. Go to the **Storage & Files** tab.
3. Click **"Change..."** to open the native macOS folder picker.
4. Select your \`Float Inbox\` folder inside your Obsidian vault.
5. Ensure **"Auto-save markdown files to disk"** is toggled ON.

#### Step 3: Capture Fleeting Thoughts with \`⌥Space\`
- Hit \`⌥Space\` while reading a paper or in a Slack huddle.
- Type \`/\` to drop in a quick \`/todo\` or code block.
- When done, hit \`Esc\` or \`⌥Space\` to tuck Float away.
- When you open Obsidian later in the evening, all your scratchpads are already indexed, searchable, and ready to be linked into your permanent notes.

---

### Why Not Just Use Obsidian Daily Notes?

- **Zero Startup Delay:** Float is a tiny, native Rust binary that consumes almost zero RAM in the background. It wakes up in under 5 milliseconds.
- **Always on Top:** Float floats directly on top of full-screen video calls and PDF readers (\`⌥P\`), whereas Obsidian is a full desktop window.
- **Separation of Concerns:** Keep your active scratchpad separate from your long-term knowledge graph until you are ready to organize.

Start streamlining your capture workflow with **[Float](https://float.gilla.fun)** today.
`,
  },
];
