import { Command } from '@tauri-apps/plugin-shell';

export async function create_pocketbase_superuser(email: string, pass: string) {
  // notice that the args array matches EXACTLY what is specified in `capabilities/default.json`.
  const command = Command.sidecar('binaries/pocketbase', [
    'superuser',
    'create',
    email,
    pass,
  ]);
  const output = await command.execute();
  console.log('create_pocketbase_superuser output:', output);
}

export async function run_pocketbase_server() {
  const command = Command.sidecar('binaries/pocketbase', [
    'serve',
  ]);
  const output = await command.execute();
  console.log('run_pocketbase_server output:', output);
}