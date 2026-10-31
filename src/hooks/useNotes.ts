import { useState, useEffect, useCallback, useRef } from 'react';
import { Note } from '../types/note';
import {
  getStoredSettings,
  initStorageDirectory,
  saveNoteMarkdownToDisk,
  deleteNoteMarkdownFromDisk,
} from '../utils/storage';

const STORAGE_KEY = 'float_notes_data_v2';
const LEGACY_STORAGE_KEY = 'float_notes_data_v1';
const ACTIVE_NOTE_KEY = 'float_notes_active_id';

function cleanLegacyContent(content: string): string {
  return content
    .replace(/#\s*FloatNotes/gi, '# Float')
    .replace(/Instant floating desktop scratchpad inspired by Raycast\.?/gi, 'Instant floating desktop scratchpad for macOS.')
    .replace(/Install emilkowalski skills & impeccable/gi, 'Ultra-fast keyboard navigation (⌘N, ⌘W, ⌘,)')
    .replace(/Full Light Mode \(Catppuccin Latte & Raycast Paper\)/gi, 'Full Light & Dark Modes (Obsidian, Sonoma, Catppuccin)')
    .replace(/Raycast Paper/gi, 'Editorial Paper')
    .replace(/inspired by Raycast/gi, 'built for macOS');
}

const INITIAL_NOTES: Note[] = [
  {
    id: 'note-1',
    title: '⚡ Quick Scratchpad',
    content: `# Float ✨
Instant floating desktop scratchpad for macOS.

- [x] Full Light & Dark Modes (Obsidian, Sonoma, Catppuccin)
- [x] Global Hotkey ⌥Space
- [x] Multi-tab switching & disk sync
- [ ] Try pressing \`/\` on any line for slash commands

\`\`\`rust
// Fast floating window
window.set_always_on_top(true)?;
\`\`\`
`,
    createdAt: Date.now() - 3600000,
    updatedAt: Date.now(),
  },
  {
    id: 'note-2',
    title: '🎯 Daily Goals',
    content: `# Daily Goals 🚀

- [ ] Review PRs on GitHub
- [ ] Check keyboard shortcuts in Settings (⌘,)
- [ ] Test local markdown file saving in Documents/Float
- [ ] Enjoy coffee break ☕
`,
    createdAt: Date.now() - 7200000,
    updatedAt: Date.now() - 1800000,
  },
  {
    id: 'note-3',
    title: '📝 Architecture',
    content: `# Architecture & Shortcuts 👥

- **Shortcut Keybinds:**
  - ⌥Space: Toggle Float Window
  - ⌘N / ⌘T: New Note Tab
  - ⌘W: Close Current Note Tab
  - ⌘K / ⌘O: Quick Switcher / Palette
  - ⌘,: Settings & Keybinds
  - ⌥P: Pin / Always on Top
`,
    createdAt: Date.now() - 86400000,
    updatedAt: Date.now() - 3600000,
  },
];

export function useNotes() {
  const [notes, setNotes] = useState<Note[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY) || localStorage.getItem(LEGACY_STORAGE_KEY);
      if (saved) {
        const parsed: Note[] = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          // Clean legacy strings
          const cleaned = parsed.map(n => ({
            ...n,
            title: n.title.replace('FloatNotes', 'Float'),
            content: cleanLegacyContent(n.content),
          }));
          localStorage.removeItem(LEGACY_STORAGE_KEY);
          localStorage.setItem(STORAGE_KEY, JSON.stringify(cleaned));
          return cleaned;
        }
      }
    } catch (e) {
      console.error('Error loading notes from localStorage:', e);
    }
    return INITIAL_NOTES;
  });

  const [activeNoteId, setActiveNoteId] = useState<string>(() => {
    try {
      const savedId = localStorage.getItem(ACTIVE_NOTE_KEY);
      if (savedId && notes.some(n => n.id === savedId)) return savedId;
    } catch {}
    return notes[0]?.id || 'note-1';
  });

  const [lastSaved, setLastSaved] = useState<number>(Date.now());
  const initialDiskSyncDone = useRef(false);

  // Initialize storage directory and sync on mount
  useEffect(() => {
    initStorageDirectory().then(dir => {
      if (!initialDiskSyncDone.current && dir) {
        initialDiskSyncDone.current = true;
        const settings = getStoredSettings();
        if (settings.autoSaveToDisk) {
          notes.forEach(note => {
            saveNoteMarkdownToDisk(dir, note.title, note.content);
          });
        }
      }
    });
  }, [notes]);

  // Save to localStorage and Disk
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(notes));
      setLastSaved(Date.now());
    } catch (e) {
      console.error('Error persisting notes:', e);
    }
  }, [notes]);

  useEffect(() => {
    try {
      localStorage.setItem(ACTIVE_NOTE_KEY, activeNoteId);
    } catch {}
  }, [activeNoteId]);

  const activeNote = notes.find(n => n.id === activeNoteId) || notes[0];

  const updateActiveNoteContent = useCallback((newContent: string) => {
    setNotes(prev =>
      prev.map(note => {
        if (note.id !== activeNoteId) return note;

        // Auto-extract title from first heading if exists
        let newTitle = note.title;
        const firstLine = newContent.split('\n')[0]?.trim();
        if (firstLine && firstLine.startsWith('# ')) {
          newTitle = firstLine.replace(/^#\s+/, '').slice(0, 30);
        }

        const updatedNote = {
          ...note,
          title: newTitle || 'Untitled Note',
          content: newContent,
          updatedAt: Date.now(),
        };

        // Auto-save to disk in background
        const settings = getStoredSettings();
        if (settings.autoSaveToDisk && settings.notesDir) {
          saveNoteMarkdownToDisk(settings.notesDir, updatedNote.title, updatedNote.content);
        }

        return updatedNote;
      })
    );
  }, [activeNoteId]);

  const createNote = useCallback(() => {
    const newNote: Note = {
      id: `note-${Date.now()}`,
      title: 'New Note',
      content: `# New Note ⚡\n\nStart typing or press \`/\` for commands...`,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };
    setNotes(prev => [newNote, ...prev]);
    setActiveNoteId(newNote.id);

    const settings = getStoredSettings();
    if (settings.autoSaveToDisk && settings.notesDir) {
      saveNoteMarkdownToDisk(settings.notesDir, newNote.title, newNote.content);
    }
  }, []);

  const deleteActiveNote = useCallback(() => {
    const current = notes.find(n => n.id === activeNoteId);
    const settings = getStoredSettings();
    if (current && settings.notesDir) {
      deleteNoteMarkdownFromDisk(settings.notesDir, current.title);
    }

    if (notes.length <= 1) {
      // Clear content so there is always one active note
      updateActiveNoteContent('# Scratchpad\n\n');
      return;
    }

    setNotes(prev => {
      const filtered = prev.filter(n => n.id !== activeNoteId);
      setActiveNoteId(filtered[0]?.id || '');
      return filtered;
    });
  }, [activeNoteId, notes, updateActiveNoteContent]);

  // Close tab / note (⌘W)
  const closeActiveNote = useCallback(() => {
    deleteActiveNote();
  }, [deleteActiveNote]);

  // Switch to next tab (⌘])
  const switchToNextNote = useCallback(() => {
    const idx = notes.findIndex(n => n.id === activeNoteId);
    if (idx !== -1) {
      const nextIdx = (idx + 1) % notes.length;
      setActiveNoteId(notes[nextIdx].id);
    }
  }, [notes, activeNoteId]);

  // Switch to previous tab (⌘[)
  const switchToPrevNote = useCallback(() => {
    const idx = notes.findIndex(n => n.id === activeNoteId);
    if (idx !== -1) {
      const prevIdx = (idx - 1 + notes.length) % notes.length;
      setActiveNoteId(notes[prevIdx].id);
    }
  }, [notes, activeNoteId]);

  return {
    notes,
    activeNote,
    activeNoteId,
    setActiveNoteId,
    updateActiveNoteContent,
    createNote,
    deleteActiveNote,
    closeActiveNote,
    switchToNextNote,
    switchToPrevNote,
    lastSaved,
  };
}
