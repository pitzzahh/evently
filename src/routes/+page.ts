import { create_pocketbase_superuser, run_pocketbase_server } from "@/utils/db";
import { getEnv } from "@/utils/invokes";
import { error } from "@sveltejs/kit";

export async function load() {
  const email = await getEnv('ADMIN_EMAIL');
  const pass = await getEnv('ADMIN_PASS');
  console.log(`ADMIN_EMAIL: ${email}\nADMIN_PASS: ${pass}`);
  if (!email || !pass) {
    error(404, 'ADMIN_EMAIL or ADMIN_PASS not set in environment variables');
  }
  await run_pocketbase_server();
  await create_pocketbase_superuser(email, pass);
  return {
    notes: []
  }
}

