import { create_pocketbase_superuser, run_pocketbase_server } from "@/utils/db";
import { getEnv } from "@/utils/invokes";
import { error } from "@sveltejs/kit";

export const prerender = true;
export const ssr = false;

export async function load() {
  const email = await getEnv('ADMIN_EMAIL');
  const pass = await getEnv('ADMIN_PASS');
  if (!email || !pass) {
    error(404, 'ADMIN_EMAIL or ADMIN_PASS not set in environment variables');
  }
  await create_pocketbase_superuser(email, pass);
  await run_pocketbase_server();
}