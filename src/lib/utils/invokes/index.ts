import { invoke } from "@tauri-apps/api/core";

export async function getEnv(key: string): Promise<string | null> {
  return await invoke("get_env_var", { key });
}

export async function create_pocketbase_superuser(email: string, password: string) {
  return await invoke("create_superuser", {
    email,
    password
  });
}

export async function run_pocketbase_server() {
  console.log('run_pocketbase_server');
  return await invoke("run_pocketbase_server");
}