import { Command } from '@tauri-apps/plugin-shell';

export async function create_pocketbase_superuser(email: string, pass: string) {
  console.log(`create_pocketbase_superuser email: ${email}`);
  const output = Command.create('binaries/pocketbase-x86_64-pc-windows-msvc', [
    'superuser',
    'create',
    email,
    pass,
  ]).execute()
  console.log(`create_pocketbase_superuser output: ${JSON.stringify(output, null, 2)}`);
}

export async function run_pocketbase_server() {
  console.log('run_pocketbase_server');
  const output = Command.create('binaries/pocketbase-x86_64-pc-windows-msvc', [
    'serve',
  ]).execute()
  console.log(`run_pocketbase_server output: ${JSON.stringify(output, null, 2)}`);
}