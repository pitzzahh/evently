<script lang="ts">
	import { Badge } from "@/components/ui/badge";
	import type { BadgeVariant } from "@/components/ui/badge";

	interface Props {
		value: boolean | string | number | null;
		variant?: BadgeVariant;
	}

	let { value, variant = "default" }: Props = $props();
</script>

<Badge {variant} class="whitespace-nowrap text-ellipsis">{value}</Badge>
