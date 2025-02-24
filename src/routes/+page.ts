// import { create_pocketbase_superuser, run_pocketbase_server } from "@/utils/db";
// import { getEnv } from "@/utils/invokes";
// import { error } from "@sveltejs/kit";

// export async function load() {
//   console.log('page.ts load')
//   const email = await getEnv('ADMIN_EMAIL');
//   const pass = await getEnv('ADMIN_PASSWORD');
//   console.log(`ADMIN_EMAIL: ${email}\nADMIN_PASSWORD: ${pass}`);
//   if (!email || !pass) {
//     error(404, 'ADMIN_EMAIL or ADMIN_PASS not set in environment variables');
//   }
//   await run_pocketbase_server();
//   await create_pocketbase_superuser(email, pass);
//   return {
//     notes: [],
//     POCKETBASE_INSTANCE: await getEnv('POCKETBASE_INSTANCE')
//   }
// }

