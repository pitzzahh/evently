import { createPersistenceAdapter, createReactivityAdapter } from '@signaldb/core';
import { open, BaseDirectory, watch, exists, readFile, writeFile } from '@tauri-apps/plugin-fs';

export function createTauriFilesystemAdapter(filename: string) {
	return createPersistenceAdapter({
		async register(onChange) {
			console.info(`registering filesystem adapter for ${filename}`);
			const fileExists = await exists(filename, { baseDir: BaseDirectory.AppLocalData });
			console.info(`file exists: ${fileExists}`);
			if (!fileExists)
				return writeFile(filename, new Uint8Array([]), { baseDir: BaseDirectory.AppLocalData });
			// Watch for changes in the file
			watch(
				filename,
				async () => {
					console.info(`filesystem change detected ${filename}`);
					await onChange();
				},
				{ baseDir: BaseDirectory.AppLocalData }
			);
			console.info(`registered filesystem adapter for ${filename}`);
		},
		async load() {
			console.info(`loading from filesystem ${filename}`);
			const fileExists = await exists(filename, { baseDir: BaseDirectory.AppLocalData });
			if (!fileExists) return { items: [] };
			const contents = await readFile(filename, { baseDir: BaseDirectory.AppLocalData });
			const items = JSON.parse(new TextDecoder().decode(contents));
			console.info(`loaded from filesystem: ${filename}, ${JSON.stringify(items, null, 2)}`);
			return { items };
		},
		async save(items) {
			console.info(`saving to filesystem: ${filename}, ${JSON.stringify(items, null, 2)}`);
			const file = await open(filename, {
				write: true,
				create: true,
				baseDir: BaseDirectory.AppLocalData
			});
			await file.truncate();
			await file.write(new TextEncoder().encode(JSON.stringify(items)));
			await file.close();
			console.info(`saved to filesystem: ${filename}, ${JSON.stringify(items, null, 2)}`);
		}
	});
}

export function svelteReactivityAdapter() {
  // Check if we're in a web worker
  //@ts-ignore
  const isWebWorker = typeof self !== 'undefined' && typeof WorkerGlobalScope !== 'undefined' && self instanceof WorkerGlobalScope;

  if (isWebWorker) {
    // Web worker context, use a simple implementation
    return createReactivityAdapter({
      create() {
        return {
          depend() {
            // No-op in web worker
          },
          notify() {
            // No-op in web worker
          }
        };
      },
      isInScope: () => false // Not reactive in web worker
    });
  } else {
    // Regular context, use Svelte's reactivity primitives
    return createReactivityAdapter({
      create() {
        let dep = $state(0);
        return {
          depend() {
            dep;
          },
          notify() {
            dep += 1;
          }
        };
      },
      isInScope: () => !!$effect.tracking()
    });
  }
}

