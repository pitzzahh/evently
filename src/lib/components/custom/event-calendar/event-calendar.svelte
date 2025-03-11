<script lang="ts">
	import { createElement } from 'react';
	import { createRoot } from 'react-dom/client';
	import './event-calendar.css';
	import moment from 'moment';

	let props: any = $props();
	let rootEl: HTMLElement;

	$effect(() => {
		const root = createRoot(rootEl);

		import('react-big-calendar').then(({ Calendar }) => {
			const event_calendar = createElement(Calendar, { ...props });
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
