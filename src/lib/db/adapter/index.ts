import { createPersistenceAdapter } from '@signaldb/core'
import { open, BaseDirectory, watch, exists, readFile } from '@tauri-apps/plugin-fs'

export default function createTauriFilesystemAdapter(filename: string) {
  return createPersistenceAdapter({
    async register(onChange) {
      const file = await open(filename, { read: true, write: true, create: true, baseDir: BaseDirectory.AppLocalData })
      await file.close()

      // Watch for changes in the file
      await watch(filename, async () => {
        await onChange()
      }, { baseDir: BaseDirectory.AppLocalData })
    },
    async load() {
      const fileExists = await exists(filename, { baseDir: BaseDirectory.AppLocalData })
      if (!fileExists) return { items: [] }
      const contents = await readFile(filename, { baseDir: BaseDirectory.AppLocalData })
      const items = JSON.parse(new TextDecoder().decode(contents))
      return { items }
    },
    async save(items) {
      const file = await open(filename, { write: true, create: true, baseDir: BaseDirectory.AppLocalData })
      await file.truncate()
      await file.write(new TextEncoder().encode(JSON.stringify(items)))
      await file.close()
    },
  })
}