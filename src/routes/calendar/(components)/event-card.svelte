<script lang="ts">
	import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
	import { Badge } from "$lib/components/ui/badge";
	import type { CalendarEvent } from "@routes/calendar/(data)/types";

	type Props = {
		event: CalendarEvent;
		badgeVariant?: "default" | "secondary" | "destructive";
	};

	let { event, badgeVariant = "default" }: Props = $props();
</script>

<Card>
	<CardHeader class="p-4">
		<div class="flex items-center justify-between">
			<CardTitle class="text-base">{event.title}</CardTitle>
			<Badge variant={badgeVariant}>{event.type}</Badge>
		</div>
		<CardDescription>{event.description}</CardDescription>
	</CardHeader>
</Card>
