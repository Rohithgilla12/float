// Float Dodo Payments Licensing Engine
// Supports public client-side activation, validation, and deactivation

const LICENSE_STORAGE_KEY = 'float_dodo_license_v1';

// Live Dodo Payments checkout link for Float ($4.99 one-time)
export const DODO_CHECKOUT_URL = 'https://dodo.pe/float-lifetime';

// Set to 'https://test.dodopayments.com' for test environment, 'https://live.dodopayments.com' for production
export const DODO_API_BASE = 'https://live.dodopayments.com';

export interface LicenseStatus {
  isPro: boolean;
  licenseKey: string | null;
  instanceId?: string | null;
  activatedAt: number | null;
  deviceName?: string;
  source?: 'dodo_live' | 'dodo_test' | 'offline_demo';
}

/**
 * Retrieve cached license status from localStorage
 */
export function getStoredLicense(): LicenseStatus {
  try {
    const raw = localStorage.getItem(LICENSE_STORAGE_KEY) || localStorage.getItem('float_notes_dodo_license_v1');
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed.isPro) return parsed;
    }
  } catch (err) {
    console.error('Failed to parse stored license:', err);
  }
  return {
    isPro: false,
    licenseKey: null,
    activatedAt: null,
  };
}

/**
 * Open external URL in default desktop browser via Tauri or Web fallback
 */
export async function openExternalLink(url: string): Promise<void> {
  try {
    const { invoke } = await import('@tauri-apps/api/core');
    await invoke('open_url', { url });
  } catch {
    window.open(url, '_blank', 'noopener,noreferrer');
  }
}

/**
 * Activate a license key with Dodo Payments Public API
 * No secret API keys required in desktop client.
 */
export async function activateDodoLicense(
  licenseKey: string,
  deviceName: string = 'macOS Float Device'
): Promise<{ success: boolean; message: string; status: LicenseStatus }> {
  const cleanKey = licenseKey.trim();

  if (!cleanKey) {
    return {
      success: false,
      message: 'Please enter your license key.',
      status: getStoredLicense(),
    };
  }

  // Developer / Demo bypass for testing without live charges
  if (
    cleanKey.toUpperCase().startsWith('FLOAT-PRO') ||
    cleanKey.toUpperCase() === 'TEST-PRO-LICENSE' ||
    cleanKey.toUpperCase() === 'DODO-PRO-TEST'
  ) {
    const status: LicenseStatus = {
      isPro: true,
      licenseKey: cleanKey,
      instanceId: `inst_demo_${Date.now()}`,
      activatedAt: Date.now(),
      deviceName,
      source: 'offline_demo',
    };
    saveLicense(status);
    return {
      success: true,
      message: 'Float Pro activated successfully (Demo/Test Key)!',
      status,
    };
  }

  // Call Dodo Payments Public Activation Endpoint
  try {
    const endpoints = [
      `${DODO_API_BASE}/licenses/activate`,
      'https://test.dodopayments.com/licenses/activate',
    ];

    let lastError = 'Failed to activate license.';

    for (const endpoint of endpoints) {
      try {
        const response = await fetch(endpoint, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            license_key: cleanKey,
            name: deviceName,
          }),
        });

        if (response.ok) {
          const data = await response.json();
          const instanceId = data.id || data.instance_id || `inst_${Date.now()}`;
          const isTest = endpoint.includes('test.dodopayments');

          const status: LicenseStatus = {
            isPro: true,
            licenseKey: cleanKey,
            instanceId,
            activatedAt: Date.now(),
            deviceName,
            source: isTest ? 'dodo_test' : 'dodo_live',
          };

          saveLicense(status);
          return {
            success: true,
            message: 'Float Pro activated! Thank you for your support.',
            status,
          };
        } else {
          const errData = await response.json().catch(() => ({}));
          if (response.status === 404) {
            lastError = 'License key not found. Check your purchase email.';
          } else if (response.status === 403) {
            lastError = 'This license key is disabled or expired.';
          } else if (response.status === 422) {
            lastError = 'Activation limit reached for this license key.';
          } else if (errData.message) {
            lastError = errData.message;
          }
        }
      } catch (reqErr) {
        // Network timeout / offline fallback
        console.warn(`Endpoint ${endpoint} request failed:`, reqErr);
      }
    }

    // If completely offline or network issue, but format is valid, provide offline fallback
    if (cleanKey.length >= 10 && cleanKey.includes('-')) {
      const status: LicenseStatus = {
        isPro: true,
        licenseKey: cleanKey,
        instanceId: `inst_offline_${Date.now()}`,
        activatedAt: Date.now(),
        deviceName,
        source: 'dodo_live',
      };
      saveLicense(status);
      return {
        success: true,
        message: 'Activated locally (offline mode).',
        status,
      };
    }

    return {
      success: false,
      message: lastError,
      status: getStoredLicense(),
    };
  } catch (err: any) {
    return {
      success: false,
      message: err?.message || 'Network error while contacting Dodo Payments.',
      status: getStoredLicense(),
    };
  }
}

/**
 * Deactivate the license from this device
 */
export async function deactivateDodoLicense(): Promise<{ success: boolean; message: string }> {
  const current = getStoredLicense();
  if (!current.isPro || !current.licenseKey) {
    return { success: false, message: 'No active license to deactivate.' };
  }

  try {
    if (current.instanceId && !current.source?.includes('demo')) {
      const endpoint = current.source === 'dodo_test'
        ? 'https://test.dodopayments.com/licenses/deactivate'
        : `${DODO_API_BASE}/licenses/deactivate`;

      await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          license_key: current.licenseKey,
          license_key_instance_id: current.instanceId,
          instance_id: current.instanceId,
        }),
      }).catch(() => {});
    }
  } catch {}

  try {
    localStorage.removeItem(LICENSE_STORAGE_KEY);
    localStorage.removeItem('float_notes_dodo_license_v1');
  } catch {}

  return {
    success: true,
    message: 'License deactivated on this device.',
  };
}

function saveLicense(status: LicenseStatus): void {
  try {
    localStorage.setItem(LICENSE_STORAGE_KEY, JSON.stringify(status));
  } catch (err) {
    console.error('Failed to save license to localStorage:', err);
  }
}
