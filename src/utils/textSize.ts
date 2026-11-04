const TEXT_SIZE_STORAGE_KEY = 'float_editor_text_size';

// Body text sizes in px. Headings and code scale from the body size.
export const TEXT_SIZES = [11, 12, 13, 14, 15, 16, 18, 20, 22, 24] as const;
export const DEFAULT_TEXT_SIZE = 13;

export function getStoredTextSize(): number {
  try {
    const saved = Number(localStorage.getItem(TEXT_SIZE_STORAGE_KEY));
    if ((TEXT_SIZES as readonly number[]).includes(saved)) return saved;
  } catch {}
  return DEFAULT_TEXT_SIZE;
}

export function storeTextSize(size: number): void {
  try {
    localStorage.setItem(TEXT_SIZE_STORAGE_KEY, String(size));
  } catch {}
}

/** The next size up or down the scale, clamped at either end. */
export function stepTextSize(size: number, direction: 1 | -1): number {
  const index = TEXT_SIZES.findIndex(s => s >= size);
  const current = index === -1 ? TEXT_SIZES.length - 1 : index;
  const next = Math.max(0, Math.min(TEXT_SIZES.length - 1, current + direction));
  return TEXT_SIZES[next];
}
