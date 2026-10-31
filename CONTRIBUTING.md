# Contributing to FloatNotes

First off, thank you for considering contributing to FloatNotes! It's people like you that make FloatNotes an extraordinary desktop experience.

## Development Setup

1. **Prerequisites**:
   - [Node.js](https://nodejs.org) (v18+)
   - [Rust](https://rustup.rs) (v1.80+)
   - macOS, Windows, or Linux development environment

2. **Clone & Install**:
   ```bash
   git clone https://github.com/your-username/float-notes.git
   cd float-notes
   npm install
   ```

3. **Start Local Development**:
   ```bash
   npm run tauri dev
   ```

4. **Verify TypeScript & Rust Compilation**:
   ```bash
   npm run build
   cd src-tauri && cargo check
   ```

## Code Guidelines & Craft Standards

FloatNotes is built using the **Emil Kowalski Design Engineering philosophy** and **Impeccable** craft principles:
- **Zero-Latency Interactions:** Do not add artificial animation delays to keyboard-initiated actions (`⌥Space`, `⌘K`, typing).
- **Physical Springs:** Prefer critically damped springs (`cubic-bezier(0.16, 1, 0.3, 1)`) over generic linear easings.
- **Audio Haptics:** Any new sensory audio feedback must be synthesized via the Web Audio API without external file dependencies.
- **High-Contrast Theming:** All UI components must support the 6 built-in themes (including Light Mode like Catppuccin Latte and Raycast Paper).

## Pull Request Process

1. Fork the repository and create your branch from `main`:
   ```bash
   git checkout -b feat/your-feature-name
   ```
2. Commit your changes with meaningful commit messages.
3. Ensure both `npm run build` and `cd src-tauri && cargo check` pass without errors or warnings.
4. Open a Pull Request on GitHub describing your motivation and changes.
