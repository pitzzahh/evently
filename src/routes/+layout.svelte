<script lang="ts">
	import '../app.css';
	import { ModeWatcher } from 'mode-watcher';
	import AppSidebar from '@/components/app-sidebar.svelte';
	import * as Breadcrumb from '@/components/ui/breadcrumb/index.js';
	import { Separator } from '@/components/ui/separator/index.js';
	import * as Sidebar from '@/components/ui/sidebar/index.js';
	import { warn, debug, trace, info, error } from '@tauri-apps/plugin-log';
	import { getEnv } from '@/utils/invokes';
	import { create_pocketbase_superuser, run_pocketbase_server } from '@/utils/db';
	import { onMount } from 'svelte';

	let { children } = $props();

	function forwardConsole(
		fnName: 'log' | 'debug' | 'info' | 'warn' | 'error',
		logger: (message: string) => Promise<void>
	) {
		const original = console[fnName];
		console[fnName] = (message) => {
			original(message);
			logger(message);
		};
	}

	forwardConsole('log', trace);
	forwardConsole('debug', debug);
	forwardConsole('info', info);
	forwardConsole('warn', warn);
	forwardConsole('error', error);

	onMount(async () => {
		console.log('tauri://create');
		const email = await getEnv('ADMIN_EMAIL');
		const pass = await getEnv('ADMIN_PASSWORD');
		console.log(`ADMIN_EMAIL: ${email}\nADMIN_PASSWORD: ${pass}`);
		if (!email || !pass) {
			throw new Error('ADMIN_EMAIL and ADMIN_PASSWORD must be set in the environment');
		}
		await run_pocketbase_server();
		await create_pocketbase_superuser(email, pass);
	});
</script>

<ModeWatcher />
<Sidebar.Provider>
	<AppSidebar />
	<Sidebar.Inset>
		<header
			class="flex h-16 shrink-0 items-center gap-2 transition-[width,height] ease-linear group-has-[[data-collapsible=icon]]/sidebar-wrapper:h-12"
		>
			<div class="flex items-center gap-2 px-4">
				<Sidebar.Trigger class="-ml-1" />
				<Separator orientation="vertical" class="mr-2 h-4" />
				<Breadcrumb.Root>
					<Breadcrumb.List>
						<Breadcrumb.Item class="hidden md:block">
							<Breadcrumb.Link href="#">Building Your Application</Breadcrumb.Link>
						</Breadcrumb.Item>
						<Breadcrumb.Separator class="hidden md:block" />
						<Breadcrumb.Item>
							<Breadcrumb.Page>Data Fetching</Breadcrumb.Page>
						</Breadcrumb.Item>
					</Breadcrumb.List>
				</Breadcrumb.Root>
			</div>
		</header>
		<div class="flex flex-1 flex-col gap-4 p-4 pt-0">
			{@render children()}
		</div>
	</Sidebar.Inset>
</Sidebar.Provider>
