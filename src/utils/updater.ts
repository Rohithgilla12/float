export interface AvailableUpdate {
  version: string;
  notes: string;
  install: (onProgress: (fraction: number) => void) => Promise<void>;
}

export type UpdateCheck =
  | { kind: 'unsupported' }
  | { kind: 'up-to-date'; version: string }
  | { kind: 'available'; update: AvailableUpdate }
  | { kind: 'error'; message: string };

export const isTauri = typeof window !== 'undefined' && '__TAURI_INTERNALS__' in window;

export async function checkForUpdates(): Promise<UpdateCheck> {
  if (!isTauri) return { kind: 'unsupported' };
  try {
    const [{ check }, { getVersion }] = await Promise.all([
      import('@tauri-apps/plugin-updater'),
      import('@tauri-apps/api/app'),
    ]);
    const update = await check();
    if (!update) return { kind: 'up-to-date', version: await getVersion() };

    return {
      kind: 'available',
      update: {
        version: update.version,
        notes: update.body ?? '',
        install: async onProgress => {
          let total = 0;
          let received = 0;
          await update.downloadAndInstall(event => {
            if (event.event === 'Started') total = event.data.contentLength ?? 0;
            if (event.event === 'Progress') {
              received += event.data.chunkLength;
              if (total > 0) onProgress(Math.min(received / total, 1));
            }
            if (event.event === 'Finished') onProgress(1);
          });
          const { relaunch } = await import('@tauri-apps/plugin-process');
          await relaunch();
        },
      },
    };
  } catch (err) {
    return { kind: 'error', message: err instanceof Error ? err.message : String(err) };
  }
}

export async function currentVersion(): Promise<string> {
  if (!isTauri) return 'web';
  try {
    const { getVersion } = await import('@tauri-apps/api/app');
    return await getVersion();
  } catch {
    return 'unknown';
  }
}
