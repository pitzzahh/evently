import { getCurrentWebview, type WebviewLabel, type WebviewOptions } from "@tauri-apps/api/webview"
import { WebviewWindow } from '@tauri-apps/api/webviewWindow';
import type { WindowOptions } from "@tauri-apps/api/window";

export function newWindow(label: WebviewLabel = 'New Window', options?: Omit<WebviewOptions, 'x' | 'y' | 'width' | 'height'> & WindowOptions) {
  const webView = new WebviewWindow(label, {
    ...options,
    parent: getCurrentWebview().window
  });
  webView.once('tauri://created', function () {
    console.log('tauri://created');
  });
  webView.once('tauri://error', function (e) {
    console.error('tauri://error', e);
  });
  webView.center();
}