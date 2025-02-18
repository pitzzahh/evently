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