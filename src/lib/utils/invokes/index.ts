import { invoke } from "@tauri-apps/api/core";

export async function getEnv(key: string): Promise<string | null> {
  return await invoke("get_env_var", { key });
}