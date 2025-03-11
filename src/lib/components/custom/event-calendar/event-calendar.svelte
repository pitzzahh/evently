<script lang="ts">
	import { createElement } from 'react';
	import { createRoot } from 'react-dom/client';
	import './event-calendar.css';

	import type { CalendarProps, Event as CalendarEvent } from 'react-big-calendar';
	let props: CalendarProps<object, object> = $props();
	let rootEl: HTMLElement;

	$effect(() => {
		const root = createRoot(rootEl);

		import('react-big-calendar').then(({ Calendar }) => {
			const event_calendar = createElement(Calendar, {
				...props
			});
			root.render(event_calendar);
		});

		return () => root.unmount();
	});
</script>

<div bind:this={rootEl} class="root"></div>

<style>
	.root {
		height: 100svh;
	}
</style>
