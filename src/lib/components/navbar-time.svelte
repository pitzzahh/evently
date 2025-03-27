<script lang="ts">
	import { formatDateToTimeOption } from '@/utils/format';

	let date = $state(new Date());

	$effect(() => {
		const intervalId = setInterval(() => {
			date = new Date();
		}, 1000 * 6);

		return () => {
			clearInterval(intervalId);
		};
	});
</script>

<p class="text-sm font-semibold text-muted-foreground">
	{formatDateToTimeOption(date)}
</p>
