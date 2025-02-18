import { Command } from '@tauri-apps/plugin-shell';

export async function create_pocketbase_superuser(email: string, pass: string) {
  console.log('create_pocketbase_superuser email:', email);
  const command = Command.sidecar('binaries/pocketbase', [
    'superuser',
    'create',
    email,
    pass,
  ]);
  console.log('create_pocketbase_superuser command:', command);
  const output = await command.execute();
  console.log('create_pocketbase_superuser output:', output);
}

export async function run_pocketbase_server() {
  console.log('run_pocketbase_server');
  const command = Command.sidecar('binaries/pocketbase', [
    'serve',
  ]);
  console.log('run_pocketbase_server command:', command);
  const output = await command.execute();
  console.log('run_pocketbase_server output:', output);
}