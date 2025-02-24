<script lang="ts">
	import { createTauriFilesystemAdapter, svelteReactivityAdapter } from '@/db/adapter/index.svelte';
	import { Collection, combinePersistenceAdapters } from '@signaldb/core';
	const Posts = new Collection({
		persistence: createTauriFilesystemAdapter('posts.json'),
		reactivity: svelteReactivityAdapter()
	});

	let items: any[] = $state.raw([]);
	$effect(() => {
		const cursor = Posts.find({});
		items = cursor.fetch();

		return () => {
			cursor.cleanup();
		};
	});
</script>

<button onclick={() => Posts.insert({ title: 'Post', author: 'Author' })}> Add Post </button>

<ul>
	{#each items as post}
		<li>
			<strong>{post.title}</strong> by {post.author}
		</li>
	{/each}
</ul>
