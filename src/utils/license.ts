import { ThemeId } from '../types/theme';

const LICENSE_STORAGE_KEY = 'float_dodo_license_v1';
const LEGACY_LICENSE_KEY = 'float_notes_dodo_license_v1';
const REVALIDATE_AFTER_MS = 7 * 24 * 60 * 60 * 1000;

export const DODO_CHECKOUT_URL = 'https://dodo.pe/float-lifetime';
export const PRO_PRICE = '$4.99';

const DODO_ENDPOINTS = {
  dodo_live: 'https://live.dodopayments.com',
  dodo_test: 'https://test.dodopayments.com',
} as const;

type DodoSource = keyof typeof DODO_ENDPOINTS;

export interface LicenseStatus {
  isPro: boolean;
  licenseKey: string | null;
  instanceId?: string | null;
  activatedAt: number | null;
  lastValidatedAt?: number | null;
  deviceName?: string;
  source?: DodoSource | 'offline_demo';
}

export const FREE_LICENSE: LicenseStatus = { isPro: false, licenseKey: null, activatedAt: null };

export type ProFeature =
  | 'themes'
  | 'notes'
  | 'image-cards'
  | 'ghost'
  | 'zen'
  | 'folder';

export const FREE_NOTE_LIMIT = 3;
export const FREE_THEMES: ThemeId[] = ['obsidian', 'latte'];

export const PRO_FEATURES: Record<ProFeature, { title: string; detail: string }> = {
  themes: { title: 'All six themes', detail: 'Mocha, Paper, Sonoma, and Monastic join Obsidian and Latte.' },
  notes: { title: 'Unlimited notes', detail: `Free keeps ${FREE_NOTE_LIMIT} tabs. Pro removes the limit.` },
  'image-cards': { title: 'Image cards', detail: 'Export any note as a 2x PNG card with ⌘⇧E.' },
  ghost: { title: 'Ghost mode', detail: 'Lower the window opacity to see what is behind it.' },
  zen: { title: 'Zen mode', detail: 'Hide every control and keep only the page.' },
  folder: { title: 'Custom notes folder', detail: 'Point Float at an Obsidian vault or any folder you like.' },
};

export function isThemeUnlocked(theme: ThemeId, isPro: boolean): boolean {
  return isPro || FREE_THEMES.includes(theme);
}

export function getStoredLicense(): LicenseStatus {
  try {
    const raw = localStorage.getItem(LICENSE_STORAGE_KEY) || localStorage.getItem(LEGACY_LICENSE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as LicenseStatus;
      if (parsed.isPro && parsed.licenseKey) return parsed;
    }
  } catch (err) {
    console.error('Failed to parse stored license:', err);
  }
  return FREE_LICENSE;
}

function saveLicense(status: LicenseStatus): void {
  try {
    localStorage.setItem(LICENSE_STORAGE_KEY, JSON.stringify(status));
    localStorage.removeItem(LEGACY_LICENSE_KEY);
  } catch (err) {
    console.error('Failed to save license:', err);
  }
}

function clearLicense(): void {
  try {
    localStorage.removeItem(LICENSE_STORAGE_KEY);
    localStorage.removeItem(LEGACY_LICENSE_KEY);
  } catch {}
}

export async function openExternalLink(url: string): Promise<void> {
  try {
    const { invoke } = await import('@tauri-apps/api/core');
    await invoke('open_url', { url });
  } catch {
    window.open(url, '_blank', 'noopener,noreferrer');
  }
}

interface ActivationResult {
  success: boolean;
  message: string;
  status: LicenseStatus;
}

async function postJson(url: string, body: unknown): Promise<Response> {
  return fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
}

function activationError(response: Response, data: { message?: string }): string {
  if (response.status === 404) return 'That key was not found. Check the email from Dodo Payments.';
  if (response.status === 403) return 'This key has been disabled or has expired.';
  if (response.status === 422) return 'This key has reached its activation limit. Deactivate another Mac first.';
  return data.message || 'Dodo Payments rejected the key.';
}

export async function activateDodoLicense(
  licenseKey: string,
  deviceName: string = 'Float on macOS'
): Promise<ActivationResult> {
  const cleanKey = licenseKey.trim();
  if (!cleanKey) {
    return { success: false, message: 'Enter your licence key.', status: getStoredLicense() };
  }

  if (import.meta.env.DEV && cleanKey.toUpperCase() === 'FLOAT-DEV-PRO') {
    const status: LicenseStatus = {
      isPro: true,
      licenseKey: cleanKey,
      instanceId: 'inst_dev',
      activatedAt: Date.now(),
      lastValidatedAt: Date.now(),
      deviceName,
      source: 'offline_demo',
    };
    saveLicense(status);
    return { success: true, message: 'Dev licence active.', status };
  }

  let lastError = 'Could not reach Dodo Payments. Check your connection and try again.';

  const sources: DodoSource[] = import.meta.env.DEV ? ['dodo_live', 'dodo_test'] : ['dodo_live'];
  for (const source of sources) {
    try {
      const response = await postJson(`${DODO_ENDPOINTS[source]}/licenses/activate`, {
        license_key: cleanKey,
        name: deviceName,
      });
      const data = await response.json().catch(() => ({}));
      if (response.ok) {
        const status: LicenseStatus = {
          isPro: true,
          licenseKey: cleanKey,
          instanceId: data.id || null,
          activatedAt: Date.now(),
          lastValidatedAt: Date.now(),
          deviceName,
          source,
        };
        saveLicense(status);
        return { success: true, message: 'Float Pro is active. Thank you.', status };
      }
      lastError = activationError(response, data);
      if (response.status !== 404) break;
    } catch (err) {
      console.warn(`Activation against ${source} failed:`, err);
    }
  }

  return { success: false, message: lastError, status: getStoredLicense() };
}

export async function deactivateDodoLicense(): Promise<{ success: boolean; message: string }> {
  const current = getStoredLicense();
  if (!current.isPro || !current.licenseKey) {
    return { success: false, message: 'No licence is active on this Mac.' };
  }

  if (current.instanceId && current.source && current.source !== 'offline_demo') {
    await postJson(`${DODO_ENDPOINTS[current.source]}/licenses/deactivate`, {
      license_key: current.licenseKey,
      license_key_instance_id: current.instanceId,
    }).catch(() => {});
  }

  clearLicense();
  return { success: true, message: 'Licence released. You can activate it on another Mac.' };
}

/**
 * Re-checks a stored licence with Dodo once a week. Network failures keep the
 * current state; only an explicit "valid: false" revokes it.
 */
export async function revalidateStoredLicense(): Promise<LicenseStatus> {
  const current = getStoredLicense();
  if (!current.isPro || !current.licenseKey || current.source === 'offline_demo') return current;
  if (!current.source) return current;

  const last = current.lastValidatedAt ?? current.activatedAt ?? 0;
  if (Date.now() - last < REVALIDATE_AFTER_MS) return current;

  try {
    const response = await postJson(`${DODO_ENDPOINTS[current.source]}/licenses/validate`, {
      license_key: current.licenseKey,
      license_key_instance_id: current.instanceId ?? null,
    });
    if (!response.ok) return current;
    const data = (await response.json()) as { valid?: boolean };
    if (data.valid === false) {
      clearLicense();
      return FREE_LICENSE;
    }
    const refreshed = { ...current, lastValidatedAt: Date.now() };
    saveLicense(refreshed);
    return refreshed;
  } catch {
    return current;
  }
}
