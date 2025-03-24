import { check, Update } from '@tauri-apps/plugin-updater';
import { relaunch } from '@tauri-apps/plugin-process';

/**
 * Check for updates and return the update object if available.
 * @returns {Promise<Update | null>} The update object or null if no update is available.
 */
export async function checkForUpdates(): Promise<Update | null> {
  return await check();
}

/**
 * Check for updates and install them if available.
 * @param _relaunch Whether to relaunch the app after installing the update.
 * @param _progress A callback function to update the progress of the download.
 * @returns void
 */
export async function installUpdate(update: Update, _relaunch: boolean, _progress: (progress: number) => void, _onFinished?: () => void) {
  let downloaded = 0;
  let contentLength = 0;
  await update.downloadAndInstall((event) => {
    switch (event.event) {
      case 'Started':
        contentLength = event.data.contentLength ?? 0;
        break;
      case 'Progress':
        downloaded += event.data.chunkLength;
        _progress && _progress((downloaded / contentLength) * 100);
        break;
      case 'Finished':
        break;
    }
  });
  if (_relaunch) {
    _onFinished?.();
    await relaunch();
  }
}