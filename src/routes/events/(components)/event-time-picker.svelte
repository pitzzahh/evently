<script lang="ts">

	
</script>

<div class="flex w-full gap-2">
	<div class="flex w-full items-center gap-2 rounded-lg bg-gray-700/10 p-4 dark:bg-white/10">
		{@render start_end_pattern()}

		<div class="flex w-full flex-col gap-1">
			<!-- START -->
			{@render time_period({ title: 'AM Start', date: 'Thu, Feb 20', time: '12:30 PM' })}
			<!-- END -->
			{@render time_period({ title: 'AM End', date: 'Thu, Feb 20', time: '12:30 PM' })}
		</div>
	</div>
	<div class="flex w-full items-center gap-2 rounded-lg bg-gray-700/10 p-4 dark:bg-white/10">
		{@render start_end_pattern()}

		<div class="flex w-full flex-col gap-1">
			<!-- START -->
			{@render time_period({ title: 'PM Start', date: 'Thu, Feb 20', time: '12:30 PM' })}
			<!-- END -->
			{@render time_period({ title: 'PM End', date: 'Thu, Feb 20', time: '12:30 PM' })}
		</div>
	</div>
</div>

{#snippet time_period({ title, date, time }: { title: string; date: string; time: string })}
	<div class="flex items-center justify-between">
		<p class="text-sm text-muted-foreground">{title}</p>
		<div class="flex items-center gap-1">
			<p class="rounded-bl-sm rounded-tl-sm bg-background p-2 text-sm">{date}</p>
			<p class="rounded-br-sm rounded-tr-sm bg-background p-2 text-sm">{time}</p>
		</div>
	</div>
{/snippet}

{#snippet start_end_pattern()}
	<div class="flex flex-col items-center gap-1">
		<div class="size-3 rounded-full border bg-gray-400"></div>
		<div class="h-6 border-s-2 border-dashed border-gray-400"></div>
		<div class="size-3 rounded-full border border-gray-400"></div>
	</div>
{/snippet}
