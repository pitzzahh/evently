import type { WebviewLabel, WebviewOptions } from "@tauri-apps/api/webview";
import { WebviewWindow } from "@tauri-apps/api/webviewWindow";

interface WindowOptions {
  url: string;
  target?: '_blank' | '_self' | '_parent' | '_top';
  features?: {
    toolbar?: boolean;
    location?: boolean;
    directories?: boolean;
    status?: boolean;
    menubar?: boolean;
    scrollbars?: boolean;
    resizable?: boolean;
    copyhistory?: boolean;
    width?: number;
    height?: number;
  };
}

export function newWindow(options: WindowOptions) {
  if (!window) return;

  const features = options.features ?? {};
  const featureString = Object.entries({
    toolbar: false,
    location: false,
    directories: false,
    status: false,
    menubar: false,
    scrollbars: true,
    resizable: false,
    copyhistory: true,
    width: 900,
    height: 700,
    ...features
  }).map(([key, value]) => `${key}=${value}`).join(', ');

  window.open(options.url, options.target ?? '_blank', featureString);
}

export async function newWebViewWindow(label: WebviewLabel, options?: Omit<WebviewOptions, 'x' | 'y' | 'width' | 'height'>) {
  // Sanitize the label
  const sanitizedLabel = label.replace(/[^a-zA-Z0-9\-\/:_]/g, '');

  const existingWindow = await WebviewWindow.getByLabel(sanitizedLabel);
  if (existingWindow) {
    existingWindow.close();
  }
  const webview_window = new WebviewWindow(sanitizedLabel, options);
  webview_window.once('tauri://created', () => {
    console.log('Webview window created:', sanitizedLabel);
  });
  webview_window.once('tauri://error', (event) => {
    console.error('Error creating webview window:', sanitizedLabel, event);
  });
  return webview_window;
}