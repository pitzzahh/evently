<script lang="ts" module>
	export type UpdaterProps = {
		title: string;
		dismiss: boolean;
		description: string;
	};
</script>

<script lang="ts">
	import { Button } from '@/components/ui/button';
	import { X } from 'lucide-svelte';

	let { title, dismiss = $bindable(false), description }: UpdaterProps = $props();
</script>

<section class="w-full border-b bg-white px-4 py-3 shadow-sm">
	<div class="flex items-center justify-between gap-2">
		<div class="flex-1 text-center">
			<span class="text-sm">
				<span class="font-medium">{title}</span>
				<span class="text-muted-foreground">
					{description}
					.
				</span>
			</span>
		</div>

		<Button
			variant="ghost"
			size="icon"
			class="-mr-2 h-8 w-8 flex-none"
			onclick={() => (dismiss = true)}
		>
			<X class="h-4 w-4" />
		</Button>
	</div>
</section>
