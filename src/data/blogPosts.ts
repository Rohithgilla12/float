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
    title: 'The Best Floating Notes Apps for macOS in 2026 (and Why Stickies Falls Short)',
    metaTitle: '5 Floating Notes Apps for Mac Compared (2026)',
    description: 'Float, Apple Stickies, Raycast Notes, Tot, and SideNotes compared: which ones stay over full-screen apps, where your notes are stored, and what each costs.',
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
If you work on a Mac all day, small things need writing down at awkward moments: a URL during a call, a command from a build log, a to-do that comes up halfway through something else.

Opening Notion or Obsidian for that means switching to a full app and deciding where the note belongs. Apple's built-in **Stickies** is quicker, but it has barely changed since it shipped with System 7.5 in 1994.

This guide compares five **floating notes apps for macOS**: what each does well, where it falls short, and where your notes end up.

*Disclosure: I make Float, so weigh my verdict on it accordingly.*

---

### The Contenders at a Glance

| App | Stays over full-screen apps | Where notes live | Price |
| :--- | :--- | :--- | :--- |
| **Float** | **Yes (pinned by default, \`⌥P\` to toggle)** | **Plain \`.md\` files in \`~/Documents/Float\`** | **Free and open source; $4.99 one-time Pro** |
| **Apple Stickies** | ❌ No | Stickies' own storage | Free, built in |
| **Raycast Notes** | Not checked | Encrypted local database, exports to Markdown | Free up to 5 notes; Raycast Pro for more |
| **Tot** | Not checked | Seven notes, synced through iCloud | One-time purchase |
| **SideNotes** | Not checked | Synced through iCloud | $19.99 one-time, or Setapp |

Checked in November 2026. If something here is out of date, [open an issue](https://github.com/Rohithgilla12/float/issues) and I'll fix it.

---

### 1. Float: A Floating Scratchpad That Writes Markdown Files

- **Global hotkey:** \`⌥Space\` shows or hides Float from any app.
- **Stays over full-screen apps:** Float is pinned by default. It raises its window to the macOS status window level and joins every Space, so it stays over full-screen Figma, VS Code, or a video call. \`⌥P\` turns the pin off and on.
- **Notes as Markdown files:** each open note is saved as a \`.md\` file in \`~/Documents/Float\`. Float Pro lets you choose another folder, such as one inside an Obsidian vault.
- **Slash commands:** type \`/\` for to-dos, headings, code blocks, callouts, tables, a timestamp, or a quick calculation.

**Limits worth knowing:** the free version keeps 3 note tabs. Float writes the files but doesn't read them back, so edits made in another app won't appear in Float. Closing a tab deletes that note's file.

*Verdict:* a good fit if you're keyboard-first, spend your day in full-screen apps, and want notes as plain files.

---

### 2. Apple Stickies: The Classic That Stayed Put

Stickies ships with every Mac, so it's the first thing most people try.

**Where it works:**
- Nothing to install.
- Coloured notes, and a **Float on Top** option in the Window menu.

**Where it falls short:**
- **Gone in full screen:** a sticky belongs to one desktop Space. When an app goes full screen, macOS gives it a Space of its own, and your stickies stay behind, even with Float on Top turned on.
- **No Markdown:** no code blocks, checkboxes, or Markdown shortcuts.
- **No hotkey** to bring your notes forward from another app.

---

### 3. Raycast Notes: Good If You Already Live in Raycast

If Raycast is already your launcher, Notes comes built in.

**Where it works:**
- Opens from Raycast with a hotkey, in a floating window that resizes to fit the note.
- Markdown formatting, and export to Markdown, HTML, or plain text.

**Where it falls short:**
- **Not files:** notes live in Raycast's encrypted database, so Obsidian or VS Code can't open them until you export.
- **Five notes on the free plan:** unlimited notes and sync between Macs need Raycast Pro.

---

### 4. Tot: Seven Notes and No More

Tot, by The Iconfactory, gives you exactly **seven colour-coded notes**.

**Where it works:**
- The fixed seven keep notes from piling up.
- Syncs between Mac, iPhone, and iPad through iCloud.

**Where it falls short:**
- If you want a scratchpad per project or per meeting, seven runs out quickly.

---

### 5. SideNotes: Notes on the Edge of the Screen

SideNotes, by Apptorium, keeps notes in a panel that slides out from the edge of the screen.

**Where it works:**
- Out of the way until you need it.
- Markdown, plain-text, and code modes, with iCloud sync to the iOS app (sold separately).

**Where it falls short:**
- It's a panel at the screen edge rather than a window you can place next to your work.

---

### Which One to Pick

- You want notes as plain Markdown files and a window that stays over full-screen apps: **[Float](https://float.gilla.fun)**.
- You want a hard limit that keeps you tidy: **Tot**.
- You already use Raycast for everything and don't need files: **Raycast Notes**.
- You'd rather keep notes in a panel at the edge of the screen: **SideNotes**.
`,
  },
  {
    slug: 'how-to-keep-notes-always-on-top-mac',
    title: 'How to Keep Sticky Notes Always on Top Over Full-Screen Apps on Mac',
    metaTitle: 'How to Keep Sticky Notes Always on Top in macOS (Full Screen Guide)',
    description: 'Why Stickies\' "Float on Top" disappears when an app goes full screen on macOS, what an app has to do to stay visible, and how to pin a note over full-screen apps and video calls.',
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
One of the most frustrating things about macOS is what happens to small windows when you use **full-screen apps**.

You open Apple's **Stickies**, turn on **Window > Float on Top**, and think you're set. Then you click the green full-screen button in Chrome, Xcode, or Figma, and **your sticky note disappears.**

Here's why that happens, and how to keep a note visible over full-screen apps.

---

### Why Stickies Disappears in Full Screen

When an app goes full screen, macOS doesn't just make its window bigger. It moves the app into a **Space of its own**, a separate desktop in Mission Control.

An ordinary window belongs to one Space. Float on Top keeps a sticky above other windows on its own Space, but it doesn't let the sticky follow you into the full-screen app's Space, so the note stays behind on your desktop.

---

### What an App Has to Do to Float Over Full-Screen Apps

On macOS, a window can stay visible over a full-screen app only if the app does three things:

1. **Lets the window join every Space**, including full-screen ones. In AppKit, that's the \`canJoinAllSpaces\` and \`fullScreenAuxiliary\` collection behaviours.
2. **Raises the window above ordinary app windows**, for example to the status window level.
3. **Runs as an accessory app**, without a Dock icon. Otherwise macOS switches you back to the window's original Space when it opens, instead of showing it over the app you're in.

Here's how Float sets the first two when you pin it (Rust, using the \`objc2\` AppKit bindings):

\`\`\`rust
let behavior = NSWindowCollectionBehavior::CanJoinAllSpaces
    | NSWindowCollectionBehavior::FullScreenAuxiliary
    | NSWindowCollectionBehavior::Stationary;
ns_window.setCollectionBehavior(behavior);
ns_window.setLevel(NSStatusWindowLevel);
\`\`\`

A plain "always on top" setting, like Tauri's \`set_always_on_top\`, only covers part of this: it uses the lower floating level and doesn't change which Spaces the window can join.

---

### Step by Step: Keeping a Note on Top with Float

**[Float](https://float.gilla.fun)** does all of this for you:

1. **Open Float from anywhere:** press \`⌥ Space\` (Option + Space).
2. **Check the pin:** Float starts pinned, and the button in the top-right corner reads **PINNED**. Click it or press \`⌥P\` to switch between pinned and unpinned.
3. **Go full screen:** make Xcode or VS Code full screen, or start a Zoom screen share.
4. **Float stays put:** it sits over your editor, so you can check meeting notes, copy a terminal command, or tick off a to-do without leaving the app.

---

### Useful Keyboard Shortcuts in Float

| Shortcut | Action |
| :--- | :--- |
| \`⌥ Space\` | Show or hide Float |
| \`⌥ P\` | Pin or unpin (stay over full-screen apps) |
| \`⌘ N\` / \`⌘ T\` | New note tab |
| \`⌘ W\` | Close the current tab |
| \`⌘ [\` / \`⌘ ]\` | Previous or next tab |
| \`⌘ 1\`–\`⌘ 9\` | Jump to a tab |
| \`⌘ K\` | Command palette |
| \`⌥ [\` / \`⌥ ]\` | Make the window more or less transparent |
| \`⌘ ,\` | Settings |

---

### Conclusion

You don't have to put up with notes hiding behind full-screen apps. An app that joins every Space and sits above normal windows keeps your notes where you can see them.
`,
  },
  {
    slug: 'obsidian-quick-capture-floating-scratchpad',
    title: 'A Quick-Capture Scratchpad for Obsidian on macOS',
    metaTitle: 'Obsidian Quick Capture on Mac: A Floating Markdown Scratchpad',
    description: 'Jot things down without opening Obsidian, and have them land in your vault as Markdown files. How to set up Float as a quick-capture scratchpad for Obsidian.',
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
Obsidian is one of the best places to keep notes for the long term. The common complaint is **quick capture**.

When something comes up in a meeting or while you're reading, switching to Obsidian, waiting for it and its plugins to load, and picking a note to put it in takes you out of what you were doing.

Many floating note apps solve the speed problem but keep your notes in their own database, away from your vault.

Here's how to set up a **keyboard-first scratchpad** whose notes land in Obsidian as plain \`.md\` files.

---

### How It Works

**Float** saves each open note as a Markdown file in a folder on your Mac. Obsidian watches the folders in your vault, so when that folder is in your vault, Float's notes show up in Obsidian's file list, search, and graph without any sync step.

Two things to know before you set it up:

- **Float writes the files; it doesn't read them back.** If you edit a note in Obsidian while it's still open in Float, Float overwrites your edit the next time you type in that tab.
- **Closing a tab in Float deletes its file.** Treat the folder as an inbox: move a note out of it in Obsidian when you want to keep it.

---

### Option A: Save Straight into Your Vault (Float Pro)

Choosing the notes folder is a Float Pro feature.

1. In your Obsidian vault, create a folder for Float, such as \`00 Inbox\`.
2. In Float, press \`⌘,\` to open Settings and go to **Storage & Files**.
3. Under **Notes Folder Location**, click **Change** and pick that folder.
4. Make sure **Auto-Save Markdown Files** is on.

### Option B: Open Float's Folder as Its Own Vault (Free)

On the free version, Float saves to \`~/Documents/Float\`. In Obsidian, choose **Open folder as vault** and pick that folder. Your Float notes then have their own small vault, and you can copy anything worth keeping into your main one.

---

### Capturing with \`⌥Space\`

- Press \`⌥Space\` while you're reading or in a call.
- Type \`/\` for a to-do list, a code block, or a heading.
- Press \`⌥Space\` to hide Float again, or \`Esc\` twice if you're still typing.
- Later, in Obsidian, the notes are already there to search, link, and move into your permanent folders.

---

### Why Not Just Use Obsidian's Daily Notes?

- **It's already open:** Float stays running in the background, so \`⌥Space\` shows a window that's already there rather than launching an app.
- **It stays on top:** pinned, Float sits over full-screen video calls and PDF readers, while Obsidian is a full window of its own.
- **It keeps rough notes apart:** your scratchpad stays separate from your long-term notes until you're ready to sort it.

Try it with **[Float](https://float.gilla.fun)**.
`,
  },
];
