import { getEnv } from "@/utils/invokes";

export async function load() {
  console.log('page.ts load')
  return {
    notes: [],
    POCKETBASE_INSTANCE: await getEnv('POCKETBASE_INSTANCE')
  }
}

