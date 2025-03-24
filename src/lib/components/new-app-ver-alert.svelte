<script lang="ts">
	import * as Alert from '$lib/components/ui/alert/index.js';
	import { AlertCircle, RefreshCw, Terminal } from 'lucide-svelte';
	import Button from '@/components/ui/button/button.svelte';
</script>

<Alert.Root
	variant="default"
	class="border-amber-500 bg-amber-50 dark:border-amber-700 dark:bg-amber-500/5"
>
	<AlertCircle class="size-4 text-amber-800 dark:text-amber-300" />
	<Alert.Title class="text-base text-amber-800 dark:text-amber-300">Update Available!</Alert.Title>
	<div class="flex items-center justify-between">
		<Alert.Description>A new version 1.23.4 of the application is available.</Alert.Description>
		<Button
			size="sm"
			variant="outline"
			class="border-amber-500 text-amber-700 hover:bg-amber-100 dark:text-amber-200 dark:hover:bg-amber-900 dark:hover:text-amber-100"
		>
			<RefreshCw className="mr-2 h-4 w-4" />
			Update Now
		</Button>
	</div>
</Alert.Root>
