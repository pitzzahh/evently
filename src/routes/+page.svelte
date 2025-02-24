<script lang="ts">
	import { Collection } from '@signaldb/core';

	class Post {
		authorId!: string;
		_id!: string;

		constructor(data: any) {
			Object.assign(this, data);
		}

		getAuthor() {
			return Users.findOne({ _id: this.authorId });
		}

		getComments() {
			return Comments.find({ postId: this._id });
		}
	}

	class Comment {
		authorId!: string;

		constructor(data: any) {
			Object.assign(this, data);
		}

		getAuthor() {
			return Users.findOne(this.authorId);
		}
	}

	class User {
		_id!: string;

		constructor(data: any) {
			Object.assign(this, data);
		}

		getPosts() {
			return Posts.find({ authorId: this._id });
		}
	}

	const Posts = new Collection({ name: 'posts', transform: (item) => new Post(item) });
	const Users = new Collection({ name: 'users', transform: (item) => new User(item) });
	const Comments = new Collection({ name: 'comments', transform: (item) => new Comment(item) });

	let newPostContent = $state('');

	function addPost() {
		const newPost = new Post({
			authorId: 'author1',
			_id: Date.now().toString(),
			content: newPostContent
		});
		Posts.insert(newPost);
		newPostContent = '';
		console.log('Post added:', newPost);
		posts.push(newPost);
	}

	const posts = $derived<Post[]>(Posts.find().fetch());
</script>

<form onsubmit={addPost}>
	<input type="text" bind:value={newPostContent} placeholder="Write a new post..." />
	<button type="submit">Add Post</button>
</form>

<ul>
	{#each posts as post}
		<li>{JSON.stringify(post, null, 2)}</li>
	{/each}
</ul>
