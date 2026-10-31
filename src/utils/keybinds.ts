export interface KeybindSettings {
  newNoteKey: 'mod+n' | 'mod+t';
  closeNoteKey: 'mod+w';
  openPaletteKey: 'mod+k' | 'mod+o';
  togglePinKey: 'alt+p';
  openSettingsKey: 'mod+,';
}

const KEYBINDS_STORAGE_KEY = 'float_keybinds_settings_v1';

export const DEFAULT_KEYBINDS: KeybindSettings = {
  newNoteKey: 'mod+n',
  closeNoteKey: 'mod+w',
  openPaletteKey: 'mod+k',
  togglePinKey: 'alt+p',
  openSettingsKey: 'mod+,',
};

export function getKeybindSettings(): KeybindSettings {
  try {
    const raw = localStorage.getItem(KEYBINDS_STORAGE_KEY);
    if (raw) {
      return { ...DEFAULT_KEYBINDS, ...JSON.parse(raw) };
    }
  } catch {}
  return DEFAULT_KEYBINDS;
}

export function saveKeybindSettings(settings: KeybindSettings): void {
  try {
    localStorage.setItem(KEYBINDS_STORAGE_KEY, JSON.stringify(settings));
  } catch {}
}

export function matchesKeybind(
  e: KeyboardEvent,
  action: 'newNote' | 'closeNote' | 'openPalette' | 'togglePin' | 'openSettings',
  _settings: KeybindSettings = getKeybindSettings()
): boolean {
  const isMod = e.metaKey || e.ctrlKey;
  const isAlt = e.altKey;
  const key = e.key.toLowerCase();

  switch (action) {
    case 'newNote':
      // Support both mod+n or mod+t
      return isMod && (key === 'n' || key === 't');

    case 'closeNote':
      return isMod && key === 'w';

    case 'openPalette':
      // Support mod+k or mod+o
      return isMod && (key === 'k' || key === 'o');

    case 'togglePin':
      return isAlt && key === 'p';

    case 'openSettings':
      return isMod && (key === ',' || key === '<');

    default:
      return false;
  }
}
