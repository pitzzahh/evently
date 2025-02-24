<script lang="ts">
	import { Collection } from '@signaldb/core';

	const Posts = new Collection({
		reactivity: {
			create() {
				let dep = $state(0);
				return {
					depend() {
						dep;
					},
					notify() {
						dep += 1;
					}
				};
			},
			isInScope: () => !!$effect.tracking()
		}
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
