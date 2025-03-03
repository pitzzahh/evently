<script lang="ts">
	import { Badge } from '@/components/ui/badge';
	import type { BadgeVariant } from '@/components/ui/badge';

	interface Props {
		value: boolean | string | number | null;
		variant?: BadgeVariant;
	}

	let { value, variant = 'default' }: Props = $props();
</script>

<Badge {variant} class="text-ellipsis whitespace-nowrap">{value}</Badge>
