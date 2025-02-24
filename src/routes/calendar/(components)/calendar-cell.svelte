<script lang="ts">
	import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
	import { Badge } from "@/components/ui/badge";
	import type { CalendarDate } from "@internationalized/date";
	import type { CalendarEvent } from "@routes/calendar/(data)/types";

	type Props = {
		date: CalendarDate;
		currentMonth: number;
		events: CalendarEvent[];
	};

	let { date, currentMonth, events }: Props = $props();

	// Style based on if date is in current month
	const isCurrentMonth = $derived(() => date.month === currentMonth);

	// Event type colors
	const typeColors = {
		meeting: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200",
		event: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200",
		workshop: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200",
	};
</script>

<div class={["min-h-[120px] bg-background p-2 border-b border-r", !isCurrentMonth && "bg-muted/50"]}>
	<div class={["font-medium mb-1", !isCurrentMonth && "text-muted-foreground"]}>
		{date.day}
	</div>

	<!-- Events -->
	<div class="space-y-1">
		{#each events.slice(0, 3) as event}
			<TooltipProvider>
				<Tooltip>
					<TooltipTrigger class="w-full text-left">
						<div class={["text-xs px-1.5 py-0.5 rounded truncate", typeColors[event.type]]}>
							{event.time}
							{event.title}
						</div>
					</TooltipTrigger>
					<TooltipContent>
						<div class="text-sm">
							<p class="font-semibold">{event.title}</p>
							<p class="text-xs text-muted-foreground">{event.time}</p>
							<p class="text-xs">{event.description}</p>
						</div>
					</TooltipContent>
				</Tooltip>
			</TooltipProvider>
		{/each}

		{#if events.length > 3}
			<div class="text-xs text-muted-foreground px-1.5">
				+{events.length - 3} more
			</div>
		{/if}
	</div>
</div>
