<script lang="ts">
	import { svelteReactivityAdapter } from '@/db/adapter/index.svelte';
	import { Collection } from '@signaldb/core';
	import createOPFSAdapter from '@signaldb/opfs';

	const Posts = new Collection({
		persistence: createOPFSAdapter('posts.json'),
		reactivity: svelteReactivityAdapter()
	});

	let items: any[] = $state.raw([]);

	function remove(id: string) {
		Posts.removeOne({
			id
		});
	}

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
			<button onclick={() => remove(post.id)}>Delete</button>
		</li>
	{/each}
</ul>
