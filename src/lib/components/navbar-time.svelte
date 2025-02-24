<script lang="ts">
	let date = $state(new Date());

	$effect(() => {
		const intervalId = setInterval(() => {
			date = new Date();
		}, 1000 * 6);

		return () => {
			clearInterval(intervalId);
		};
	});

	const timeOptions: Intl.DateTimeFormatOptions = {
		hour: '2-digit',
		minute: '2-digit',
		hour12: true
	};
</script>

<p class="text-sm font-semibold text-muted-foreground">
	{date.toLocaleTimeString(undefined, timeOptions)}
</p>
