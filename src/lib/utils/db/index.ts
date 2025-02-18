import { Command } from '@tauri-apps/plugin-shell';

export async function create_pocketbase_superuser(email: string, pass: string) {
  console.log(`create_pocketbase_superuser email: ${email}`);
  const command = Command.sidecar('binaries/pocketbase', [
    'superuser',
    'create',
    email,
    pass,
  ]);
  console.log(`create_pocketbase_superuser command: ${JSON.stringify(command, null, 2)}`);
  const output = await command.execute();
  console.log(`create_pocketbase_superuser output: ${JSON.stringify(output, null, 2)}`);
}

export async function run_pocketbase_server() {
  console.log('run_pocketbase_server');
  const command = Command.sidecar('binaries/pocketbase', [
    'serve',
  ]);
  console.log(`run_pocketbase_server command: ${JSON.stringify(command, null, 2)}`);

  const output = await command.execute();
  console.log(`run_pocketbase_server output: ${JSON.stringify(output, null, 2)}`);
}