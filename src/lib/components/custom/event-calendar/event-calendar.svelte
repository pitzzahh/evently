<script lang="ts">
	import { createElement } from 'react';
	import { createRoot } from 'react-dom/client';
	import './event-calendar.css';
	import { EventCalendar } from '../react-event-calendar/components';
	import type { EventCalendarProps } from '../react-event-calendar/components/event-calendar';
	import { goto } from '$app/navigation';

	let props: EventCalendarProps = $props();
	let rootEl: HTMLElement;

	$effect(() => {
		const root = createRoot(rootEl);
		const event_calendar = createElement(EventCalendar, {
			...{
				...props,
				onViewEvent: (event_id: string) => {
					goto(`/events/${event_id}`, { replaceState: true });
				}
			}
		});
		root.render(event_calendar);

		return () => root.unmount();
	});
</script>

<div bind:this={rootEl}></div>
