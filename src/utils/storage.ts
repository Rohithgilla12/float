export interface StorageSettings {
  notesDir: string;
  autoSaveToDisk: boolean;
}

const STORAGE_SETTINGS_KEY = 'float_storage_settings_v1';

export function getStoredSettings(): StorageSettings {
  try {
    const raw = localStorage.getItem(STORAGE_SETTINGS_KEY);
    if (raw) {
      return JSON.parse(raw);
    }
  } catch {}
  return {
    notesDir: '~/Documents/Float',
    autoSaveToDisk: true,
  };
}

export function saveStoredSettings(settings: StorageSettings): void {
  try {
    localStorage.setItem(STORAGE_SETTINGS_KEY, JSON.stringify(settings));
  } catch {}
}

const isTauri = typeof window !== 'undefined' && ('__TAURI_INTERNALS__' in window || '__TAURI__' in window);

export async function initStorageDirectory(): Promise<string> {
  const current = getStoredSettings();
  if (isTauri) {
    try {
      const { invoke } = await import('@tauri-apps/api/core');
      const defaultDir = await invoke<string>('get_default_notes_dir');
      if (current.notesDir === '~/Documents/Float' || !current.notesDir) {
        saveStoredSettings({ ...current, notesDir: defaultDir });
        return defaultDir;
      }
      return current.notesDir;
    } catch (e) {
      console.warn('Could not initialize Tauri storage directory:', e);
    }
  }
  return current.notesDir;
}

export async function pickStorageFolder(): Promise<string | null> {
  if (!isTauri) return null;
  try {
    const { invoke } = await import('@tauri-apps/api/core');
    const chosen = await invoke<string | null>('pick_folder', { defaultPath: null });
    return chosen;
  } catch (e) {
    console.error('Failed to pick folder:', e);
    return null;
  }
}

export async function revealStorageInFinder(dir: string): Promise<void> {
  if (!isTauri) return;
  try {
    const { invoke } = await import('@tauri-apps/api/core');
    await invoke('reveal_in_finder', { path: dir });
  } catch (e) {
    console.error('Failed to reveal in Finder:', e);
  }
}

export async function saveNoteMarkdownToDisk(dir: string, title: string, content: string): Promise<void> {
  if (!isTauri) return;
  try {
    const { invoke } = await import('@tauri-apps/api/core');
    const cleanName = (title || 'untitled').replace(/[/\\?%*:|"<>]/g, '_').trim() || 'note';
    const filePath = `${dir}/${cleanName}.md`;
    await invoke('save_note_file', { filePath, content });
  } catch (e) {
    console.error('Failed to save note to disk:', e);
  }
}

export async function deleteNoteMarkdownFromDisk(dir: string, title: string): Promise<void> {
  if (!isTauri) return;
  try {
    const { invoke } = await import('@tauri-apps/api/core');
    const cleanName = (title || 'untitled').replace(/[/\\?%*:|"<>]/g, '_').trim() || 'note';
    const filePath = `${dir}/${cleanName}.md`;
    await invoke('delete_note_file', { filePath });
  } catch (e) {
    console.error('Failed to delete note from disk:', e);
  }
}
