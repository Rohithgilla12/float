import { useState, useEffect, useCallback } from 'react';
import { Note } from '../types/note';

const STORAGE_KEY = 'float_notes_data_v1';
const ACTIVE_NOTE_KEY = 'float_notes_active_id';

const INITIAL_NOTES: Note[] = [
  {
    id: 'note-1',
    title: '⚡ Quick Scratchpad',
    content: `# FloatNotes ✨
Instant floating desktop scratchpad inspired by Raycast.

- [x] Install emilkowalski skills & impeccable
- [x] Full Light Mode (Catppuccin Latte & Raycast Paper)
- [ ] Connect global hotkey ⌥Space
- [ ] Build multi-note switching

> 💡 **Tip:** Press \`/\` on any line to open the slash command menu!

\`\`\`rust
// Tauri v2 Floating Window
window.set_always_on_top(true)?;
window.set_visible_on_all_workspaces(true)?;
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
- [ ] Implement slash command fuzzy filter
- [ ] Test cross-platform build
- [ ] Enjoy coffee break ☕
`,
    createdAt: Date.now() - 7200000,
    updatedAt: Date.now() - 1800000,
  },
  {
    id: 'note-3',
    title: '📝 Meeting Notes',
    content: `# Sync with Team 👥

- **Date:** Today
- **Discussion:**
  - Fast keyboard shortcuts (⌥Space to toggle, ⌘K for action bar)
  - Seamless desktop stickiness (Always on Top)
`,
    createdAt: Date.now() - 86400000,
    updatedAt: Date.now() - 3600000,
  },
];

export function useNotes() {
  const [notes, setNotes] = useState<Note[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
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

  // Save to localStorage
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

        return {
          ...note,
          title: newTitle || 'Untitled Note',
          content: newContent,
          updatedAt: Date.now(),
        };
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
  }, []);

  const deleteActiveNote = useCallback(() => {
    if (notes.length <= 1) {
      // Clear instead of delete last note
      updateActiveNoteContent('# Scratchpad\n\n');
      return;
    }
    setNotes(prev => {
      const filtered = prev.filter(n => n.id !== activeNoteId);
      setActiveNoteId(filtered[0]?.id || '');
      return filtered;
    });
  }, [activeNoteId, notes.length, updateActiveNoteContent]);

  return {
    notes,
    activeNote,
    activeNoteId,
    setActiveNoteId,
    updateActiveNoteContent,
    createNote,
    deleteActiveNote,
    lastSaved,
  };
}
